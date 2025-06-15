// 祭坛配方的修改
ServerEvents.recipes(event => {
    // 祭坛合成为无序合成
    event.recipes.touhou_little_maid.altar_recipe_serializers(
        // 祭坛的输出可以直接写 KubeJS 的物品写法，比如：
        // Item.of("minecraft:apple").withCount(6).withName("林檎")
        // "5x minecraft:apple"
        Item.of("minecraft:apple").withCount(6).withCustomName("林檎"),
        // 输入配方，无序合成，和原版工作台无序合成输入的写法基本一致
        // 祭坛有六根御柱，最多可以设置六个输入
        [
            {
                "item": "minecraft:stone",
                "count": 1
            },
            {
                "item": "minecraft:stone",
                "count": 1
            },
            {
                "item": "minecraft:stone",
                "count": 1
            },
            {
                "item": "minecraft:stone",
                "count": 1
            }
        ],
        // 合成需要的 P 点数，物品类的一般都是 0.2，玩家能够最多存档的 P 点也就 5 点
        0.1
    )

    // 祭坛还可以直接召唤实体
    // 这里为了方便演示，我们直接生成一个猫
    event.recipes.touhou_little_maid.altar_recipe_serializers(
        // 此时物品应该为 touhou_little_maid:entity_placeholder
        Item.of("touhou_little_maid:entity_placeholder").set("touhou_little_maid:recipe_id", "cat"),
        ["minecraft:diorite", "minecraft:diorite", "minecraft:diorite", "minecraft:diorite"],
        // 女仆模组实体相关合成一般消耗的 P 点会略高于物品的
        0.5,
        // 直接生成一个猫
        "minecraft:cat",
        // 语言文件，用于 JEI 界面的提示
        "生成猫猫"
    );

    // 生成新的女仆比较特殊，参考下面内容即可
    // 只要保证输出实体是：touhou_little_maid:box 即可
    event.recipes.touhou_little_maid.altar_recipe_serializers(
        // 此时物品必须为这个
        Item.of("touhou_little_maid:entity_placeholder").set("touhou_little_maid:recipe_id", "spawn_box"),
        ["minecraft:apple", "minecraft:apple", "minecraft:apple", "minecraft:apple", "minecraft:apple"],
        0.8,
        "touhou_little_maid:box",
        "jei.touhou_little_maid.altar_craft.spawn_box.result"
    );

    // 复活女仆比较特殊，专门添加了方法。
    // 只要保证输出实体是：touhou_little_maid:maid 即可
    event.recipes.touhou_little_maid.altar_recipe_serializers(
        // 此时物品必须为这个
        Item.of("touhou_little_maid:entity_placeholder").set("touhou_little_maid:recipe_id", "reborn_maid"),
        // 需要注意，输入物品必须带一个胶片！
        ["touhou_little_maid:film", "minecraft:apple", "minecraft:apple", "minecraft:apple", "minecraft:apple"],
        0.8,
        "touhou_little_maid:maid",
        "jei.touhou_little_maid.altar_craft.reborn_maid.result"
    );
})

// 女仆模组 KubeJS 兼容示例文件
// 女仆模组原生提供了诸多事件，你可以在 https://github.com/TartaricAcid/TouhouLittleMaid/blob/1.21/src/main/java/com/github/tartaricacid/touhoulittlemaid/compat/kubejs/event/MaidEventsJS.java 查看所有的事件
// 目前原生暴露的事件都是双端的，你可以按照你的需要在服务端或者客户端执行

// 女仆交互事件，当玩家对自己的女仆右击时，触发此事件
MaidEvents.interactMaid(event => {
    // 女仆对象
    let maid = event.getMaid();
    // 右击时，玩家主手的物品
    let stack = event.getStack();
    // 玩家
    let player = event.getPlayer();
    // 当前世界
    let world = event.getWorld();
    // 这里为了方便演示，我们在玩家拿着苹果右击女仆时，发生爆炸（不
    if (stack.is("minecraft:apple")) {
        world.createExplosion(maid.getX(), maid.getY(), maid.getZ()).strength(5).explode();
        // 取消事件后续的操作，这样可以避免打开女仆 GUI 界面
        event.cancel();
    }
});

