# Vue.js核心源码解析
## 前端框架的发展史
## 从石器时代到现代开发框架
服务端模版（asp、jsp、php）+ javascript -> jQuery + DOM -> MVVM（三大框架） -> (CSR + SSR + SSG)

### 石器时代
页面开发模式以服务端模版渲染为主，可以理解为最早的直出HTML的开发方式。asp对应的后台语言时.net语言，jsp对应java后台，php可以直接渲染html模版
前端开发人员负责用js给这些后台返回的HTML模版添加事件响应。可以理解为纯粹的页面仔。
前端负责开发静态的HTML模版和js事件绑定函数，后端根据后端服务的技术选型把静态的HTML转换成可以渲染的动态模版。

### 铁器时代
在Gmail诞生之后，带火了Ajax这个技术，让前端可以直接从浏览器向后台发起数据请求。这样子前端就可以不用依赖后台的模版技术进行渲染，而是可以通过js动态的获取后台的数据源+DOM操作的方式动态生成HTML模版。

同时jQuery的出现抹平了多浏览器事件机制和一些API的差异性，提升了前端开发的效率和一致性。

### 工业时代
AngularJS的诞生，带来了MVVM的开发模式。Node.js的诞生，让前端有了可以入侵后端的能力，同时也赋予了前端工程化的能力。逐渐的发展形成了三大框架的势力格局（Angular、React、Vue）。

发展到今天，三大框架除了核心库本身都附带有相关的生态系统，也被称为全家桶。以Vue.js为例，包括Vue.js核心库、Vue Router、Vuex和Vue Cli等。这些工具可以协同工作，提供了完整的前端开发解决方案。

## Vue.js从v2.0到v3.0
Vue.js1.0（双向数据绑定 + 模版语法）
- 采用双向数据绑定的方式，支持模版语法和组件化开发。
- 提供了指令、过滤器和组件等功能，可以方便地实现复杂的前端应用。
- 采用Virtual DOM技术，提高了页面的渲染效率。

Vue.js 2.0（vdom）
- 重构了Vitual DOM，提高了性能和可维护性
- 引入了渲染函数，提供了更加灵活的组件渲染方式。
- 支持了异步组件和keep-alive等功能，提高了应用的性能和用户体验。
- 改进了模版编译器，提供了更加严格的模版语法检查和错误提示。

Vue.js 3.0（Proxy + Composition API + Typescript）
- 重构了响应式系统，提高了性能和可维护性。
- 引入了Composition API，提供了更加灵活的组件开发方式。
- 改进了模版编译器，提供了更加严格的类型检查和错误提示。
- 优化了代码体积和性能，提高了应用的加载速度和渲染速度。
- 支持了TypeScript和JSX等语言特性，提高了代码的可读性和可维护性。

**Vue2 到 Vue3更新了哪些内容？我们需要重点关注什么？**
- composition API，函数式编程
- 响应式系统重构，Object.defineProperty -> Proxy
- 性能优化
  - 编译优化：静态提升、Tree-Shaking效率提升、模板缓存
  - 运行时优化：diff算法
- 代码重构，整个项目利用ts+大仓 管理模式重构

## Vue 源码的核心模块解读
(文本插值、条件渲染、列表渲染、指令、插件) <- Complier编译时(模板 compiler -> 渲染函数) -> Runtime-core 运行时(实例化、响应式数据绑定、事件处理、生命周期函数)
响应式数据绑定 -> 响应式API(ref、reactive、computed、watch)
Runtime-core 运行时(...) -> 自定义渲染器((runtime-dom)、(runtime-cli)、(runtime=webgl)、(runtime-xxyy))

### 响应式系统
#### 什么是响应式？
```js
var count = 1;

var getDoubleCount = count => count * 2;
var doubleCount = getDoubleCount();

count = 2;

// doubleCount ??
// 自动指定 getDoubleCount -> doubleCount
```

#### 响应式原理是什么呢？
Vue中用过三种响应式解决方案，分别是defineProperty、Proxy和value setter。我们首先来看Vue 2的defineProperty API，这个函数详细的API介绍你可以直接访问MDN。
- defineProperty
- Proxy
- value setter

从Object.defineProperty到Proxy？为什么要重构？
defineProperty: Vue 2响应式 兼容性 数组和属性删除等拦截不了 Vue2
Proxy: Vue 3 reactive 基于Proxy实现真正的拦截 兼容不了IE11 Vue 3复杂数据结构
value setter: Vue 3 ref 实现简单 只拦截了value属性 Vue 3简单数据结构

