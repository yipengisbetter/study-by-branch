## 函数式
### 一、函数式编程的出现
* 发展历程：命令（脚本）式 => 面向对象 => 函数式

#### 1. 问题的出现 - 从一道基础面试题开始说起
```js
  // 面试题：上接浏览器原理 - 参数parse
  // 1. 数组在url中展示形式
  // location.search => '?name[]=progressive$%coding&name[]=objective$%coding&name[]=functional$%coding'
  // 2. 参数提取并且拼接成数组
  // ['progressive$%coding', 'objective$%coding', 'functional$%coding']
  // 3. 转换成对象
  // [{
  //   name: 'Progressive Coding',
  // }, {
  //   name: 'Objective Coding',
  // }, {
  //   name: 'Functional Coding',
  // }]

  const _array = ['progressive$%coding', 'objective$%coding', 'functional$%coding'];
  const _objArr = [];

  const nameParser = (array, objArr) => {
    array.forEach(item => {
      let names = item.split('$%');
      let newName = [];

      // 内部处理
      names.forEach(name => {
        let nameItem = name[0].toUpperCase() + name.slice(1);

        newName.push(nameItem);
      })
    })
    // ……
    return objArr;
  }
  console.log(nameParser(_array, _objArr));
  // 问题：
  // 1. 存在包裹逻辑 - 看完整段在明白在做啥
  // 2. 存在临时变量，并收尾封闭 - 迭代扩展难度高
```

#### 2. 解决方案
```js
  // step1: 需求分析 => 数组 > 数组对象 => [字符串 > 对象]
  // nameParser => [objHelper :: string > object]

  // step2: 功能明确 => objHelper = formatName + assembleObj

  // step3: 功能拆分 => objHelper = [(split + capitalize + join)] + assembleObj

  // step4: 代码实现
  const _array = ['progressive$%coding', 'objective$%coding', 'functional$%coding'];

  // 原子操作实现
  const assembleObj = (key, x) => {
    let obj = {};

    obj[key] = x;
    return obj;
  }
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  // 声明结构
  const formatName = 组装合并(join(' '), map(capitalize), split('$%'));
  const objHelper = 组装合并(assembleObj('name'), formatName);
  const nameParser = map(objHelper);

  nameParser(_array);

  // 面试题： 正确的遍历 - for forEach map filter sort ……
  // 本质 => 通用遍历 ｜ 遍历逻辑处理 ｜ 生成数组 - 处理 ｜ filter - 过滤 ｜ sort - 排序……
```

### 二、函数式编程的原理特点
#### 1. 什么是函数式原理
* 加法结合律 ｜ 因式分解 ｜ 完全平方公式 => 原子组合进行变化 a + b + c = (a + b) + c
* 水源 => 组合 （水管 + 走线）=> 花洒

#### 2. 理论思想
##### a. 函数是一等公民 => 1. 实际功能逻辑落脚点 —— 函数 2. 实现函数 + 拼接流程
##### b. 声明式编程 => 声明需求
##### c. 惰性执行 - 无缝连接，性能节约
```js
  // 惰性函数
  const program = name => {
    if (name === 'progressive') {
      return () => {
        console.log('this is progressive');
      }
    } else if (name === 'objective') {
      return () => {
        console.log('this is objective');
      }
    } else {
      return () => {
        console.log('this is funtional');
      }
    }
  }
  program('progressive')();
  program()();
```

#### 3. 无状态 & 无副作用
* a. 无状态 - 幂等 数据不可变 - 不可操作改变数据源
* b. 无副作用 - 函数内部不应该直接对整个系统中任何参数&变量进行改动