// 当然，交互事件可以传入物品参数，那么仅在玩家手持该物品时触发
MaidEvents.interactMaid("minecraft:diamond", event => {
    let maid = event.getMaid();
    maid.chatBubbleManager.addTextChatBubble("我喜欢钻石！");
    // 取消事件后续的操作，这样可以避免打开女仆 GUI 界面
    event.cancel();
});

// 女仆工作模式启用条件的修改，这是一个双端都需要触发的事件
// 如果只在服务端脚本中添加，不在客户端脚本中添加，那么在切换界面不会显示锁住的图标
// 取消该事件则表明当前 task 无法启用
MaidEvents.maidTaskEnable(event => {
    // 女仆当前所处的 task，可以通过 task id 来进行判断
    let task = event.getTargetTask();
    // 女仆对象
    let maid = event.getEntityMaid();
    // 当当前 task 为钓鱼时，禁止启用该 task
    // task id 可在 F3 H 开启显示高级信息后，在女仆工作模式切换按钮上看到
    if (task.getUid() === "touhou_little_maid:fishing" && maid.favorabilityManager.getLevel() < 2) {
        // 同时我们还可以添加一些提示语，当玩家鼠标悬浮于工作模式选择按钮之上时，能提醒玩家
        // 前一个参数是语言文件 key 的一部分，你还需要添加语言文件 task.touhou_little_maid.fishing.enable_condition.need_level_2
        // 后一个参数就是控制显示文本的颜色的，当返回 true 显示为绿色，返回 false 显示为红色
        event.addEnableConditionDesc("need_level_2", m => m.favorabilityManager.getLevel() >= 2);
        // 取消该事件则表明当前 task 无法启用
        event.cancel();
    }
});

// 当然，maidTaskEnable 事件也是可以传入一个任务 UID 的
MaidEvents.maidTaskEnable("touhou_little_maid:torch", event => {
    let maid = event.getEntityMaid();
    if (maid.favorabilityManager.getLevel() < 1) {
        event.addEnableConditionDesc("need_level_1", m => m.favorabilityManager.getLevel() >= 1);
        // 取消该事件则表明当前 task 无法启用
        event.cancel();
    }
});

// 这里我们新建一个全新的饰品
// 该饰品绑定原版的铁斧
let IRON_AXE_BAUBLE = MaidRegister.BAUBLE.bind("minecraft:iron_axe");
// 当女仆收到伤害时
MaidEvents.maidDamage(event => {
    // 女仆对象
    let maid = event.getMaid();
    // MaidItemsUtil 是一个提供的工具类，用来寻找饰品
    // 需要注意，当你 reload 指令重载自定义饰品后，需要重进存档才行
    // 否则可能 MaidItemsUtil.getBaubleSlotInMaid 无法找到饰品
    let slot = MaidItemsUtil.getBaubleSlotInMaid(maid, IRON_AXE_BAUBLE);
    // 当找到饰品时，slot 编号大于等于 0
    if (slot >= 0) {
        // 找到这个饰品
        let stack = maid.getMaidBauble().getStackInSlot(slot);
        // 消耗一点耐久
        maid.hurtAndBreak(stack, 1);
        // 取消伤害事件
        event.cancel();
    }
});

// 伤害事件也是可以传入一个伤害类型 ID 的，这里我们直接取消女仆的熔岩伤害
// 原版伤害类型 ID 可以在这里找到：https://zh.minecraft.wiki/w/%E4%BC%A4%E5%AE%B3%E7%B1%BB%E5%9E%8B表格中的第一列加上 minecraft 前缀
MaidEvents.maidDamage("minecraft:lava", event => {
    // 取消伤害事件
    event.cancel();
});

// 女仆模组 KubeJS 兼容示例文件
// 女仆模组也提供了一些注册内容，比如饰品、工作模式、提示文本等

