// 女仆模组 KubeJS 兼容示例文件
// 女仆模组原生提供了诸多事件，你可以在 https://github.com/TartaricAcid/TouhouLittleMaid/blob/1.20/src/main/java/com/github/tartaricacid/touhoulittlemaid/compat/kubejs/event/MaidEventsJS.java 查看所有的事件
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
        stack.hurtAndBreak(1, maid, m => maid.sendItemBreakMessage(stack));
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