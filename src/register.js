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
// 这块较为复杂，需要掌握原版的 Brain 机制才能写出可用的内容
MaidRegister.TASK
    // 设定工作模式的 ID 和图标
    .attackTask("test:attack_cat", "minecraft:apple")
    // 任务的启用条件（可选）
    .enable(maid => maid.favorabilityManager.getLevel() >= 2)
    // 任务的启用提示文本（可选）
    .addEnableConditionDesc("need_level_2", maid => maid.favorabilityManager.getLevel() >= 2)
    // 任务的攻击目标（可选）
    .canAttack((maid, target) => target.type === "minecraft:cat")
    // 攻击武器的判断
    .isWeapon((maid, stack) => stack.is("minecraft:diamond_sword"))
    // 添加 Brain（可选）。一般工作模式的优先级设置为 5 就行，Brain 可以使用 MaidBrainsTool 进行书写，这个方法提供了很多工具
    // 女仆开始寻找周围可攻击的目标
    .addBrain(5, (task, maid) => MaidBrainsTool.startAttacking(task))
    // 女仆会在攻击目标无效，或者手上没有武器时时停止攻击
    .addBrain(5, (task, maid) => MaidBrainsTool.stopAttackingIfTargetInvalid(task, maid))
    // 当敌对生物超出近战范围，女仆会尝试走向敌人
    .addBrain(5, (task, maid) => MaidBrainsTool.setWalkTargetFromAttackTargetIfTargetOutOfReach(0.6))
    // 当在近战范围内，女仆会尝试使用近战武器攻击目标
    .addBrain(5, (task, maid) => MaidBrainsTool.meleeAttack(20))
    // 当女仆手上有盾牌时且受到伤害时，女仆会尝试使用盾牌格挡
    .addBrain(5, (task, maid) => MaidBrainsTool.maidUseShieldTask());