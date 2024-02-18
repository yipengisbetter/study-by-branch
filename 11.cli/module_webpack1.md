# 模块化开发和webpack1
## 本课程大纲
- 什么叫模块化，模块化的由来历史
什么叫模块化开发，之前怎么干，之后又怎么干，演练手撸一个demo
- 模块化需要什么（加载器）- CommonJS vs EsModule
- 手撸一个加载器
- 模块分析和ast
- 依赖分析和打包

### 什么叫模块化
作为一个原始的前端是怎么干的，不借助任何工具写一个计算器，加减乘除
```js
function add(a, b) {
  return a + b;
}

function minus(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

console.log('3 + 4 = ', add(3, 4));
console.log('7 - 2 = ', minus(7, 2));
console.log('3 x 4 = ', multiply(3, 4));
console.log('6 / 3 = ', divide(6, 3));
```
这不是我们想要的，哪里有模块化？我们想要什么？
```js
add.js -> function add(a, b) { return a + b; }

minus.js -> function minus(a, b) { return a - b; }

multiply.js -> function multiply(a, b) { return a * b; }

divide.js -> function divide(a, b) { return a / b; }

index.js ->

import add from './add.js';
import minus from './minus.js';
import multiply from './multiply.js';
import divide from './divide.js';

console.log('3 + 4 = ', add(3, 4));
console.log('7 - 2 = ', minus(7, 2));
console.log('3 x 4 = ', multiply(3, 4));
console.log('6 / 3 = ', divide(6, 3));
```
### CommonJS 和 ESModule
先来看下，它在维基百科上的定义：
> CommonJS 是一个项目，其目标是为 JavaScript 在网页浏览器之外创建模块约定。创建这个项目的主要原因是当时缺乏普遍可接受形式的 JavaScript 脚本模块单元，模块在与运行 JavaScript 脚本的常规网页浏览器所提供的不同的环境下可以重复使用。

Node.js应用由模块组成，每个文件就是一个模块，有自己的作用域。在一个文件里面定义的变量、函数、类，都是私有的，对其他文件不可见。

require 用来加载某个模块
module 代表当前模块，是一个对象，保存了当前模块的信息。exports 是 module 上的一个属性，保存了当前模块要导出的接口或者变量，使用 require 加载的某个模块获取到的值就是那个模块使用 exports 导出的值。

为了方便，Node.js 在实现 CommonsJS 规范时，为每个模块提供了一个 exports 的私有变量，指向 module.exports。你可以理解为 Node.js 在每个模块开始的地方，添加了如下这行代码。
```js
var exports = module.exports;
```
#### 考点：module.exports 和 exports 有什么区别？
1. exports 对象是 module 对象的一个属性，在初始时 module.exports 和 exports 指向同一块内存区域
2. 模块导出的是 module.exports， exports 只是对它的引用，在不改变 exports 内存的情况下，修改 exports 的值可以改变 module.exports 的值
3. 导出时尽量使用 module.exports ，以免因为各种赋值导致的混乱
```js
// index. js
export.a = 1;

module.exports = {
  b: 2
}

console.log('module.exports导出之后是否指向相同内存', exports === module.exports);

// main.js
console.log('module.exports exports 初始化是否指向相同内存', exports === module.exports);

const index = require('./index');

console.log('require index == ', index);
```
### ESModule
esm 是 tc39 对于ECMAScript 的模块化规范，正因是语言层规范，因此在 Node 及 浏览器 中均会支持。
ESM模块化分三步：
1. 构造，寻找并且下载所有的文件且解析成模块记录（Module Records）（包含当前模块代码的抽象语法树，当前模块的依赖模块的信息）。
2. 实例化，将模块记录实例化将各个模块之间的import、export部分对应的都在内存中指向到一起（linking）
3. 执行，将import、export内存里指向的地址填上实际的值。

它使用 import/export 进行模块导入导出
```js
// sum.js
export const sum = (x, y) => x + y;

// index.js
import { sum } from "./sum";
```
esm 属于静态引入方案，也就是引入时并不真的下载文件，而是建立了绑定关系。在浏览器测试：
```js
const ms = await import("https://cdn.skypack.dev/ms@latest");

ms.default(1000);
```
ESModule实际案例
```js
// demo1.js
export const str = 'hello world'; // 变量

export function func(a) { // 函数
  return a + 1;
}

export default '你好，中国';

// demo2.js
import str1, { str, func } from 'demo';
```
#### ESM的export和export default区别
按照正常逻辑，使用 import 命令的时候，开发者需要知道所要加载的变量名或函数名，否则无法加载，但是为了方便开发者使用，不拘泥于文档说明，于是提供了 export default 命令，为模块指定默认输出。
export 导出需要明确变量名，引用需要指定
export default 无需变量名，引用也无需名称一致
#### 考点：对比cjs和esm的区别
- esm输出的是值的引用，而cjs输出的是值的拷贝
- esm是编译时执行，而cjs是运行时加载
- esm可以导出多个值，而cjs是单个值的导出
- esm静态语法只能写在顶层，而cjs是动态语法可以写在判断里
- esm this 是undefined，而cjs 的 this 是当前模块

一个很好的例子
```js
// module-a.js
const { x } = require('./module-b');
console.log('this is module-a.js');
console.log('x: ', x);
module.exports = { y: 666 };

// module-b.js
const { y } = require('./module-a');
console.log('this is module-b.js');
console.log('y: ', y);
module.exports = { x: 888 };
```
```js
// module-a.js
import { x } from './module-b.js';
console.log('this is module-a.js');
console.log('x: ', x);
export const y = 'yyyyyyy';

// module-b.js
import { y } from './module-a.js';
console.log('this is module-b.js');
console.log('y: ', y);
export const x = 'xxxxxx';
```
#### 其他前端模块化的方案
我们对 CommonsJS 的规范已经非常熟悉了， require 命令的基本功能是，读入并执行一个 js 文件，然后返回该模块的exports对象，这在服务端是可行的，因为服务端加载并执行一个文件的时间消费是可以忽略的，模块的加载时运行时同步加载的， require 命令执行完后，文件就执行完了，并且成功拿到了模块导出的值。
这种规范天生就不适用于浏览器，因为它是同步的。可想而知，浏览器端每加载一个文件，要发网络请求去取，如果网速慢，就非常耗时，浏览器就要一直等 require 返回，就会一直卡在那里，阻塞后面代码的执行，从而阻塞页面渲染，使得页面出现假死状态。
为了解决这个问题，后面发展起来了众多的前端模块化规范，包括 CommonJS 大致有如下几种：
Javascript modularization -> (Backend -> CommonJS -> Node.js), (FrontEnd -> (AMD -> RequireJS), (CMD -> Sea.js)), (BackEnd FrontEnd -> ES6 Modules -> ES6)
#### 实操一个webpack核心
.js -> .hbs -> (.js -> .png, .jpg), .cjs -> .sass ---> .jpg ——> webpack ——> .js, .css, .jpg, .png
.sass -> .sass -> .jpg