### 三、实际开发
#### 1. 纯函数改造
```js
  const _class = {
    name: 'objective'
  }

  // 函数内部引入了外部变量 —— 无状态
  const score = str => _class.name + ':' + str;

  // 修改了输入参数 —— 无副作用
  const changeClass = (obj, name) => obj.name = name;

  // ########################
  const _class = {
    name: 'objective'
  }

  const score = (obj, str) => obj.name + ':' + str; // 和外部变量无耦合
  const changeClass = (obj, name) => ({...obj, name}); // 未直接修改外部变量

  // 面试题：副作用函数 => split slice splice ……
```

#### 2. 流水线组装 - 加工 & 拼接
##### a. 加工 - 科里化
```js
  // f(x, y, z) => f(x)(y)(z)
  const sum = (x, y) => {
    return x + y;
  }
  sum(1, 2);

  const add = x => {
    return y => {
      return x + y;
    }
  }

  add(1, 2)

  // 要实现 体系 = 加工 + 组装，单个函数加工输入输出应该单值化 => 单元函数
  const fetch = ajax(method, url, params);

  const fetch = ajax.get(method);
  const request = fetch(url);
  组合(fetch, request)
```

* 面试题：手写构造可拆分传参的累加函数
add(1)(2)(3)(4)
<!-- function -->
```js
  // 1. 构造科里化结构 => 输入函数
  // 2. 输入 处理外层arguments => 类数组处理
  // 3. 传入参数无限扩展 => 递归 => 返回递归函数本身
  // 4. 主功能 => 累加
  // 5. 输出 从函数到产出 toString属性

  const add = function() {
    // 2. 输入 处理外层arguments => 类数组处理
    let args = Array.prototype.slice.call(arguments);

    // 1. 构造科里化结构
    let inner = function() {
      // 主功能
      args.push(...arguments);
      return inner;
    }

    // 3. 最终返回值的输出
    add.toString = function() {
      return args.reduce((prev, cur) => {
        return prev + cur;
      })
    }

    return inner;
  }

  // newBind bind
  let name = 'name';
  let obj = {
    name: 'objName'
  }

  function test(p1, p2) {
    this.a = p1;
    this.b = p2;
  }

  const f1 = test.newBind(obj, 1);
  f1(2); // objName 1 undefined

  Function.prototype.newBind = function() {
    const _this = this;
    const args = Array.prototype.slice.call(arguments);
    const newThis = args.shift();

    return function() {
      const finalArgs = args.concat(Array.prototype.slice.call(arguments));

      return _this.newApply(newThis, finalArgs);
    }
  }
```

##### b. 流水线 - 组装函数
```js
  const compose = (f, g) => x => f(g(x));

  const sum1 = x => x + 1;
  const sum2 = x => x + 2;
  const sum12 = compose(sum1, sum2);

  SELECT p.name p.age FROM Course
  WHERE p.age > 24 and p.location IS NOT 'hangzhou'

  // _.mixins({
  //   'select', _.plunk,
  //   'where', _.filter
  // })
```

* 实际实现使用
```js
  // 命令式
  trim(reverse(toUpperCase(map(arr))));

  // 面向对象
  arrInstance.map().toUpperCase().reverse().trim();

  // 函数式
  compose(trim, reverse, toUpperCase, map);
  // 忽略中间过程，面向函数的流水线
  // history ｜ grep rm
```

### 四、BOX与涵子
```js
// 一封信
class Mail {
  constructor(content) {
    this.content = content;
  }
  map(fn) {
    return new mail(fn(this.content));
  }
}

// 1. 拆开看信
let mail1 = new Mail('love');
// 2. 读了信
let mail2 = mail1.map(function(mail) {
  return read(mail);
});
// 3. 烧了信
let mail3 = mail1.map(function(mail) {
  return burn(mail);
});
// 4. 老妈查岗
mail3.map(function(mail) {
  return momCheck(mail);
});

// 链式
new Mail('love').map(read).map(burn).map(monCheck);

// Function - 函子
// 1. 具有通用的map方法，返回新的实例
// 2. 实例与之前的实例规则相同
// 3. 传入的参数为函数，具有结合外部运算的能力
```
