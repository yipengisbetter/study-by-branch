# 路由

## 来源
react-router vue-router
- SPA 出现后，前端才开始自己接管路由
  - 现在，客户端接管了路由。
- router 是啥
  - 路由的变化，是不是就是意味着界面（部分内容）的变化
  - 界面的变化，意味着数据的变化，组件的变化。
  - keywords：context, components, path(/user/edit)
- 路由的核心
  - **根据/监听 path/url 的变化，根据 path和components之间的对应关系，触发组件进行unmount和mount，同时使用 context 注入上下文**
    - navigation
    - path

## 分类
### history 路由
history./\(go|back|replace|push|forward)/

### hash路由
window.location.hash

### memory路由

#### hash路由 和 history 路由，有哪些区别？
- hash 路由一般会携带一个#号，不美观；history路由就不存在这个问题；
- 默认hash路由，不会像浏览器发出请求，但是history -> go, back, forward 都会发出请求；
- hash模式一般是不支持SSR，history是支持的
- history路由要是部署的时候，去nginx处理一下：
```sh
location / {
  try_files uri #uri /xx/xxx/xxx/index.html
}
```

## react 路由
V6
### react-router
提供一些核心的 API，如：Router，Route这些，但是不提供和 DOM 相关的
### react-router-dom
提供 BrowserRouter， hashRouter，Link这个API，可以用过DOM操作触发事件，控制路由
### history
模拟浏览器的history的一个库，V6的版本这个库已经内置的，并且导出成navigation

### react-router-dom v6

- 已经没有 component 了，用element代替

#### <Routes />
一组路由，代替原来的 Switch

#### <Route />
基础路由

#### <Link />

#### <Outlet />
类似于 Vue 中的 router-view

#### useRoutes

#### useLocation

#### useNavigate
代替以前的 useHistory

#### useParams

## Q & A
### V6主要是多了一些新的API

### 请求
html -> 边下载 边解析 边渲染

www.baidu.com -> 8.8.8.8

### tailwind css
原子化 css
### headlessui
  - 没有样式的组件库，只有组件的逻辑。











