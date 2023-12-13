// createObject
function createObject(proto) {
  var o = {};

  // Object.setPrototypeOf(o, proto);
  o.__proto__ = proto;

  return o;
}

// useNew
function useNew(fn, ...rest) {
  var o = Object.create(fn.prototype);
  var r = fn.call(o, ...rest);

  return !!r && (typeof r === 'object') ? r : o;
}

// new
(function () {
  function A(name) {
    this.name = name;
  }

  // var a = new A('a');
  var a = useNew(A, 'a');

  console.log(
    a.__proto__ === A.prototype,
    a.__proto__.constructor === A,
    a instanceof A,
    a.name === 'a'
  );
})();

// Object.create
(function () {
  function A() {}

  // var a = Object.create(A.prototype);
  var a = createObject(A.prototype);
  console.log(
    a.__proto__ === A.prototype,
    a.__proto__.constructor === A,
    a instanceof A
  );
})();

// 继承
(function () {
  function A(name) {
    this.name = name;
  }
  A.prototype.sayName = function() {
    return this.name;
  }

  function B(name) {
    A.call(this, name);
  }

  B.prototype = Object.create(A.prototype);
  B.prototype.constructor = B;

  var b = new B('b');
  console.log(b, b.sayName());
})();
