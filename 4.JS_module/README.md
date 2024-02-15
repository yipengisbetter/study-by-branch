## JS 模块化
### 1. 不得不说的历史
#### 背景
JS本身定位：简单的页面设计 -- 页面简单动画 + 基本的表单提交
并无模块化 or 命名空间的概念

> JS的模块化需求日益增长

#### 幼年期：无模块化（委婉的辩解）
1. 开始需要在页面中增加一些不同的js：动画、表单、格式化工具
2. 各种js文件被分在不同的文件中
3. 不同的文件又被同一个模板所引用
```js
  // test.html
  <script src="jquery.js"></script>
  <script src="main.js"></script>
  <script src="tool.js"></script>
```
认可：
文件分离时最基础的模块化，第一步

* 追问：
script标签两个变量参数 - async & defer
```js
  <script src="main.js" async></script>
```
总结：
普通 - 解析到标签，立刻pending，并且下载执行
defer - 解析到标签，开始异步下载，解析完成之后开始执行
async - 解析到标签，开始异步下载，下载完成后立刻执行并阻塞原解析，执行结束后，继续解析

问题出现：
* 污染全局作用域 => 不利于大型项目的开发以及多人团队共建

#### 成长期：模块化雏形 —— IIFE（语法侧的优化）
##### 作用域的把控
栗子：
```js
  // 定义一个全局变量
  let count = 0;

  // 代码块1
  const increase = () => count ++;

  // 代码块2
  const reset = () => {
    count = 0;
  }

  increase();
  reset();
```

利用函数独立作用域
```js
  (() => {
    let count = 0;
    // ...
  })();
```
定义逻辑 + 立即执行 => 独立的空间
实现一个最最最最最最初步的模块

尝试去定一个最简单的模块
```js
  const module = (() => {
    let count = 0;
    // 主流程 功能
    return {
      increase: () => ++count;
      reset: () => {
        count = 0;
      }
    }
  })();
  module.increase();
  module.reset();
```

** 追问：如果有额外依赖，如何处理？
> 优化1: 依赖其他模块的IIFE
```js
  const iifeModule = ((depModule1, depModule2) => {
    let count = 0;
    const obj = {
      increase: () => ++count;
      reset: () => {
        count = 0;
      }
    }
    // depModule1, depModule2
    // return
  })(dependencyModule1, dependencyModule2);
```

** 面试1: 早期jquery的依赖处理 => IIFE + 传参调配实际上，传统框架利用一种揭示模式的写法
```js
  const iifeModule = ((depModule1, depModule2) => {
    let count = 0;
    const obj = {
      increase: () => ++count;
      reset: () => {
        count = 0;
        // fn(depModule1);
        // fn(depModule2);
      }
    }
    return {
      reset
    }
  })(dependencyModule1, dependencyModule2);
  iifeModule.reset();
```

* 追问方向：
面试后续引导方向：
1. 深入模块化实现
2. 转向框架：jquery vue react模块化细节，以及框架特征原理 => 框架
3. 转向设计模式：注重模块化的设计

#### 成熟期
##### CJS - commonjs
> node.js制定
特征：
* 通过module + export去对外暴露接口
* 通过require进行其他模块的调用

main.js
```js
  const depModule1 = require('./dependencyModule1');
  const depModule2 = require('./dependencyModule2');

  let count = 0;
  const obj = {
    increase: () => ++count;
    reset: () => {
      count = 0;
      // fn(depModule1);
      // depModule1, depModule2
    }
  }

  exports.increase = increase;
  exports.reset = reset;

  module.exports = {
    increase,
    reset
  }
```

```js
  const {
    increase,
    reset
  } = require('main.js');

  increase();
  reset();
```

** 可能被问到的问题 **
实际执行处理
```js
  (function (thisValue, exports, require, module) {
    const depModule1 = require('./dependencyModule1');
    const depModule2 = require('./dependencyModule2');

    // 业务逻辑......
  })(thisValue, exports, require, module);

  // 部分开源源码，分别传入全局、指针、框架作为参数
  (function () {
    // 业务逻辑
  })(window, lodash);
  // window
  // 1. 避免全局变化 ｜ 全局作用域转化为局部的时候，提升效率
  // 2. 编译时候优化压缩 (function(c){c}(window))
  // lodash
  // 1. 独立定制复写，保障稳定
  // 2. 防止全局工具的全局污染
  // undefined
  // 防止被重写
```

> * 优点：
CJS率先在服务实现了从框架层面解决依赖、模块化的问题

* 缺憾
针对的是服务端，对于异步依赖没有很友好地处理解决

新的问题 —— 异步依赖

#### AMD规范
> 通过异步加载 + 允许定制回调函数
经典框架：require.js

新增定义方式：
```js
  define(id, [depModule], callback);
  require([module], callback);

  // 栗子
  define('amdModule', [depModule1, depModule2], (depModule1, depModule2) =>
  {
    let count = 0;
    const obj = {
      increase: () => ++count;
      reset: () => {
        count = 0;
        // fn(depModule1);
        // depModule1, depModule2
      }
    }
    // ....
  })

  // 使用
  require(['amdModule'], amdModule => {
    amdModule.increase();
  })
```

** 面试题：逻辑外壳封装 **
```js
  define('amdModule', [depModule1, depModule2], (depModule1, depModule2) =>
  {
    let count = 0;
    const obj = {
      increase: () => ++count;
      reset: () => {
        count = 0;
        // fn(depModule1);
        // depModule1, depModule2
      }
    }
    // ....

    return {
      increase,
      reset
    }
  })

```

** 面试：一个代码去兼容AMD和CJS **
```js
  (function () {
    // UMD的出现
  })(
  // 目标：一次性去区分CJS和AMD
      // 1. CJS factory
      // 2. module & module exports
      // 3. define
      typeof module === "Object"
        && module.exports
        && typeof define !== "function"
          ? // 是CJS
              factory => module.exports 
              = factory(require, exports, module);
          : // 是CMD
              define
  );
```
> * 优点：解决了浏览器中异步加载模块，可以并行加载多个模块
* 缺点：会有引入成本，缺少考虑按需加载

##### CMD规范 - sea.js
> 按需加载
```js
  define('module', (require, exports, module) => {
    let $ = require('jquery');
    let depModule1 = require('./dependencyModule1');
    // ……
  })
```
* 优点：按需加载，依赖就近
* 缺点：依赖打包，加载逻辑存在于每个模块中，扩大了模块的体积

##### ESM
> 走进新时代

新增定义
引入——import
导出——export

```js
  import depModule1 from './dependencyModule1';
  import depModule2 from './dependencyModule2';

  let count = 0;
  const obj = {
    increase: () => ++count;
    reset: () => {
      count = 0;
      // fn(depModule1);
      // depModule1, depModule2
    }
  }

  export default {
    increase,
    reset
  }

  // 异步加载
  import('xxx').then(a => {
    // ../
  })
```

目标：
1. 隔离每个模块的逻辑和作用域
2. 扩展共同协作的方便程度

=> 可以将无数模块进行随意组装 => 万物皆模块
=> 前端工程化