### 模板引擎
Compiler模板把模板引擎编译成一个可执行函数（渲染函数）

通过静态提升等技术手段，可以优化模板的渲染性能。
http://juejin.com/post/7130775536086810654

首先来看一个标准的sfc组件，sfc组件是如何变成浏览器可以直接运行和渲染的html、css、js代码。
```vue
<template>
  <div />
</template>

<script lang="ts">
  import { reactive, toRefs } from 'vue'

  export default {
    setup() {
      const state = reactive({
        count: 0
      });

      return {
        ...toRefs(state),
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
```

编译后的渲染函数：
```js
import { createHotContext as __vite__createHotContext } from "@vite/client";
import.meta.hot = __vite__createHotContext("/src/components/text.vue");
import { reactive, toRefs } from "/node_modules/.vite/deps/vue.js?v=30886382";
const _sfc_main = {
  setup() {
    const state = reactive({
      count: 0
    });
    return {
      toRefs(state)
    };
  }
}
import {toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, openBlock as _openBlock, createElementBlock as _createElementBlock} from '/node_modules/.vite/deps/vue.js?v=30886382';
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  // 渲染函数 -> vdom
  return _openBlock(), _createElementBlock('div', null, [_createElementVNode("div", null, "count": _toDisplayString(_ctx.count), 1 /* TEXT */)])
}
_sfc_main.__hmrId = "86b8c18c";
typeof __VUE_HMR_RUNTIME__ !== "undefined" && __VUE_HMR_RUNTIME__.createRecord(_sfc_main.__hmrId, _sfc_main);
import.meta.hot.accept((mod) => {
  if (!mod) return;
  const { default: updated, _rerender_only } = mod;
  if (_rerender_only) {
    __VUE_HMR_RUNTIME__.rerender(updated.__hmrId, updated.render);
  } else {
    __VUE_HMR_RUNTIME__.reload(updated.__hmrId, updated);
  }
});
import _export_sfc from "/@id/__x00__plugin-vue:export-helper";
export default /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render], ["__file", "/User/libp/Code/vuejs-course/todo-mvc/src/components/test.vue"]]);

//#sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6I kFBUUEsU0FBUyxVQUFVLGNBQWM7QUFFakMsTUFBSyxZQUFVO0FBQUEsRUFDYixRQUFRO0FBQ04sVUFB TSxRQUFRLFNBQVM7QUFBQSxNQUNyQixPQUFPO0FBQUEsSUFDVCxDQUFDO0FBRUQsV0FBTztBQUFBLE1 BQ0wsR0FBRyxPQUFPLEtBQUs7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFDRjs7O3VCQW5CRSxvQkFFTT tBQUFBLElBREo7QUFBQSxNQUE2QjtBQUFBO0FBQUEsTUFBeEIsWUFBTyxpQkFBRyxVQUFLO0FBQUE7Q UFBQTtBQUFBO0FBQUEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsidGVzdC52dWUiXSwic291cmNlc0Nv bnRlbnQiOlsiPHRlbXBsYXRlPlxuICA8ZGl2PlxuICAgIDxkaXY+Y291bnQ6IHt7IGNvdW50IH19PC9 kaXY+XG4gIDwvZGl2PlxuPC90ZW1wbGF0ZT5cblxuPHNjcmlwdCBsYW5nPVwidHNcIj5cblxuaW1wb3 J0IHsgcmVhY3RpdmUsIHRvUmVmcyB9IGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzZ XR1cCgpIHtcbiAgICBjb25zdCBzdGF0ZSA9IHJlYWN0aXZlKHtcbiAgICAgIGNvdW50OiAwLFxuICAg IH0pXG5cbiAgICByZXR1cm4ge1xuICAgICAgLi4udG9SZWZzKHN0YXRlKSxcbiAgICB9XG4gIH1cbn1 cbjwvc2NyaXB0PlxuXG48c3R5bGUgbGFuZz1cInNjc3NcIiBzY29wZWQ+PC9zdHlsZT4iXSwiZmlsZS I6Ii9Vc2Vycy9saWJwL0NvZGUvdnVlanMtY291cnNlL3RvZG8tbXZjL3NyYy9jb21wb25lbnRzL3Rlc 3QudnVlIn0=
```
VNode类型定义：https://github.com/vuejs/core/blob/main/packages/runtime-core/src/vnode.ts#L134
```js
// 省略版
interface VNode {
  type: VNodeTypes,
  props: any
  key: any
  ref: any
  children: any
}
```

### 虚拟DOM
// todo

### 运行时Runtime
// todo

