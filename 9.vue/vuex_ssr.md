# Vue.js 状态管理和服务端渲染

## 课程目标
- 理解Vue.js状态管理的核心概念和工作原理，掌握在Vue.js项目中管理组件状态的常用方法
- 掌握Vue.js服务端渲染的基本概念、原理和优缺点，了解服务端渲染在提升应用性能和用户体验方面的应用
- 学习如何在服务端渲染的Vue.js项目中结合状态管理，实现服务端数据预获取、状态同步和客户端和服务端状态的合并

## 课程大纲
- Vue.js状态管理
- Vue.js服务端渲染
- Vue.js状态管理与服务端渲染的结合

### Vue.js状态管理
#### 状态管理的基本概念
为什么要有状态管理？

数据驱动 State -> UI开发模式带来的问题？
- 多个视图view依赖同一个state
- 多个视图view会对同一个状态state进行修改

#### Vue.js状态管理的几种方式
1. 组件内状态管理：利用data、computed等属性来管理组件内部状态
2. 父子组件通信：通过props和自定义事件实现父子组件状态的传递和通信
3. 事件总线EventBus：通过一个Vue实例作为事件总线，实现跨组件通信（Vue.js 3.0已移除该API，面试题：如何自己实现一个EventEmitter类？）
4. provide/inject：通过provider/inject API实现父组件和后代组件的跨层状态传递
5. 状态管理库：Vuex、Pinia

#### 状态管理库的选择：Vuex VS Pinia？
- API设计风格
- 开发体验
- 兼容性
- 社区和生态

#### 状态管理库的核心概念
以Pinia为例讲解
- Store
- State
- Getter
- Action

##### Pinia的工作原理
- 全局状态管理
- 响应式状态管理
- Store的定义和实例化
- 插件系统

Vue App -> createPinia -> pinia
pinia -> createPinia
pinia 全局变量记录pinia实例-> ActivePinia
pinia -> {piniaSybol: pinia, _s: Map<string, Store>, state: ref({})}

defineStore -> createOptionsStore -> (assign -> setup) -> createSetupStore
defineStore -> createSetupStore
createSetupStore -> (store == reactive() <- useStore) inject获取全局pinia实例-> pinia Provide全局注入pinia实例-> Vue App

### Vue.js服务端渲染 （SSR）
#### 服务端渲染的基本概念
几种不同的渲染模式介绍
- CSR(Client Side Rendering) 客户端渲染
- SSR(Server Side Rendering) 服务端渲染
- SSG(Static Site Generation) 静态站点生成
- ISG(Incremental Static Regeneration) 增量静态再生

#### Vue.js 服务渲染的原理
创建服务端Vue实例 -> 处理请求和路由controller -> 数据预获取状态同步 -> 生成HTML字符串renderToString -> 客户端接收HTML -> 客户端激活Hydaration

#### Vue.js服务渲染的原理
如何实现前后端状态的获取和同步？
1. 安装和创建Pinia实例
2. 使用defineStore定义store
3. 服务端数据预获取，修改Store中State的值
4. 状态同步，服务端状态序列化成字符串挂载在window.__PINIA_STATE__变量上，客户端激活应用时从HTML中解析状态，注入到pinia实例中

#### 服务端渲染的基本概念
SSR的优缺点
优点：
- 更快的首屏渲染
- 更好的搜索引擎优化（SEO）
- 更好的内容预览

缺点：
- 服务器负载增加
- 代码复杂度增加，需要考虑代码的同构问题和第三方库是否支持在服务端运行
- 复杂的构建和部署配置
