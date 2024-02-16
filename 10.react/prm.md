# react 高级

## ref

### ref的创建
#### 类组件 - createRef
```js
class ClassRef extends Component {
  constructor(props) {
    // 对于类组件来说，我们一般使用createRef 来进行创建
    super(props);
    this.eleRef = createRef();
    this.inputRef = createRef();
  };

  handleClick = () => {
    // 我们点一下按钮，我们光标就命中到 input 上
    this.inputRef.current.focus();
    console.log(this.eleRef);
  }

  render () {
    return (
      <div>
        <div id="this_is_me" ref={this.eleRef} />
        <input ref={this.inputRef} />
        <button onClick={this.handleClick}>Focus</button>
      </div>
    )
  }
}
```

#### 函数组件 - useRef
```js
function FuncRef() {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.focus();
  }

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus</button>
    </div>
  )
}
```

### ref 常见的使用方式

#### ref 标识
ref 一般可以标识在 hostComponent (首字母小写的，最终会变成基础HTML元素的);

#### ref 转发子组件
ref 本身是不能跨层级捕获和传递的，forwardRef 可以接收父元素的ref信息，转发下去。
我们可以通过forwardRef 进行转发。
```js
{
  render() {
    return (
      <div>
        <div id="this_is_me" ref={this.eleRef} />
        <Child ref={this.childRef} />
        <input ref={this.inputRef} />
        <button onClick={this.handleClick}>Focus</button>
      </div>
    )
  }
}

const Child = forwardRef((props, ref) => (
  <div>
    <button ref={ref} id="my-btn"></button>
  </div>
))
```

##### 特殊用法，可以不care
```js
const Child = forwardRef((props, ref) => <Son forwardRef={ref} />)

class Son extends Component {
  constructor(props) {
    super(props);
    this.btn = null;
    this.input = null;
  }

  componentDidMount() {
    const { forwardRef } = this.props;
    forwardRef.current = {
      btn: this.btn,
      input: this.input
    }
  }

  render() {
    return (
      <div>
        <input ref={input => this.input = input} />
        <button ref={btn => this.btn = btn}></button>
      </div>
    )
  }
}
```

#### expose - 在父组件中，直接调用子组件的方法

useInperativeHandle
- p1: ref 接收forwardRef 传递进来的ref
- createHandle: 返回暴露给父组件的 ref 对象
- deps: 更新ref对象的依赖

```js
function FuncRef() {
  const inputRef = useRef(null);
  const exposeRef = useRef(null);

  const handleClick = () => {
    inputRef.current.focus();
  }

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>Focus</button>
      <div>
        <FancyInput ref={exposeRef} />
        <button onClick={() => exposeRef.current.focus()}>InputFocus</button>
        <button onClick={() => exposeRef.current.changeValue("luyi")}>changeValue</button>
      </div>
    </div>
  )
}

// 子组件有个 Modal, Drawer -- visible
const Input = (props, ref) => {
  const inputRef = useRef();

  const focus = () => {
    inputRef.current.focus();
  }

  const changeValue = (val) => {
    inputRef.current.value = val;
  }

  useImperativeHandle(ref, () => ({
    focus, changeValue
  }));

  return <input ref={inputRef} />
}

const FancyInput = forwardRef(Input);
```

## context
类似Vue中的inject和provider
对应过来就是consumer和provider

### 类用法
```js
export default class ClassContext extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: "dark"
    }
  }

  render() {
    return (
      <ThemeContext.Provider value={this.state.theme}>
        <Parent />
        <button onClick={() => this.setState({theme: 'light'})}>
          light
        </button>
        <button onClick={() => this.setState({theme: 'dark'})}>
          dark
        </button>
      </ThemeContext.Provider>
    )
  }
}

const Parent = () => (
  <div>
    <Child1 />
    <Child2 />
  </div>
)

class Child1 extends Component {
  static contextType = ThemeContext;

  render() {
    return (
      <div>
        Child1 -- {this.context}
      </div>
    )
  }
}

class Child2 extends Component {
  render() {
    return (
      <div>
        <ThemeContext.Consumer>
          {
            (theme) => (
              <div>
                Child2 -- {theme}
              </div>
            )
          }
        </ThemeContext.Consumer>
      </div>
    )
  }
}
```

### 函数用法
```js
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const theme = "blue";

export default function FuncContext() {
  return (
    <ThemeContext.Provider value={theme}>
      <Parent />
    </ThemeContext.Provider>
  )
}

const Parent = () => <Child />;

const Child = () => {
  const theme = useContext(ThemeContext);
  return (
    <div>
      <span>Func Usage</span>
    </div>
  )
}
```

```js
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const theme = "blue";

const navgator = window.history;

export default function FuncContext() {
  return (
    <ThemeContext.Provider value={navgator}>
      <Parent />
    </ThemeContext.Provider>
  )
}

const Parent = () => <Child />

const Child = withNavigator((props) => {
  console.log(props.navgator)
  const theme = useContext(ThemeContext);
  return (
    <div>
      <span style={{ background: theme }}>Func Usage</span>
    </div>
  )
})

const withNavigator = (Component) => {
  return function () {
    const navgator = useContext(ThemeContext);
    return <Component navgator={navgator} />
  }
}
```

