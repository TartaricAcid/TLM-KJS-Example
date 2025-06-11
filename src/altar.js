// 女仆模组 KubeJS 兼容示例文件
// 祭坛合成，需要放置在 server_scripts 中

// 祭坛配方的修改
ServerEvents.recipes(event => {
    // 祭坛合成为无序合成
    event.recipes.touhou_little_maid.altar_crafting(
        // 祭坛的输出不能直接使用原版物品形式，必须使用 MaidAltarInput
        // 可以使用 KubeJS 提供的 Item 类包装：MaidAltarInput.itemstack(Item.of("minecraft:apple"))
        // 或者直接使用物品 ID：MaidAltarInput.item("minecraft:apple")
        // 并且可以设置数量：MaidAltarInput.item("minecraft:apple", 5)
        MaidAltarInput.item("minecraft:apple", 5),
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
    event.recipes.touhou_little_maid.altar_crafting(
        // 方法可以为：MaidAltarInput.entity(id, nbt) 或者 MaidAltarInput.entity(id)
        // 这里为了方便演示，我们直接生成一个物品实体，你也可以用它生成猫猫狗狗都没问题
        MaidAltarInput.entity("minecraft:item", {
            "Item": {
                "id": "touhou_little_maid:film",
                "Count": 10
            }
        }),
        [
            {
                "item": "minecraft:diorite",
                "count": 1
            },
            {
                "item": "minecraft:diorite",
                "count": 1
            },
            {
                "item": "minecraft:diorite",
                "count": 1
            },
            {
                "item": "minecraft:diorite",
                "count": 1
            }
        ],
        // 女仆模组实体相关合成一般消耗的 P 点会略高于物品的
        0.5
    );
});