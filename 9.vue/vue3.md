# Vue.js 3.0核心模块源码解析
## 课程目标
- 面试加分：大厂前端面试都要求熟悉框架底层原理，也是面试必问的环节
- 巩固基础知识：在Vue的响应式系统中用到了Proxy/Reflect这类元编程技术，同时可以学习到大型前端项目如何做工程管理。
- 提升日常开发效率：熟悉框架底层原理会让你在日常开发中对一些API的设计有更加深刻的理解，同时对组件的性能优化和Bug定位更加得心应手。

## 课程大纲
- Vue.js 3.0的新特性和设计思想
- Vue.js 3.0源码结构
- Vue.js 3.0源码分析：Reactivity System
- Vue.js 3.0源码分析：渲染器
- Vue.js 3.0源码分析：编译器

## Vue.js 3.0的新特性和设计思想
### Vue.js 3.0的新特性概述
- Composition API
- 新的响应式系统Proxy
- 编译器优化
- TypeScript支持性更好
- 自定义 Renderer API
- 更多的生命周期钩子函数 setup、onRenderTacked、onRenderTiggered

### Vue.js 3.0的设计思想
纯编译（Svelet）：类HTML模板 -> 原生DOM
纯运行时（React）：渲染函数 -> 虚拟DOM -> 原生DOM
编译时+运行时（Vue.js）：类HTML模板 -> 渲染函数 -> 虚拟DOM -> 原生DOM

## Vue.js 3.0的源码结构
源码：https://github.com/vuejs/core
packages
  - complier-core // 编译器核心代码，compiler-core是平台无关的，这意味着它不包含任何特定于浏览器或其他平台的代码
  - compiler-dom // 这是针对浏览器（或DOM环境）的编译器。它在compiler-core的基础上添加了一些特定于DOM的特性
  - compiler-sfc // 同上，负责处理*.vue，将其分解成模板、脚本和样式等部分。并对这些部分进行相应的处理。
  - compiler-ssr // 这个模块是针对服务器端暄软（SSR）的编译器，它在compiler-core的基础上添加了一些特定于SSR的特性，如生成服务端渲染的代码
  - dts-test
  - global.d.ts
  - reactivity  // 这是Vue.js的响应式系统，它是Vue.js的核心部分之一。这个包提供了一些基础的API
  - reactivity-transform
  - runtime-core //这是Vue.js的运行时核心，包含了Vue.js的主要功能，如响应式系统、组件系统、生命周期钩子等。这个包和平台无关的
  - runtime-dom // 这是针对浏览器（或DOM环境）的运行时。它在@vue/runtime-core的基础上添加了一些特定于DOM的特性
  - runtime-test
  - server-renderer // 服务端渲染相关
  - sfc-playground
  - shared  // 共享常量、工具函数
  - template-explorer
  - vue // 入口包，整合各个子包
  - vue-compat

### Vue.js 3.0源码结构
Vue -> 编译器(compiler-dom -> compiler-core), 渲染器(runtime-dom -> runtime-core) -> 响应式系统(reactivity)

## 响应式系统Reactivity System
### 响应式系统：源码结构
@vue/reactivity
- LICENSE
- README.md
- __tests__
- dist
- index.js
- package.json
- src
  - baseHandlers.ts // 基本数据类型处理器
  - collectionHandlers.ts // Set Map WeakSet WeakMap的处理器
  - computed.ts // 计算属性
  - deferredComputed.ts
  - dep.ts
  - effect.ts // reactive核心，处理依赖搜集、依赖更新
  - effectScope.ts
  - index.ts
  - operations.ts // 定义依赖搜集，依赖更新的类型
  - reactive.ts // reactive 入口
  - ref.ts  // ref入口
  - warning.ts
### 设计一个简单的响应式系统
#### 如何进行依赖搜集
```js
import { effect, reactive } from '@vue/reactivity';

export function setupCounter(element: HTMLButtonELement) {
  // 创建一个响应式对象
  let counter = reactive({ value: 0 });

  // 修改响应式对象的值 set value
  const setCounter = (count: number) => {
    counter.value = count;
  }

  // 渲染函数
  const render = () => {
    element.innerHTML = `counter is: ${counter.value}`;
  }

  // 注册一个副作用函数，render 函数会立即执行
  // 同时会对 render 函数中用到的响应式对象进行依赖搜集
  effect(render);

  element.addEventListener('click', () => setCounter(counter.value + 1));
}
```

