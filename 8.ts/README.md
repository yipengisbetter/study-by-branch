```js
  // add(1)(2)(3)(4)
  const add = function() {
    // 2. 输入 处理外层arguments => 类数组处理
    let args = Array.prototype.slice.call(arguments);

    // 1. 构造科里化函数
    let inner = function() {
      // 主功能
      args.push(...arguments);
      return inner;
    }

    // 3. 最终返回值的输出
    inner.toString = function() {
      return args.reduce((prev, cur) =>
      {
        return prev + cur;
      })
    }

    return inner;
  }
  // 面试：
  // toString - 本地方法的调整用于多类型返回的处理
  // 追问：
  // 如果要用到真正的toString? - 利用call直接运行String
  // 追问：
  // 函数类型？ - 类型不统一 => 不纯
```

## TypeScript 详解
### 一、TS 基础概念
#### 1. 什么是TS
a. 对比原理
* 她是JS的一个超集，在原有基础上，添加了
可选静态类型
基于类的面向对象编程

1. 编写项目 - 更利于架构维护
2. 自主检测 - 编译期间检测
3. 类型检测 - 支持了动态和静态类型检测 => 本质存在类型转换
4. 运行流程 - 依赖编译
5. 复杂特性 - 模块化、范型、接口

#### 2. TS基础类型的写法
* boolean string number array null undefined
```js
// es
let isEnabled = true;
let class = 'ts';
let classNum = 2;
let classArr = ['basic', 'execute'];

// ts
let isEnabled: boolean = true;
let class: string = 'ts';
let classNum: number = 2;
let classArr: string[] = ['basic', 'execute'];
let classArr: Array<string> = ['basic', 'execute'];
```

* tuple - 元组
```ts
  let tupleType: [string, boolean];
  toupleType = ['ts', true];
```

* enum - 枚举
```ts
  // 数字类枚举 - 默认从零开始，依次递增
  enum Score {
    BAD,
    NG,
    GOOD,
    PERFECT
  }
  let score: Score = Score.BAD;

  // 字符串类型
  enum Score {
    BAD = 'BAD',
    NG = 'NG',
    GOOD = 'GOOD',
    PERFECT = 'PERFECT'
  }

  // 反向映射
  enum Score {
    BAD,
    NG,
    GOOD,
    PERFECT
  }
  let scoreName = Score[0]; // 'BAD'
  let scoreValue = Score['BAD']; // 0

  // 异构 - 字符串 + 数字
  enum Score {
    A,
    B,
    C = 'C',
    D = 'D',
    E = 6,
    F,
  }

  // 面试题：手写实现一个异构枚举
  let Enum;
  (function(Enum) {
    Enum['A'] = 0;
    Enum['B'] = 1;
    Enum['C'] = 'C';
    Enum['D'] = 'D';
    Enum['E'] = 6;
    Enum['F'] = 7;

    Enum[0] = 'A';
    Enum[1] = 'B';
    Enum[6] = 'E';
    Enum[7] = 'F';
  })(Enum || (Enum = {}));
```

* any unknown void
```ts
  // any - 绕过所有检查 => 类型检测和编译筛查全部失效
  let anyValue: any = 123;

  anyValue = 'anyValue';

  // unknown - 绕过赋值检查 => 禁止更改传递
  // 传递
  let unknownValue: unknown;

  unknownValue = 'unknownValue';

  let value1: unknown = unknownValue; // OK
  let value2: any = unknownValue; // OK
  let value3: boolean = unknownValue; // NOK

  // void - 声明函数返回值
  function voidFunction(): void {
    console.log('no return');
  }

  // never - 用不返回
  function error(msg: string): never {
    throw new Error(msg);
  }
  function longlongloop(): never {
    while(true) {}
  }
```

* object | Object | {} - 对象
```ts
  // Object - 非原始类型
  // 声明文件
  interface ObjectConstructor {
    create(o: object | null): any;
  };

  // 逻辑文件
  const proto = {
    a: 1
  };
  Object.create(proto); // OK

  // Object - 原型属性
  // Object.prototype上属性
  interface Object {
    constructor: Function;
    toString(): string;
    valueOf(): Object;
  }

  // {} 空对象 - 没有成员的对象
  const a = {} as A;
  a.class = 'es';
  a.age = 30;
```

