## vue基础用法
### 理论
#### 面试题1: 简单聊一聊对于mvvm的了解 / 认知
* 1. 发展史 & 旁支
a. 语义化模版
b. MVC - model view controller
c: MVVM - model view view-model

### 写法
#### vue是如何利用mvvm思想进行开发的呢
数据双向绑定
a. 花括号，构筑了数据与视图的双向绑定
b. 通过视图绑定事件，来处理数据

#### 生命周期 - vue实例
建立：beforeCreate => created => beforeMount => mounted
更新：beforeUpdate => updated
销毁：beforeDestory => destoryed

#### 面试题2: vue的生命周期过程
bC: new Vue() - 实例挂载功能
c: data、props、methods、computed - 数据操作、不涉及vdom以及dom

bM: vDom - 围绕vDom做的数据操作，但是不可涉及dom
m: Dom - 任何操作

bU: vDom更新了的，dom未更新的 - 可以更新数据
u: dom已经更新了 - 谨慎操作数据

bD: 实例vm尚未被销毁 - eventBus、store、计时器销毁
d: 实例完全被销毁 - 收尾

#### 定向监听
##### 面试点：computed 和 watch
相同点：
1. 基于vue的依赖收集机制
2. 都是被依赖的变化触发，进而进行改变、处理计算

不同点：
1. 入和出
computed: 多入单出 - 多个值变化，组成了一个值的变化
watch: 单入多处 - 单个值的变化，进而影响了一系列的变更

2. 性能上
computed: 会自动diff依赖，如果依赖没有变化，会直接从缓存中读取值
watch: 无论监听值变化与否，只能通过回调获取值

3. 写法上
computed: 必须有return
watch: 不一定

4. 时机上
computed: 从首次生成赋值，就开始运行了
watch: 首次默认不运行，immetiate: true

#### 条件
##### v-if & v-show & v-else & v-else-if
v-if 无dom，不会渲染实际节点及其子节点
v-show 存在实际节点及其子节点，但不展示、不占据位置

#### 循环 v-for + key
在vue2.x中，一个元素上同时使用v-if & v-for，v-for优先级更高
在vue3中，v-if是始终优先于v-for

##### 面试题：key的作用
1. 模版编译原理 - template => dom template => 匹配语法 —— 生成AST：静态 + 动态 => 转换AST为可执行方法 => render() => dom

2. key作用
dom diff  -  单层复用、双向指针、优先复用
key => 快速识别节点的可复用

#### 默认指令
v-once - 只渲染一次
v-text - 只渲染字符串
v-html - 渲染html
v-model - 双向绑定 => :value + @input
重配置
```js
  model: {
    prop: selected,
    event: 'change'
  }
```