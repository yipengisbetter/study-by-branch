## 前端路由 vue-router 和内置组件揭秘

前端路由的原理：
- createRouter
  - hash
    - window.addEventListener('hashChange')
    - 两种实现路由切换的模式：UI 组件、API
  - history
    HTML5 新增的 API，可以通过不重新刷新的页面的前提下，修改页面路由
- useRouter
- router-view
- router-link

hash vs history

- 兼容性：hash 兼容性好于 history
- 美观性：history > /#/hash
- http://127.0.0.1:5173/ => 后端的路由

管理端 SPA，用hash
C 端涉及服务端处理，用history

### vue 内置组件

- 了解使用场景
  - keep-alive，多标签页交互，多 tab 切换
  - teleport，全局弹窗，dom 结构脱离组件树渲染
  - transition，实现组件过渡动画
  - defineAsyncComponent，声明一个异步组件，实现性能优化和分 chunk 打包

- defineAsyncComponent 学习原理和实现
  - 和 vue-runtime 解耦，同时就是一个高阶组件的封装
  - 技巧和设计可以应用到我们自己的组件设计，能够有提高设计能力

---
学习方式：what -> how -> why



