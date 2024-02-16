# 状态管理

## 状态
- 我们是不关心过程的，我们关心的永远是，界面处于哪个状态；
- 仔细想一下
  - 数据：useList 都会有一份在内存中的数据；
  - 视图：DOM 的方式，渲染到视图上。

## 管理
- 在 Web 端的生命周期变化时，数据的model，生命周期是什么样的，作用范围 是什么样的，以及所呈现出来的view

```jsx
function App() {
  const [ userList, setList ] = useState([]);

  useEffect(() => {
    // fetch.then(setList)
  })

  return (
    <div>
      {userList.map(item => <div>{item.value}</div>)}
    </div>
  )
}
```

## 软件工程，在干一件什么事？
软件的本质，就是管理数据。
我们首先要考虑的是，一个数据的生命周期是什么？作用范围是什么？
- DataBase: 用户名，掘金的观看历史
- localStorage: 搜索历史
- sessionStorage / cookie: 用户的登录态
- project runtime: 一些筛选框
- component: [state, props, data]

### 我们一般所说的状态管理
vuex, redux
- project runtime: 在多个页面，同一个运行时，持有。
  - 刷新的动作下，所有的js是不是重新了一遍
  - 在这个js运行时，一直持有。
- global -> data
- closure 闭包

## 状态管理的实现
1. 组件之外，可以在全局共享状态/数据
  1. closure 可以解决

2. 有修改这个数据的明确方法，并且，能够让其他的方法感知到。
  1. 本质上，就是把监听函数放在一个地方，必要时拿出来执行一下。
    1. 发布订阅
    2. new Proxy / Object.defineProperty
3. 修改状态，会触发 UI 的更新
  1. forceUpdate
  2. setState
  3. useState









