### 作用域 + 上下文
#### 作用域链 - xxx is undefined | 'value' of undefined
* 面试题
```js
  // 执行顺序
  let a = 'global';
  console.log(a);

  function course() {
    let b = 'js';
    console.log(b);

    session();
    function session() {
      let c = 'this';

      teacher();
      // 2. 函数提升 - 作用域之内
      function teacher() {
        // 2.1 let不支持提升
        // 2.2 变量通过var支持提升，声明提升
        // var e = undefined
        console.log(e);
        let d = 'yunying';
        var e = 'yy';
        // e = 'yy';
        console.log(d);

        console.log('test1', b);
        // 3. 作用域向上查找，向下传递
      }
    }
  }
  course();

  // 提升优先级
  console.log('yunyin', yunyin);
  function yunyin() {
    this.course = 'js';
  }
  yunyin = 'course';
  // 变量优先 => 函数需要变量

  // 块级作用域
  if (true) {
    let e = 111;
    var f = 222;
  }
  console.log(f);
  console.log(e);
```
* 1. 对于作用域链我们直接通过创建态来定位作用域链 - 静态
* 2. 手动取消全局

### this 上下文 context
* 我家门前有条河，门前的河上有座桥，门前的河里有群鸭
* 我家门前有条河，这河上有座桥，这河里有群鸭

* this是在执行时动态读取上下文决定的，而不是创建时

考察重点 - 各使用态的指针指向
#### 函数直接调用中 - this指向的是window
=> 全局上执行的环境 => 函数表达式、匿名函数、嵌套函数
```js
  function foo() {
    console.log('函数内部', this);
  }

  foo();
```

#### 隐式绑定 - this指代调用堆栈的上一级 => 对象、数组等引用关系逻辑
```js
  function fn() {
    console.log('隐式绑定', this.a)
  }
  const obj = {
    a: 1,
    fn
  }

  obj.fn = fn;
  obj.fn();
```

#### 面试题: 
```js
  const foo = {
    bar: 10,
    fn: function() {
      console.log(this.bar);
      console.log(this);
    }
  }
  // 取出
  let fn1 = foo.fn;
  // 独立执行
  fn1();

  // 追问1: 如何改变属性的指向
  const o1 = {
    text: 'o1',
    fn: function() {
      // 直接使用上下文 - 传统派活
      console.log('o1fn', this);
      return this.text;
    }
  }

  const o2 = {
    text: 'o2',
    fn: function() {
      // 呼叫领导执行 -- 部门协作
      return o1.fn();
    }
  }

  const o3 = {
    text: 'o3',
    fn: function() {
      // 直接内部构造 -- 公共人
      let fn = o1.fn;
      return fn();
    }
  }

  console.log('o1fn', o1.fn());
  console.log('o2fn', o2.fn());
  console.log('o3fn', o3.fn());
```

#### 追问：现在我要将console.log('o2fn', oa.fn())的结果是o2
```js
  // 1. 人为干涉，改变this - bind / call / apply
  o2.fn.call(o2);
  // 2. 不需人为改变
  const o1 = {
    text: 'o1',
    fn: function() {
      // 直接使用上下文 - 传统派活
      console.log('o1fn', this);
      return this.text;
    }
  }

  const o2 = {
    text: 'o2',
    fn: o1.fn
  }
  console.log('o2fn', o2.fn());
```

#### 显示绑定 （bind | apply | call）
```js
  function foo() {
    console.log('函数内部', this);
  }

  foo();

  // 使用
  foo.call({
    a: 1
  });
  foo.apply([{
    a: 1
  }])

  const bindFoo = foo.bind({
    a: 1
  });
  bindFoo();
```
#### 面试题：call、apply、bind的区别
1. call vs apply 传参不同 依次传入/数组传入
2. bind 直接返回不同

#### bind的原理 / 手写一个bind
* 原理或者手写类的题目，解题思路
1. 说明原理，写下注释
2. 根据注释补齐代码
```js
  // 1. 需求：手写bind => bind位置（挂载在哪里）=> Function.prototype
  Function.prototype.newBind = function() {
    // 2. bind是什么？
    // 改变this
    const _this = this;
    // 接受参数args，第一项参数是新的this，第二项到最后一项是函数传参
    const args = Array.prototype.slice.call(arguments);
    const newThis = args.shift();

    // 3. 返回值
    return function() {
      return _this.newApply(newThis, args);
    }
  }

  Function.prototype.newApply = function(context) {
    context = context || window;

    // 挂载执行函数
    context.fn = this;

    let result = arguments[1] ? context.fn(...arguments[1]) : context.fn();

    delete context.fn;
    return result;
  }
```

### 闭包：一个函数和他周围状态的引用捆绑在一起的组合
```js
  // 函数作为返回值的场景
  function mail() {
    let content = '信';
    return function() {
      console.log(content);
    }
  }
  const envelop = mail();
  envelop();

  // 函数作为参数的时候
  let content;
  function envelop(fn) {
    content = 1;

    fn();
  }

  function mail() {
    console.log(content);
  }
  envelop(mail);

  // 函数嵌套
  let counter = 0;

  function outerFn() {
    function innerFn() {
      counter++;
      console.log(counter);
    }
    return innerFn;
  }
  outerFn()();

  // 立即执行函数 => js模块化基石
  let count = 0;
  (function immediate(args) {
    if (count === 0) {
      let count = 1;

      console.log(count);
    }
  })(args);

  // 实现私有变量
  function createStack() {
    return {
      items: [],
      push(item) {
        this.item.push(item);
      }
    }
  }

  const stack = {
    items: [],
    push: function() {}
  }

  function createStack() {
    const items = [];
    return {
      push(item) {
        items.push(item);
      }
    }
  }
```
