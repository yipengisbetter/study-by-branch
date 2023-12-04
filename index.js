// 作用域
(function () {
  console.log('简单来说，作用域就是一块一块的，有个大括号{}');
  console.log('if (xxx) {}');
  console.log('function() {}');
})();

// 作用域链
(function () {
  console.log("作用域链的例子");

  var a = 0;

  (function outer() {
    var b = 1;

    (function inner() {
      var c = 2;
      console.log("作用域链依次能访问c, b, a", c, b, a);
    })();
  })();
})();

// 变量、函数提升
(function () {
  var a = 0;
  console.log('这里是变量，因为已经赋值给变量了', a);

  function a() {}
  console.log('这里是变量，因为函数申明的形式不会二次赋值', a);
})();

(function () {
  console.log('变量、函数提升，函数高于变量，所以打印的是函数', a);
  function a() {}
  var a = 0;
  console.log('这里是变量，因为已经赋值给变量了', a);
})();

// 全局调用下的this
(function () {
  console.log('this 指向的是上一级被调用对象，如果没有被对象包裹（箭头函数除外），则使用的window对象');

  console.log('这里的this是window', this);
})();

// 一般函数调用下的this
(function () {
  (function () {
    console.log('这里的this也是window', this);
  })()
})();

// 对象方法调用下的this
(function () {
  var name = 'window';
  var obj = {
    name: 'obj',
    sayName() {
      console.log('这里的this是obj', this.name);
    },
    sayWindowName: () => {
      console.log('箭头函数下的this指向的是最近一层作用域的this，所以这里是window', this.name);
    }
  }
  obj.sayName();
  obj.sayWindowName();
})();

// 闭包
(function () {
  console.log('我使用了上面作用域的变量啦');
  fn();

  function fn() {
    console.log(location);
  }
})();

// 普通的改变this指向
(function () {
  var obj = {}
  console.log('这里的this指向的obj');
  obj.fn = sayThis;
  obj.fn();
  delete obj.fn;

  function sayThis() {
    console.log(this);
  }
})();

// 使用bind
(function () {
  var obj = {};
  var newSayThis = sayThis.bind(obj);
  console.log('这里的this指向bind之后的obj');
  newSayThis()

  function sayThis() {
    console.log(this);
  }
})();

// 使用call
(function () {
  var obj = {};
  console.log('这里的this指向call的obj');
  sayThis.call(obj, 'call param')

  function sayThis(...rest) {
    console.log(this, ...rest);
  }
})();

// 使用apply
(function () {
  var obj = {};
  console.log('这里的this指向apply的obj');
  sayThis.apply(obj, ['apply param'])

  function sayThis(...rest) {
    console.log(this, ...rest);
  }
})();

// 函数调用的方式
(function () {
  function fn(...rest) {
    console.log('我是fn，我被调用啦', ...rest)
  }

  function callFn(fn, ...rest) {
    fn(...rest);
  }

  function bindFn(fn, ...rest) {
    return function() {
      fn(...rest);
    }
  }

  console.log('直接调用');
  callFn(fn, 'by callFn');
  console.log('等待后续调用');
  bindFn(fn, 'by bindFn')();
})();

// obj + callFn实现call、apply
(function () {
  function fn(...rest) {
    console.log('我是fn，我被调用啦', this, ...rest)
  }

  Function.prototype.myCall = function (target, ...rest) {
    target.fn = this;
    target.fn(...rest);
    delete target.fn;
  }

  Function.prototype.myApply = function (target, rest) {
    target.fn = this;
    target.fn(...rest);
    delete target.fn;
  }

  var obj = {};
  fn.myCall(obj, 'call, this 是 obj');
  fn.myApply(obj, ['apply, this 是 obj']);
})();

// obj + bindFn实现bind
(function () {
  function fn(...rest) {
    console.log('我是fn，我被调用啦', this, ...rest)
  }

  Function.prototype.myBind = function (target, ...rest) {
    var fn = this;

    return function () {
      target.fn = fn;
      target.fn(...rest);
      delete target.fn;
    }
  }

  var obj = {};
  fn.myBind(obj, 'bind, this 是 obj')();
})();