## HoC
### 属性代理
```js
import React from 'react';

const withCard = (color) => (Component) => {
  const PrivateCom = (props) => {
    const hocStyle = {
      margin: "4px",
      padding: "4px",
      border: "1px solid #ccc",
      borderRadius: "4px",
      background: color
    }

    return (
      <div style={hocStyle}>
        <Component {...props} hoc={'true'} />
      </div>
    )
  }

  return PrivateCom;
}

const PropsExtends = ( props ) => {
  return (
    <div> P1 -- {  props.hoc } </div>
  )
}

export default withCard('blue')(PropsExtends);
```

### 反向继承
```js
import React, {  Component } from 'react';

// 比如我们有一个 case，我们需要非常优雅地实现埋点的曝光

function logProps(logMap) {
  return (WrappedComponent) => {
    const didMount = WrappedComponent.prototype.componentDidMount;
    return class A extends WrapperComponent {
      componentDidMount() {
        if (didMount) {
          didMount.apply(this);
        }

        Object.entries(logMap).forEach(([k, v]) => {
          if (document.getElementById(k)) {
            console.log(v);
          }
        })
      }

      render() {
        return super.render();
      }
    }
  }
}

export default function ReverseExtends() {
  return (
    <div>
      <LogIndex />
    </div>
  )
}

class Index extends Component {
  render() {
    return (
      <div>
        <div id="text">
          这是一个简单的XXX组件
        </div>
      </div>
    )
  }
}
const LogIndex = logProps({ "text": "text_module_show" })(Index);
```

## react
我们要做运行时的代码优化

### 父组件直接隔离子组件的渲染

#### 类组件
```js
import React, { Component } from 'react';

export default class RenderControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0,
      count: 0
    }

    this.component = <Child num={this.state.num} />
  }

  controllComponentRender = () => {
    const { props } = this.component;
    if (props.num !== this.state.num) {
      return this.component = React.cloneElement(this.component, { num: this.state.num })
    }
    return this.component;
  }

  render() {
    return (
      <div>
        {this.controllComponentRender()}
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          num: {this.state.num}
        </button>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          count: {this.state.count}
        </button>
      </div>
    )
  }
}

const Child = ({ num }) => {
  console.log('子组件执行');
  return <div>this is the child {num}</div>
}
```

#### 函数组件
useMemo 的实现
```js
export default function RenderControl() {
  const [num, setNum] = useState(0);
  const [count, setCount] = useState(0);

  return (
    <div>
      {useMemo(() => <Child num={num} />, [num])}
      <button onClick={() => setNum(num + 1)}>num: { num }</button>
      <button onClick={() => setCount(count + 1)}>count: { count }</button>
    </div>
  )
}
```

useMemo
- 函数：返回值进行缓存
- deps：依赖项，谁变了，我再次执行这个函数

useCallback
- 函数：返回值，缓存这个函数
- deps：依赖项，谁变了，我再次执行这个函数

```js
import React, { Component, useCallback, useMemo, useState } from 'react';

export default function RenderControl() {
  const [num, setNum] = useState(0);
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {

  }, []);

  const memoChildNum = useMemo(() => <Child num={num} name={'num'} />, [num]);
  const memoChildCount = useMemo(() => (
    <Child num={count} name={'count'} onClick={handleClick} />
  ), [count, handleClick]);

  return (
    <div>
      {memoChildNum}
      {memoChildCount}
      <MemoChild num={count} name={'count'} onClick={handleClick} />
      <button onClick={() => setNum(num + 1)}>num: {num}</button>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
    </div>
  )
}

const Child = ({ num, name }) => {
  console.log("子组件执行" + name);
  return <div>this is the child {name}</div>
}

const MemoChild = React.memo(Child);
```

### 组件本身控制要不要额外渲染
- 声明渲染 shouldComponentUpdate
- PureComponent
  - 对props和state做一层浅比较
```js
export default class RenderControl extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      obj: {
        num: 0,
        count: 0
      }
    }
  }

  handleClick = () => {
    this.state.obj.num = 10;
    // setState 触发渲染。
    // PureComponent不更新，因为做的是浅比较。
    this.setState({
      obj: this.state.obj
    })
  }

  render() {
    const { num, count } = this.state.obj;

    return (
      <div>
        <div>{num}, {count}</div>
        <button onClick={this.handleClick}>10</button>
      </div>
    )
  }
}
```

## Q & A

### hostComponent
宿主元素

### 主题
- 用context，css 和 js 搅在一起了。
- css 的全局变量是啥呢
- `var(xxx-xxx)`
- 媒体选择器

### 聊一聊
#### why ? context, ref
##### 在一些1%的场景下，你们用了，会提升自己的成就感
##### 后面 redux，router，你们会更容易理解相关的原理
##### 面试

#### 架构
react ?
webpack ?

不依赖工具，也不局限工具。

架构的技术能力，不只是体现在规则，主要是灵活性。

越灵活，你要考虑的边界 case，和 防劣化的 case 就越多。

```js
const drawPic = (params) => {

}

// params { ... }
// array obj

```

## leetcode上算法题太多了，面试优先刷哪些，老师给个建议？
### Top 100 简单、中等
Carol 算法训练营

