## 问题
- 基础、高级、router、状态管理、源码
- 实战
  - 8节课
    - 3节课 - webpack rollup

# react

## 传统的方式下，是如何构建用户界面的？
js - 浏览器脚本
本质上，因为js可以操作dom.

### js是一门语言，所以有runtime.

### runtime，运行时环境，提供API，让我们操作操作系统

node: path, fs, http
browser: DOM BOM

```html
<script>
  document.getElementById('app').
  addEventListener('click', () => {

  })

  const div = document.createElement('div')
</script>
```

### 我们能不能封装一个东西
```js
// 实现一个方法，去创建一个 div
function createElement(type, params, children) {
  let child;
  if (type === 'div') {
    child = document.createElement('div');
  }

  Element.resolveAttributes.call(child, params);
  // 将 children ，挂载到我创建的这个元素上面
  children.forEach(item => child.appendChild(item));
  return child;
}

const div = createElement('div', {
  className: 'my_app',
})

```

### 按照这种逻辑，我们是不是就可以
```js
<div id="app">
  <h1>hello</h1>
  <h2>this is</h2>
  <h3>luyi</h3>
</div>

createElement('div', {id: 'app'}, [
  createElement('h1', {}, ['hello']),
  createElement('h2', {}, ['this is']),
  createElement('h3', {}, ['luyi']),
]);

// 我们如果一直调用这个函数，代码看起来很复杂。
// react 还想让用户这样写

<div id="app">
  <h1>hello</h1>
  <h2>this is</h2>
  <h3>luyi</h3>
</div>

// react 让 babel 团队， -> @babel/preset-react

var App = function App() {
  return React.createElement('div', {
    id: "app"
  }, React.createElement("h1", null, "hello",
    React.createElement("h2", null, "this is"),
    React.createElement("h3", null, "luyi")));
};

const H1 = () => (<h1>hello</h1>)

const App = () => (
  <div id="app">
    {H1()}
    <h2>this is</h2>
    <h3>luyi</h3>
  </div>
)
```

### 有啥区别？
- mount 我可以；
- update 怎么办？

```vue
<template>
  <div>
    {{ msg }}    -> 观察者 哈
  </div>
</template>

<script>
  export default {
    data() {
      return {
        msg: 'hello luyi'
      }
    }
  }
</script>
```

```js
const App = () => (
  <div id="app">
    {H1()}
    <h2>this is</h2>
    <h3>luyi</h3>
  </div>
)

// -> setState 的能力，来触发界面更新。
```

#### 前端在干什么？
用户交互 -> 界面更新。
@click -> this.data.xxx = '' -> get/set -> notify -> watcher -> 执行cb -> 更新onClick -> setState/dispatch -> enqueueSetState -> scheduleUpdateOnFiber -> 层层判断，我到底组件发生了什么变化 -> 变化记录下来 -> 更新界面。

#### 为什么要这么设计？
```vue
<template>
  <div v-for="item in list">
    {{ item.name }}
  </div>
</template>
```

```js
  <div>
    {list.map(item => <span>item.name</span>)}
  </div>

  <div>
    {(function () {
      for (item of list) {

      }

      return item;
    })()}
  </div>

// Fiber 双缓存
// 调度。
```

## react 工程

### create-react-app 使用
`npx create-react-app react_basic`

`cd react_basic`

`npm run eject` 暴露配置文件，不可逆

### 组件库
- headlessui
- tailwind

### props 和 state

#### 类组件
改变界面，要用 state 。调用 setState 的方法去处理。

```js
export default class ClassCom extends Component {
  constructor(props) {
    super(props);

    this.state = {
      number: 0,
      msg: 'hello luyi'
    }
  }

  handleClick = (type) => {
    console.log('click', type)
    this.setState({
      number: this.state.number + (
        type === 'plus' ? 1 : -1
      )
    })
  }

  handleChange = (event) => {
    this.setState({
      msg: event.target.value
    })
  }

  render() {
    const { msg, number } = this.state;
    return (
      <div>
        <div>{ number }</div>
        <button onClick={() => {
          this.handleClick('plus')
        }}>+</button>
        <button onClick={() => {
          this.handleClick('minus')
        }}>-</button>
        <input  value={msg} onChange={this.handleChange} />
      </div>
    )
  }
}
```
#### 函数组件
##### useState
`[ state, dispatch ] = useState(initState)`;
- state: 作为组件状态，提供给 UI 渲染视图
  - dispatch 的值，
  - 可以是函数，可以不是。如果是函数，就更新为函数的结果，如果不是函数，直接更新为值。
