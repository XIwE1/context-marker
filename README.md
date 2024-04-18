marker提供：
    添加、删除、清空、渲染item 
    getSelectionRange 根据所选selection获取item 
    getSelectionPosition 获取所选位置的头尾rect对象，用于显示操作框
    getRangeIdByPointer 获取点击位置的id，用于高亮
    getRangePositionsById 根据id获取item的位置信息（x y 宽高），用于跳转
factory提供：接收config
    根据selection创建item 
    根据item创建rects
item
stage
    lineGroup、rectGroup

为什么需要factory 而不是直接创建item

item是操作数据 带起始节点 文本 操作人
rect是划线的位置 在渲染时使用

marker、item更加独立，item可能会被拿到不同root去用 计算rects逻辑
marker应该更关心自身的逻辑，他只需要调用画布渲染item 不关心item创建的具体细节