// 注册饰品
// 第二个参数可以不写，里面是 tick 回调函数，当女仆穿戴此饰品时，每 tick 会执行里面的方法
// 这个返回值就是饰品对象，可以存起来，用于其他事件当中（因为寻找饰品需要这个参数）
let GOLDEN_AXE_BAUBLE = MaidRegister.BAUBLE.bind("minecraft:golden_axe",
    /**
     * @param {$EntityMaid} maid - 女仆实体
     * @param {$ItemStack} stack - 饰品绑定的物品对象
     */
    (maid, stack) => {
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
        /**
         * @param {$ItemStack} stack - 饰品绑定的物品对象
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$LocalPlayer} player - 玩家实体
         * @return {boolean} - 是否显示提示
         */
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
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$Entity} target - 攻击对象
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
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$LivingEntity} target - 攻击对象
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
     * @param {$EntityMaid} maid - 女仆实体
     * @param {$BlockPos} blockPos - 作物基底位置，比如耕地所处的位置，作物就应该在上一格进行放置
     * @param {$BlockState} blockState - 作物基底状态
     * @param {$ItemStack} seed - 当前选中的种子
     * @return {boolean} - 是否可以种植
     */
    (maid, blockPos, blockState, seed) => {
        // 这里我们让枯萎的灌木只能放在沙子上，并且沙子上面有空间
        return blockState.getId() === "minecraft:sand" && maid.level.getBlockState(blockPos.above()).isAir();
    }).plant(
    /**
     * @param {$EntityMaid} maid - 女仆实体
     * @param {$BlockPos} blockPos - 作物基底位置，比如耕地所处的位置，作物就应该在上一格进行放置
     * @param {$BlockState} blockState - 作物基底状态
     * @param {$ItemStack} seed - 当前选中的种子
     * @return {$ItemStack} - 返回种子物品，通常是消耗一个种子后返回剩余的种子
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
     @param {$EntityMaid} maid - 女仆实体
     @param {$BlockPos} blockPos - 打算破坏方块的位置
     @param {$BlockState} blockState - 打算破坏的方块状态
     @return {boolean} - 是否可以破坏
     */
    (maid, blockPos, blockState) => {
        // 破坏钻石矿
        return blockState.getId() === "minecraft:diamond_ore";
    }).harvest(
    /**
     * @param {$EntityMaid} maid - 女仆实体
     * @param {$BlockPos} blockPos - 打算破坏方块的位置
     * @param {$BlockState} blockState - 打算破坏的方块状态
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
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$BlockPos} blockPos - 搜索的方块位置
         * @return {boolean} - 是否符合搜索条件
         */
        (maid, blockPos) => {
            return maid.level.getBlockState(blockPos).getId() === "minecraft:iron_ore";
        })
    // 选填内容，默认为 2。当距离目标方块小于等于 2 格时才会执行后续逻辑
    .setCloseEnoughDist(2)
    // 最后的到达逻辑，必填内容，否则不执行任何逻辑
    .setArriveAction(
        /**
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$BlockPos} blockPos - 打算执行逻辑的方块的位置
         */
        (maid, blockPos) => {
            // 直接破坏方块
            maid.destroyBlock(blockPos);
            // 消耗一点耐久
            maid.hurtAndBreak(maid.mainHandItem, 1)
        })

MaidRegister.TASK.walkToLivingEntityTask("test:walk_to_living_entity", "minecraft:bowl")
    // 选填内容，默认为 2。当距离目标实体小于等于 2 格时才会执行后续逻辑
    .setCloseEnoughDist(2)
    // 必填项目，开始进行实体搜索之前的判断条件，请在必要时再进行搜索，减少性能消耗
    .setStartSearchPredicate(maid => maid.mainHandItem.is("minecraft:bowl"))
    // 必填项目，这里我们让搜索到的实体是蘑菇牛
    .setEntityPredicate(
        /**
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$LivingEntity} entity - 待检查的实体
         * @return {boolean} - 是否符合搜索条件
         */
        (maid, entity) => {
            return entity.type === "minecraft:mooshroom";
        })
    // 最后到达实体附近需要执行的逻辑，必填内容，否则不执行任何逻辑
    .setArriveAction(
        /**
         * @param {$EntityMaid} maid - 女仆实体
         * @param {$LivingEntity} entity - 待检查的实体
         */
        (maid, entity) => {
            if (maid.mainHandItem.is("minecraft:bowl")) {
                // 给女仆蘑菇煲物品
                MaidItemsUtil.giveItemToMaid(maid, "minecraft:mushroom_stew");
                // 扣掉一个手持的碗
                maid.mainHandItem.shrink(1);
                // 女仆挥舞一下手臂
                maid.swing();
                // 播放音效
                let pos = maid.position();
                maid.level["playSound(net.minecraft.world.entity.player.Player,double,double,double,net.minecraft.sounds.SoundEvent,net.minecraft.sounds.SoundSource)"](null, pos.x, pos.y, pos.z, "entity.mooshroom.milk", "neutral");
            }
        })