- initState: 初始值。
  - 可以是函数，可以不是。如果是函数，就更新为函数的结果，如果不是函数，直接更新为值。

```js
  // 返回一个数组，第一个值是state，第二个值修改state 的方法
  const [ classComName, setClassComName ] = useState(() => 'cc');

  const handleClick = (res) => {
    setClassComName(() => res)
  }
```

```js
  export default function FuncCom() {
    const [ number, setNumber ] = useState(0);
    const [ msg, setMsg ] = useState('luyi');
    const [ list, setList ] = useState([]);

    return (
      <div>
        <div>函数组件--{number}</div>
        <button onClick={() => {  setNumber(number + 1) }}>+</button>
        <button onClick={() => { setNumber(number - 1) }}>-</button>
        <input value={msg} onChange={(e) => setMsg(e.target.value)} />
      </div>
    )
  }
```

### 子父组件传值

### 生命周期
#### 初始化阶段
##### constructor 先执行
- 初始化 state，截取路由参数
- 防抖、截流
##### getDerivedStateFromProps 执行
- 静态函数，纯函数来用
- 传入props和state，返回值将和之前的state进行合并，作为新的 state
```js
static getDerivedStateFromProps(props, state) {
  return {
    nameList: props.name.split('')
  }
}
```
##### componentWillMount 执行
> UNSAFE_componentWillMount
- 渲染之前执行
- 如果有了 getDerivedStateFromProps 或者 getSnapshotBeforeUpdate 生命周期，则不执行componentWillMount

##### render

##### componentDidMount 执行

#### 更新阶段
##### componentWillReceiveProps
- 如果我的组件中，已经有了getDerivedStateFromProps 则不会执行componentWillReceivedProps
  - 有一些数据，我props发生改变的时候，props的改变来决定 state 是否更新
  - 弹窗 visible - state.

##### getDerivedStateFromProps

##### shouldComponentUpdate
相当于一个拦截器，返回一个bool，来决定组件要不要更新

##### componentWillUpdate
- 获取组件更新前的一些状态，DOM位置

##### render
createElement

##### getSnapshotBeforeUpdate
获取更新前的快照。
- commitBeforeMutationLifeCycle

##### componentDidUpdate 执行
是不能调用 setState !!!!!

#### 销毁阶段

##### componentWillUnMount 执行

### react 生命周期的替代方案

#### useEffect
`useEffect(() => destory, deps)`
- () => destory，即callback，第一个是参数，是一个函数
- destory 作为callback 的返回值，在下一次callback 执行前调用
- deps 第二个参数，是一个数组，数组的值发生改变，执行上一次的 destory，并再次执行 callback

## 同步还是异步？
### react 17 lagecy 模式
```js
  handleClick = (type) => {
    // isbatchingUpdate = true
    console.log('click', type)
    // 只执行一次
    this.setState({
      number: this.state.number + (
        type === 'plus' ? 1 : -1
      )
    })
    this.setState({
      number: this.state.number + (
        type === 'plus' ? 1 : -1
      )
    })

    setTimeout(() => {
      // 执行多次
      this.setState({
        number: this.state.number + (
          type === 'plus' ? 1 : -1
        )
      });
      this.setState({
        number: this.state.number + (
          type === 'plus' ? 1 : -1
        )
      })
    })
    // isbatchingUpdate = false
  }
```

### react 18
只执行一次。

### ReactDomUpdateBatching
```js
export function batchedEventUpdates (fn) {
  isBatchingUpdate = true;
  try {
    fn();
  };
  isBatchingUpdate = false;
}
```

## 面试问到性能
### 1. 指标是什么？
交互指标
- 首屏速度
- 输入延迟
  - 高优先级打断低优先级

FMP? FP? LCP? FID?

## 费曼技巧
尝试用一个自己熟悉的领域的知识，去解释一个自己不熟悉的领域。

## 函数式编程
- 高阶函数。

幂等
input -- output
function (b) {
  return window.a + b;
}

bundle, chunk, module, 模块, sidEffect

## use API
## useCallback useMemo
## HOC

## P7
- 技术无关的能力。
  - redux mobx
    - luyi

qiankun2



