// 女仆模组 KubeJS 兼容示例文件
// 祭坛合成，需要放置在 server_scripts 中

// 祭坛配方的修改
ServerEvents.recipes(event => {
    // 祭坛合成为无序合成
    event.recipes.touhou_little_maid.altar_crafting(
        // 祭坛的输出可以直接写 KubeJS 的物品写法，比如：
        // Item.of("minecraft:apple").withCount(6).withName("林檎")
        // "5x minecraft:apple"
        Item.of("minecraft:apple").withCount(6).withName("林檎"),
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
    );

    // 祭坛还可以直接召唤实体，还可以给实体附加 NBT 数据
    // 此时就需要用到 MaidAltarOutput 类来生成输出
    event.recipes.touhou_little_maid.altar_crafting(
        // 方法可以为：MaidAltarOutput.entity(id, nbt) 或者 MaidAltarOutput.entity(id)
        // 这里为了方便演示，我们直接生成一个物品实体，你也可以用它生成猫猫狗狗都没问题
        MaidAltarOutput.entity("minecraft:item", {
            "Item": {
                "id": "touhou_little_maid:film",
                "Count": 10
            }
        }),
        ["minecraft:diorite", "minecraft:diorite", "minecraft:diorite", "minecraft:diorite"],
        // 女仆模组实体相关合成一般消耗的 P 点会略高于物品的
        0.5
    );

    // 生成女仆比较特殊，专门添加了方法
    event.recipes.touhou_little_maid.altar_crafting(
        MaidAltarOutput.spawnMaidWithBox(),
        ["minecraft:apple", "minecraft:apple", "minecraft:apple", "minecraft:apple", "minecraft:apple"],
        0.8
    );

    // 复活女仆比较特殊，专门添加了方法。
    event.recipes.touhou_little_maid.altar_crafting(
        MaidAltarOutput.rebornMaid(),
        // 需要注意，输入物品必须带一个胶片！
        ["touhou_little_maid:film", "minecraft:apple", "minecraft:apple", "minecraft:apple", "minecraft:apple"],
        0.8
    );
});