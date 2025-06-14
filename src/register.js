// 女仆模组 KubeJS 兼容示例文件
// 女仆模组也提供了一些注册内容，比如饰品、工作模式、提示文本等

// 注册饰品
// 第二个参数可以不写，里面是 tick 回调函数，当女仆穿戴此饰品时，每 tick 会执行里面的方法
// 这个返回值就是饰品对象，可以存起来，用于其他事件当中（因为寻找饰品需要这个参数）
let GOLDEN_AXE_BAUBLE = MaidRegister.BAUBLE.bind("minecraft:golden_axe", (maid, stack) => {
    // 每 150 tick 检查一次，减少性能消耗
    if (maid.level.server?.tickCount % 150 === 0) {
        maid.potionEffects.add("minecraft:glowing", 200, 1);
    }
});

// 注册物品提示，当你手持物品对着女仆时，就会在屏幕提示对应文本
MaidRegister.TIPS.tips(overlay => {
    // 前一个参数是语言文件的 key，后一个是物品
    overlay.addTips("tips.test.stone", "minecraft:stone");
    // 当然，还有高级写法
    // 当手持苹果数量超过 2 时才显示提示
    overlay.addSpecialTips("tips.test.apple",
        (stack, maid, player) => stack.is("minecraft:apple") && stack.getCount() > 2);
});

// 注册全新的工作模式
// 这块即可完全自定义自己的 Brain，也提供了预设模板略加修改
MaidRegister.TASK
    // 设定工作模式的 ID 和图标
    // meleeTask 就是预设的近战攻击任务，里面自带了近战相关的 AI，所以一般无需添加额外的 Brain
    .meleeTask("test:attack_cat", "minecraft:apple")
    // 任务的启用条件（可选，默认永远开启）
    .enable(maid => maid.favorabilityManager.getLevel() >= 2)
    // 任务的启用提示文本（可选，默认无任何提示）
    .addEnableConditionDesc("need_level_2", maid => maid.favorabilityManager.getLevel() >= 2)
    // 任务的攻击目标（可选，默认为所有敌对生物）
    .canAttack((maid, target) => target.type === "minecraft:cow")
    // 攻击武器的判断（必填，否则女仆不执行任何攻击逻辑）
    .isWeapon((maid, stack) => stack.is("minecraft:wooden_sword"))
    // 拥有额外攻击，也就是在武器造成伤害之后还有额外的逻辑，（可选，默认为 false）
    .hasExtraAttack((maid, target) => true)
    // 执行额外攻击逻辑（可选，需要上一个返回 true 这块才会执行，默认为空）
    .doExtraAttack(
        /**
         * @param {Internal.EntityMaid} maid - 女仆实体
         * @param {Internal.Entity} target - 攻击对象
         */
        (maid, target) => {
            // 给目标添加一个向上的运动
            target.addMotion(0, 1, 0)
            // 延迟半秒，在目标位置创建一个爆炸
            target.level.server.scheduleInTicks(10, event => {
                let pos = target.position()
                target.level.createExplosion(pos.x, pos.y, pos.z)
                    .strength(1).exploder(maid).explode();
            })
            // 返回 true 表示攻击成功，false 则表示攻击失败
            return true;
        })

// 远程攻击任务
MaidRegister.TASK
    .rangedAttackTask("test:tnt_attack", "minecraft:tnt")
    // 攻击武器的判断（必填，否则女仆不执行任何攻击逻辑）
    .isWeapon((maid, stack) => {
        return stack.is("minecraft:stick") &&
            // 并且女仆的背包里有 TNT
            MaidItemsUtil.isStackIn(maid, item => item.is("minecraft:tnt"));
    })
    // 任务的攻击目标（可选，默认为所有敌对生物）
    .canAttack((maid, target) => target.type === "minecraft:cow")
    // 生物搜索半径（可选，默认为工作范围）
    .searchRadius(48)
    // 弹药距离（可选，默认为 16）
    .projectileRange(32)
    // 攻击蓄力时间（可选，默认为 20 tick）
    .chargeDurationTick(10)
    // 女仆移动速度（可选，默认为 0.5）
    .walkSpeed(0.4)
    // 执行远程攻击逻辑，必填项，否则啥也不干
    .performRangedAttack(
        /**
         * @param {Internal.EntityMaid} maid - 女仆实体
         * @param {Internal.LivingEntity} target - 攻击对象
         * @param {number} distanceFactor - 距离因子，0-1 之间，表示目标距离女仆的远近，可与直接用于弹射物射速
         */
        (maid, target, distanceFactor) => {
            // 计算起点和目标点
            let start = maid.position();
            let end = target.position();

            // 创建 TNT 实体
            let tnt = maid.level.createEntity("minecraft:tnt");
            // 稍微高一点防止卡地面
            tnt.setPosition(start.x, start.y + 1.0, start.z);
            // 设置爆炸倒计时（单位：tick，默认 80）
            tnt.fuse = 10;

            // 计算速度向量
            let dx = end.x - start.x;
            // 适当调整高度
            let dy = (end.y + 0.5) - (start.y + 1.0);
            let dz = end.z - start.z;
            let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            let speed = distanceFactor;
            tnt.setMotion(dx / dist * speed, dy / dist * speed + 0.2, dz / dist * speed);

            // 生成 TNT
            tnt.spawn();

            // 消耗一个 TNT 物品
            MaidItemsUtil.getStack(maid, item => item.is("minecraft:tnt")).shrink(1);
        });