### 二、接口 - interface
* 对行为的抽象，具体行为由类实现
```js
  interface Class {
    name: string;
    time: number;
  }

  let course: Class = {
    name: 'ts',
    time: 2
  }

  // 只读
  interface Class {
    readonly name: string;
    time: number;
  }
  // 任意
  interface Class {
    readonly name: string;
    time: number;
    [propName: string]: any;
  }
  // 面试题 - 和JS的引用不同 < = > const
  let arr: number[] = [1, 2, 3, 4];
  let ro: ReadonlyArray<number> = arr;

  ro[0] = 12; // Error - 赋值
  ro.push(5); // Error - 增加
  ro.length = 100; // Error - 长度改写

  arr = ro;       // Error - 覆盖
```

### 三、交叉类型
```ts
  // 合并
  interface A { x: D }
  interface B { x: E }
  interface C { x: F }

  interface D { d: boolean }
  interface E { e: string }
  interface F { f: number }

  type ABC = A & B & C;

  let abc: ABC = {
    x: {
      d: false,
      e: 'class',
      f: 5
    }
  }

  // 合并冲突
  interface A {
    c: string;
    d: string;
  }
  interface B {
    c: number;
    d: string;
  }

  type AB = A & B;
  // 合并的关系是且 => c: never
```

#### 四、断言 - 类型声明、转换
```ts
  // 尖括号
  let anyValue: any = 'hi ts';
  let anyLength: number = (<string>anyValue).length; // 阶段性声明

  // as声明
  let anyLength: number = (anyValue as string).length;

  // 非空判断
  type ClassTime = () => number;

  const start = (classTime: ClassTime | undefined) => {
    let num = classTime!(); // 确定一定不为空
  }

  // 面试题
  const tsClass: number | undefined = undefined;
  const course: number = tsClass!;
  // 使用的意义 => 告知编译器，运行时下，会被赋值
```

### 五、类型守卫
```ts
  interface Teacher {
    name: string;
    courses: string[];
    score: number;
  }
  interface Student {
    name: string;
    startTime: Date;
    score: string;
  }

  type Class = Teacher | Student;

  function startCourse(cls: Class) {
    if ('course' in cls) {
      // teacher的逻辑
    }
    if ('startTime' in cls) {
      // student的逻辑
    }
  }

  function startCourse(cls: Class) {
    if (cls instanceof Teacher) {
      // teacher的逻辑
    }
    if (cls instanceof Student) {
      // student的逻辑
    }
  }

  function startCourse(name: string, score: string | number) {
    if (typeof score === 'number') {
      // teacher的逻辑
    }
    if (typeof score === 'string') {
      // student的逻辑
    }
  }
```

### 六、TS进阶
#### 1. 泛型 - 重用
```ts
  function startClass<T, U>(name: T, score: U): T {
    return name + score;
  }
  console.log(startClass<string, number>('yy', 5));
  function startClass<T, U>(name: T, score: U): string {
    return `${name}${score}`;
  }

  function startClass<T, U>(name: T, score: U): T {
    return (name + String(score)) as any as T;
  }

  // T U K 键值 ｜  V值 ｜ E 节点
```

#### 2. 装饰器 - decorator
```ts
  function Yunyin(target: Function): void {
    target.prototype.startClass = function(): void {
      // start逻辑
    }
  }

  // 类装饰器
  @Yunyin
  class Course {
    constructor() {
      // 业务逻辑
    }
  }

  // 属性装饰器
  function nameWrapper(target: any, key: string) {
    // 逻辑处理
    Object.defineProperty(target, key, {
      // 劫持
    });
  }
  class Course {
    constructor() {
      // 业务逻辑
    }

    @nameWrapper
    public name: string;
  }

  // 方法装饰器
```

#### 3. 原理解析
```ts
  // 1. 源码输入
  let a: number = 2;
  // 2. scnner扫描器扫描 => 识别内容范围生成数据流
  [
    "let": "keyword",
    "a": "identifier",
    "=": "assignment",
    "2": "integer",
    ";": "eos"（end of statement）
  ]
  // number

  // 3. 解析器 parser 生成语法树 - AST
  {
    operation: "=",
    left: {
      keyword: 'var',
      // ...
    }
  }

  // 4. 绑定器 binder 主要职责 创建symbols
  // node.symbol

  // 5. 校验器 checker 检查TS语法错误 => 检查器中进行的

  // 6. 发射器 emitter根据每个节点的检查结果产出node翻译成js
```
