## vue进阶
### 特征一：模块化 —— a => b => c
#### 插槽
组件外部维护参数以及结构，内部安排位置
* 面试点 => 默认插槽的实现方式 => 整个插槽的聚合

* 问题 => 多个插槽点希望分开布局

#### 具名插槽
以name标识插槽的身份，从而在组件内部做到可区分

* 面试点 => name索引的其实引了一段解析上下文空间
* 参数的传递 => 参数的隔离

* 问题 => 插槽参数自管理

#### 作用域插槽
外部做结构描述勾勒，内部做传参

* 结构化的传递
```js
  let slotNode_header = (
    <div>vue header</div>
  )

  let scope_slot_content = slotProps => {
    return (
      <div>{slotProps}</div>
    )
  }

  render() {
    return (
      // slotNode_header
      scope_slot_content()
    )
  }
```

#### 模板的二次加工
1. watch | computed
 => 数据与数据之间的加工

2. 复杂的模版相关数据计算
方案一：函数 ｜ 过滤器 => 无法拿到实例
方案二：v-html - 逻辑运算 + 结构拼装 => 安全性
方案三：jsx - all in js
* 1. 语法糖实现 - v-model | v-for | v-ifs
* 2. jsx优点和劣势 =>
template => render => vm.render() diff key

### 特征二：组件化
```js
  Vue.component('component', {
    template: '<h1>组件</h1>'
  })
  new Vue({
    el: '#app'
  })
```
* 1. 抽象复用
* 2. 精简

#### 混入mixin - 逻辑混入
* 1. 应用：抽离公共逻辑（逻辑相同，模版不同，可复用mixin）
* 2. 合并策略：
    1. 变量补充不会覆盖
    2. 生命周期在引用该mixin的组件之前
    3. 同样被引入的两个mixin，根据引用顺序安排加载顺序

#### 继承扩展extends - 逻辑上的共同拓展
* 1. 应用：核心逻辑的功能继承
* 2. 合并策略：
    1. 变量补充，不会覆盖
    2. 无论是业务代码还是mixin都在extends之后

#### 整体扩展类 - extend
从预定的配置中拓展出来一个独立的配置项进行合并
* vue.extend & vue.component
extend => 在应用外以拓展的形式进行独立拓展区块 + 再以锚点的形式挂载上去
component => 以组件复用的形式作为挂载

#### 插件拓展 - use + install
* 1. vue的另一种补充拓展方式
* 2. vue插件的书写方式

* 总结
插件对比于全局操作作用是等价的，但是插件相当于提前在全局做了统一的支线处理

<!-- 主题系统 -->
1. 预处理
    primary => -- zhaowa-primary-bg-color
    => background-color: var
    (--zhaowa-primary-bg-color);
    => 预处理token

2. 后处理
    primary => --zhaowa-primary-bg-color
    => background-color: var
    (--zhaowa-primary-bg-color);
    => 变量的数据切换

    --zhaowa-primary-bg-color:
    --color-light-blue-001;
    --color-light-blue-001: blue;

#### 递归组件
```js
    // tree.js
    <div class='tree'>
        <treeItem />
    </div>

    // treeItem.js
    <div>
        <treeItem v-if="option.children && option.children.length"/>
    </div>
```

#### 异步组件
* 1. 全局
```js
    // 同步加载
    import App from 'App.vue'
    createApp(App).mount('#app')

    // 异步加载
    const loader = () => import('Btn.vue')
    loader().then(Btn => {
        createApp(Btn).mount('#app')
    })
```

* 2. 局部异步加载组件
面试：
1. defineAsyncComponent =>返回直接可以应用的节点 => 参数传递进行配置
2. vue3直接绑定方式，使用过程中注意节点性能

* 3. 动态组件
```js
    // component + is => wrapper
    <component :is="" />
```

=> 构成权限位系统 => 动态控制组件加载 => 获取判断提前量 => 加载组件

* 4. 指令
给组件绑定相应逻辑