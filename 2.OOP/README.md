## 面向对象
### 对象是什么？为什么要面向对象？
通过代码抽象，进而描述单个种类物体的方式
#### 特点：面向对象 -- 逻辑上迁移更加灵活、代码复用性更高、高度的模块化

#### 对象的理解
* 对象是对于单个物体的简单抽象
* 对象是容器，封装了属性 & 方法
** 属性：对象状态
** 方法：对象的能力 & 行为

```js
  // 简单对象
  const Course = {
    teacher: 'yunyin',
    leader: 'xh',
    startCourse: name => {
      return `开始${name}课`;
    }
  }

  // A
  Course.teacher = 'xxxx';
  Course.startCourse('react');
  // B
  Course.startCourse('vue');

  // 函数对象
  function Course() {
    this.teacher = 'yunyin';
    this.leader = 'xh';
    this.startCourse = name => {
      return `开始${name}课`;
    }
  }
```

## 构造函数 - 生成对象 => 实例
#### 需要一个模板 - 表征了一类物体的共同特性，从而生成对象
#### 类即对象模版
#### js其实本质上并不是基于类，而是基于构造函数 + 原型链

```js
  function Course() {
    this.teacher = 'yunyin';
    this.teacher = 'xh';
    this.startCourse = name => {
      return `开始${name}课`;
    }
  }

  const course = new Course(args);
```

### Course 本质就是构造函数
* 1. 函数体内使用的this，指向所要生成的实例
* 2. 生成对象用new来实例化
* 3. 可以初始化传参

#### 追问：
#### 如果构造函数不初始化，可以使用具有相同能力吗？
- 无法具有
#### 如果在项目中需要使用，且不希望外界进行感知情况下。如何让外界直接拿到实例化后的对象？ => 单例模式
```js
  function Course() {
    const _isClass = this instanceof Course;
    if (!_isClass) {
      return new Course();
    }

    this.teacher = 'yunyin';
    this.leader = 'xh';
    this.startCourse = name => {
      return `开始${name}课`;
    }
  }

  // 使用方
  const course = Course();
```

* 启发：编写底层api代码时，尽量做到不让外部去感知区分内部类型

#### 引发思考：new是什么？/ new的原理？/ new时候做了些什么？
```js
  function Course() {};
  const course = new Course();
```
* 1. 结构上：创建了一个空对象，作为返回的对象实例
* 2. 属性上：将生成空对象的原型对象指向了构造函数的prototype属性
* 3. 关系上：将当前实例对象赋给了内部的this
* 4. 生命周期上：执行了构造函数的初始化代码

```js
  function usernew(obj, ...args) {
    const newObj = Object.create(obj.prototype);
    const result = obj.apply(newObj, args);

    return typeof result === 'object' ? result : newObj;
  }
```

#### 追问：实例属性影响 -- 独立的
```js
  function Course(teacher, leader) {
    this.teacher = teacher;
    this.leader = leader;
  }
  const course1 = new Course('yunyin', 'xh'); // course1.leader => xh
  const course2 = new Course('yunyin', 'bubu'); // course2.leader => bubu
  course.teacher = 'xxxx'; // course1.teacher => yunyin
```

### constructor是什么？
```js
  function Course(teacher, leader) {
    this.teacher = teacher;
    this.leader = leader;
  }
  const course = new Course('yunyin', 'xh');
```
* 1. 每个对象在创建时，会自动拥有一个构造函数属性constructor
* 2. constructor源自原型对象，指向了构造函数的引用

* 实例获得了模板的属性 => (大胆点)继承了类的属性

#### 原型对象
```js
  function Course() {}
  const course1 = new Course();
  const course2 = new Course();
  * 1. Course - 用来初始化创建对象函数 ｜ 类
  course1.__proto___ === Course.prototype;

  * 2. course1 - 根据原型创建出来实例
  course1.constructor === Course;
```

* prototype是什么？
```js
  function Course() {
    this.teacher = 'yunyin';
    this.leader = 'xh';
  }
  const course1 = new Course();
  const course2 = new Course();

  Course.prototype.startCourse = name => {
    return `开始${name}课`;
  }
```

* 追问，原型对象有自己的原型吗？
course1.__proto__.__proto__ === Object.prototype;
Course.prototype.__proto__ === Object.prototype;
course1.__proto__.__proto__.__proto__ === null;

原型链

## 继承
js如何实现继承
#### 在原型对象的所有属性方法，都可以被实例所共享
```js
  function Game() {
    this.name = 'lol';
  }
  Game.prototype.getName = function() {
    return this.name;
  }

  // LOL
  function LOL() {};
  LOL.prototype = new Game();
  LOL.prototype.constructor = LOL;
  const game = new LOL();
  // 本质：重写了原型对象方式，将父对象的属性方法，作为自对象原型对象的属性方法，同时重写构造函数
```

#### 追问：原型链直接继承有什么缺点
```js
  function Game() {
    this.name = 'lol';
    this.skin = ['s'];
  }
  Game.prototype.getName = function() {
    return this.name;
  }

  // LOL
  function LOL() {};
  LOL.prototype = new Game();
  LOL.prototype.constructor = LOL;
  const game1 = new LOL();
  const game2 = new LOL();
  game1.skin.push('ss');
  // 本质：重写了原型对象方法，将父对象的属性方法，作为自对象原型对象的属性方法，同时重写构造函数
```
* 1. 父类属性一旦赋值给子类的原型属性，此时属性属于子类的共享属性了
* 2. 实例化子类时，无法向父类进行传参

### 解决方法：构造函数继承
#### 经典继承：在子类的构造函数内部调用父类的构造函数
```js
  function Game(arg) {
    this.name = 'lol';
    this.skin = ['s'];
  }
  Game.prototype.getName = function() {
    return this.name;
  }

  function LOL(arg) {
    Game.call(this, arg);
  }

  const game3 = new LOL('arg');
  // 解决了共享属性问题 + 自向父传参的问题
```

### 追问：原型链上的共享方法无法被读取继承，如何解决？
#### 组合继承
```js
  function Game(arg) {
    this.name = 'lol';
    this.skin = ['s'];
  }
  Game.prototype.getName = function() {
    return this.name;
  }

  function LOL(arg) {
    Game.call(this, arg);
  }
  LOL.prototype = new Game();
  LOL.prototype.constructor = LOL;
  const game4 = new LOL('arg');
```

### 追问：组合继承方式就没有缺点吗？问题在于：无论何种场景，都会调用两次父类的构造函数
#### 解决方案：寄生组合继承
```js
  function Game(arg) {
    this.name = 'lol';
    this.skin = ['s'];
  }
  Game.prototype.getName = function() {
    return this.name;
  }

  function LOL(arg) {
    Game.call(this, arg);
  }
  LOL.prototype = Object.create(Game.prototype);
  LOL.prototype.constructor = LOL;
  const game5 = new LOL('arg');
```

### 拔高：如何实现多重继承？
```js
  function Game(arg) {
    this.name = 'lol';
    this.skin = ['s'];
  }
  Game.prototype.getName = function() {
    return this.name;
  }

  function Store() {
    this.shop = 'steam';
  }
  Game.prototype.getPlatform = function() {
    return this.shop;
  }

  function LOL(arg) {
    Game.call(this, arg);
    Store.call(this, arg);
  }

  LOL.prototype = Object.create(Game.prototype);
  Object.assign(Store.prototype, LOL.prototype);
  LOL.prototype.constructor = LOL;
```