// 种田 task，其实不限于种田，也可以是挖矿、砍树等
// 比如挖矿，你就不写 isSeed canPlant plant 等方法
// 这里我们演示一个简单的种田任务，女仆会在沙子上放置枯萎的灌木，打掉钻石矿
MaidRegister.TASK.farmTask("test:dead_bush", "minecraft:dead_bush")
    // 判断是否是种子，用于后续的 canPlant 和 plant 方法传参
    .isSeed(stack => stack.is("minecraft:dead_bush"))
    // 当距离目标方块小于等于 2 格时才会执行种植/收回逻辑
    .closeEnoughDist(2)
    // 检查目标上面是否有两格空间能容纳女仆到达
    .checkCropPosAbove(true).canPlant(
    /**
     * @param {Internal.EntityMaid} maid - 女仆实体
     * @param {BlockPos} blockPos - 作物基底位置，比如耕地所处的位置，作物就应该在上一格进行放置
     * @param {BlockState} blockState - 作物基底状态
     * @param {ItemStack} seed - 当前选中的种子
     * @return {boolean} - 是否可以种植
     */
    (maid, blockPos, blockState, seed) => {
        // 这里我们让枯萎的灌木只能放在沙子上，并且沙子上面有空间
        return blockState.is("minecraft:sand") && maid.level.getBlockState(blockPos.above()).isAir();
    }).plant(
    /**
     * @param {Internal.EntityMaid} maid - 女仆实体
     * @param {BlockPos} blockPos - 作物基底位置，比如耕地所处的位置，作物就应该在上一格进行放置
     * @param {BlockState} blockState - 作物基底状态
     * @param {ItemStack} seed - 当前选中的种子
     * @return {ItemStack} - 返回种子物品，通常是消耗一个种子后返回剩余的种子
     */
    (maid, blockPos, blockState, seed) => {
        // 注意：这里的 blockPos 是作物基底位置，比如沙子的位置，枯萎的灌木应该放在上面
        let checkPos = blockPos.above();
        // placeItemBlock 方法会自动扣除物品，无需 shrink
        // 但这个方法只能放置 ItemBlock 类型的方块，并且会判断实体碰撞箱
        maid.placeItemBlock(checkPos, seed)
        return seed;
    }).canHarvest(
    /**
     @param {Internal.EntityMaid} maid - 女仆实体
     @param {BlockPos} blockPos - 打算破坏方块的位置
     @param {BlockState} blockState - 打算破坏的方块状态
     @return {boolean} - 是否可以破坏
     */
    (maid, blockPos, blockState) => {
        // 破坏钻石矿
        return blockState.is("minecraft:diamond_ore");
    }).harvest(
    /**
     * @param {Internal.EntityMaid} maid - 女仆实体
     * @param {BlockPos} blockPos - 打算破坏方块的位置
     * @param {BlockState} blockState - 打算破坏的方块状态
     */
    (maid, blockPos, blockState) => {
        maid.destroyBlock(blockPos)
    })

// 接下来是走向方块的 Task，这个比上一个 Farm 更适合挖矿，砍树等逻辑，你也可把它设计成走向某个机器，执行机器的操作逻辑
MaidRegister.TASK.walkToBlockTask("test:walk_to_block", "minecraft:iron_ore")
    // 搜索范围为女仆的工作范围，我们只能自定义搜索的垂直高度
    // 但是此数值不宜过大，否则遍历方块会带来严重的性能消耗
    // 这是一个可选参数，默认是填写的 2，也就是搜索 -2 到 2 格的高度范围
    .setVerticalSearchRange(2)
    // 必填项目，否则不进行搜索。开始进行搜索之前的判断条件，请在必要时在进行搜索，减少性能消耗
    .setSearchCondition(maid => maid.mainHandItem.is("minecraft:iron_pickaxe"))
    // 必填项目，这里我们让搜索到的方块是铁矿石
    .setBlockPredicate(
        /**
         * @param {Internal.EntityMaid} maid - 女仆实体
         * @param {BlockPos} blockPos - 搜索的方块位置
         */
        (maid, blockPos) => {
            return maid.level.getBlockState(blockPos).is("minecraft:iron_ore");
        })
    // 选填内容，默认为 2。当距离目标方块小于等于 2 格时才会执行后续逻辑
    .setCloseEnoughDist(2)
    // 最后的到达逻辑，必填内容，否则不执行任何逻辑
    .setArriveAction(
        /**
         * @param {Internal.EntityMaid} maid - 女仆实体
         * @param {BlockPos} blockPos - 打算执行逻辑的方块的位置
         */
        (maid, blockPos) => {
            // 直接破坏方块
            maid.destroyBlock(blockPos);
            // 消耗一点耐久
            maid.mainHandItem.hurtAndBreak(1, maid, m => m.broadcastBreakEvent("main_hand"));
        })