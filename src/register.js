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

let MeleeAttack = Java.loadClass("net.minecraft.world.entity.ai.behavior.MeleeAttack");
// 注册全新的工作模式
// 这块较为复杂，需要掌握原版的 Brain 机制才能写出可用的内容
MaidRegister.TASK
    // 设定工作模式的 ID 和图标
    .attackTask("test:attack_cat", "minecraft:apple")
    // 任务的启用条件（可选）
    .enable(maid => maid.favorabilityManager.getLevel() >= 2)
    // 任务的启用提示文本（可选）
    .addEnableConditionDesc("need_level_2", maid => maid.favorabilityManager.getLevel() >= 2)
    // 添加 Brain（可选）
    .addBrain(5, MeleeAttack.create(20));