#### 响应式系统核心：依赖搜集
代理对象（普通对象） -> get(track => get函数执行track函数，把effect注册到依赖地图中), set(trigger => set函数执行trigger函数，把所有的effect顺序执行)
targetMap(WeakMap) -> Name(KeytoDepMap(Map)), Age(KeytoDepMap(Map)) -> Set(effect1, effect2), Get(effect3)

#### 响应式系统：核心API实现
- ref
- reactive
- computed
- watch

## 渲染器
### 渲染器的基本概念
- 渲染器Renderer
- 虚拟dom
- 虚拟node
- 挂载mount
- Patch

@vue/runtime-dom -> patchProps, Insert, Remove, createElement, createText

@vue/runtime-core

### 渲染器初次渲染createApp().mount()
createApp -> ensureRenderer -> 创建渲染器(createRenderer) -> @vue/runtime-dom(createElement, insert, remove, setElementText, patchProp), @vue/runtime-core/src/renderer(baseCreateRenderer) -> @vue/runtime-core/src/apiCreateApp(createAppAPI) -> (hydrate), render -> patch -> (processText -> hostInsert -> @vue/runtime-dom), processElement, (processComponent -> (组件初次渲染(mountComponent) -> setupRenderEffect), 组件更新渲染(updateComponent))

### 渲染器二次更新：patch函数一览
```js
function patch(n1, n2, container) {
  if (n1 === n2) {
    return;
  }
  if (n1 && !isSameVNodeType(n1, n2)) {
    unmount(n1);
    n1 = null;
  }

  const {type} = n2;

  switch(type) {
    case Text:
      processText(n1, n2, container);
    case processElement:
      processElement(n1, n2, container);
    // 省略节点类型处理
  }
}
```
#### patch函数的执行逻辑
1. n1 === n2，不更新
2. n1不存在，n2存在，mount n2
3. n1和n2类型不一样，unmount n1, mount n2
4. 根据n1 和 n2的节点类型，调用不同的process函数
5. 优先比较n1和n2的props变化，调用patchProps函数
6. 比较n1和n2子节点的变化，调用patchChildren函数
  1. patchFlag、dynamicChildren优化

## 编译器
### 编译原理：从模版到渲染函数
源代码 -> 词法分析 -> 语义分析 -> AST -> transform -> 目标代码
```js
// 编译器
function compiler(source) {
  // 1. 解析
  let ast = parse(source);
  // 2. 转换
  transform(ast);
  // 3. 生成
  const code = generate(ast);

  return code;
}
```

### 词法分析tokenize
- 用于将源代码（通常是字符串形式）分割成一个个的词法单元（tokens）。这个过程被称为词法分析（lexical analysis）或者词法解析（tokenization）。函数的主要作用是将源代码转换为编译器更容易理解和处理的形式，为后续的解析和编译过程做好准备。
```js
const x = 10;

[
  {type: "Keyword", value: "const"},
  {type: "Identifier", value: "x"},
  {type: "Punctuator", value: "="},
  {type: "NumbericLiteral", value: "10"},
  {type: "Punctuator", value: ";"}
]
```

### 语法分析parse
- parse用于将词法分析（tokenization）阶段产生的词法单元（tokens）转换为抽象语法树（Abstract Syntax Tree，简称AST）。这个过程被称为语法分析（syntactic analysis）或解析（parsing）。函数的主要作用是将源代码的结构表示为编译器更容易理解和处理的形式，为后续的语义分析和代码生成过程做好准备。
- 在编译器中，parse函数通常遵循以下步骤：
- 1. 首先，从tokens列表中获取下一个token
- 2. 根据token的类型确定当前语法构造的类型
- 3. 递归的解析子构造（表达式、语句），组合成一个完整的AST
- 4. 将解析得到的AST添加到结果AST，并且继续解析token直到tokens为空

### 语义分析和优化
**重点：编译优化的核心是为了快速定位到diff节点**
- hoistStatic静态节点提升
- patchFlag补丁标记和动态属性记录
- 缓存事件处理程序
- 块block
