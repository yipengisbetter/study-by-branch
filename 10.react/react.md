# react 源码

## 源码怎么学
1. react 源码，很多人都没读过；
2. 读过的，和写得好不好，没啥大关系；
3. 就算不读，依然回答得好问题；
4. 读了，未必面试就能过；
5. 你为什么要读源码，有啥帮助？
  1. 心里有数
  2. 思想部分可以借鉴
  3. 应付面试

### 课上能干啥
- 通过这两节课，帮你们搞定 react 的工作流程
- 通过下面的课，RN的课，帮你们更好的理解react

### 一起思考一下
```js
<div>
  <h2>hello world</h2>
  <p>{text}</p>
  {
    [...data].map(item => <Children data={item} />)
  }
</div>
```

- data 数据改变的话，怎么最快得判断出来，如何更新？？？
- react 要保持运行时的灵活性，最好的办法，就是 从头遍历一遍
**看一看，你改的，和之前的，到底有什么区别，然后把区别更新。**

### react 版本
- V15 stack reconciler
  - 我从根节点，遍历递归

- 16.9 ～ 17.0.2 fiber reconciler
- 做一个异步可中断的更新
- 我在 17.0.2 的版本里，先把数据结构给你做了，在整一些不稳定的，但是也能用的东西，你可以试试；
- 我先吹出来，我要实现高优先级打断低优先级；

- 17.0.2
- legacy 模式：CRA 默认创建，我有 Fiber 的结构，但是我不会打断 -- xxx.old.js
- current 模式：可以实现高优先级打断低优先级的 -- xxx.new.js

- 18
  - concurrent 模式 ++

### 双缓存
canvas

### react 中基本的数据结构

#### v-dom / element
```js
function App() {
  return (
    <div className="app">
      <h2>hello</h2>
      <div id="list">
        <ul>
          <li>list 1</li>
          <li>list 2</li>
          <li>list 3</li>
        </ul>
      </div>
    </div>
  );
}
```
本质上，就是一个函数。
但是函数需要执行，执行后的结果，明显不是 JS 的标准

#### fiber
本质上，就是一个数据结构
```js
FiberNode = {
  tag, // 标明是什么类型的 fiber
  key,
  type, // dom 元素的类型

  // fiber 是链表的形式构建的
  return, // 指向父节点
  child,  // 指向子节点
  sibling, // 指向兄弟节点

  // pendingProps, memoizedProps, updateQueue, memorizedState

  effectTag, // 用来收集 Effect
  nextEffect, // 指向下一个 Effect
  firstEffect, // 指向第一个Effect
  lastEffect, // 指向最后一个Effect

  alternate // 双缓存树，current 指向对应的workInProgress
}
```

##### workInProgress Fiber

##### current Fiber

#### DOM

### react 的整体流程

#### 第一步： 创建 fiberRoot 和 rootFiber
- fiberRoot 就是一个根节点，containerInfo => id=app
- rootFiber 我整个react要去渲染的 tag:3 的节点

```js
function createFiberRoot(containerInfo, tag) {
  const root = new FiberRootNode(containerInfo, tag);
  const rootFiber = createHostRootFiber(tag);
  root.current = rootFiber;
  return root;
}
```

##### render 开始的函数调用栈
- render
- legacyRenderSubtreeIntoContainer
  - 我先判断 root 的dom节点下，有没有_reactRootContainer
  - 如果没有，进入legacyCreateRootFromDOMContainer
  - legacyCreateRootFromDOMContainer
    - 核心，就是创建根 Fiber 节点
    - createLegacyRoot
      - new ReactDOMBlockingRoot
        - createRootImpl
          - createContainer
            -createFiberRoot
  - updateContainer
    - **scheduleUpdateOnFiber**
      - markUpdateLaneFromFiberToRoot
      - **performSyncWorkOnRoot**
        - renderRootSync
          - workLoopSync
```js
function workLoopSync() {
  while(workInProgress !== null) {
    performUnitOfWord(workInProgress);
  }
}
```
            - performUnitOfWork

#### 第二步：beginWork 和 completeWork

##### 递归流程
```js
function workLoopSync() {
  while(workInprogress !== null) {
    performUnitOfWork(workInProgress);
  }
}

function perfromUnitOfWork() {
  next = child = beginWork(current, unitWork);
  if (next === null) {
    next = completeUnitOfWork(unitWork);
  }
}
```

##### beginWork: 创建你的 workInProgressFiber
使用 v-dom 和 current fiber 对比，向下调和的过程
就是由 fiberRoot 按照child指针逐层向下调和，期间会执行 函数组件，diff 子节点，打上不同的effectTag

```js
function beginWork(current, workInProgress) {
  switch(workInProgress.tag) {
    case IndeteminateComponent:
    case FunctionComponent:
    case ClassComponent:
    case HostComponent:
  }
}
```

- 对于组件，执行部分生命周期，执行render，执行函数，得到最新的vdom  children
- 向下遍历调和 children
- 打上不同的 effectTag - flags

##### completeWork: 根据 effectTag，创建 effectList，以及创建真实的dom
是向上归并的过程，如果有兄弟节点，会返回 sibling 兄弟
- 生成 effectList
- 构建真实的dom，但是我没有挂载到界面上
  - **createInstance**

```js
isTrue ? (
  <div>
    <xxx>
      ...
    </xxx>
  </div>
) : null
```

#### 第三步 commitWork
- **performSyncWorkOnRoot**
  - commitRoot
    - runWithPriority$1
      - commitRootImpl

##### flushPassiveEffect
- 处理一些还没有执行完的 useEffect - 才去执行。

##### commitBeforeMutationEffects - 更新前
- getSnapshotBeforeUpdate

##### commitMutationEffects - 更新
- mutation 阶段
- 处理 PlaceMent, Update, Deletion

##### root.current = finishedWork = workInProgress Fiber;

##### commitLayoutEffects - 更新后
- cdm, cdu
- useLayoutEffect
- setState -> callback
- useEffect - push

## Q & A

### 算法要学到什么程度？
- leetcode hot 100 简单、中等
- 四大算法搞清楚

### react 源码的面试题

#### react 为什么要做 fiber ?
- 原有的 stack reconciler 是同步的，我要做一个异步可中断的中断。

### 什么是fiber?
fiber 本质就是一个数据结构

### ajax - abort
```js
let _reject;
Promise.race([ new Promise((resolve, rehect) => {
  _reject = reject;
}), fetch() ]);
_reject();

AbortController

```















