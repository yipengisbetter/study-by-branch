## promise 解析
* 啥是异步
```js
  // 异步执行
  let cout = 1;
  let timer = setTimeout(function() {
    count ++;
    console.log('in', count);
  }, 1000);

  console.log('out');
  // out => 1000 => in

  // 循环执行
  let count = 1;
  let timer = setInterval(function() {
    count ++;
    console.log('in', count);
  }, 1000);

  setTimeout(function() {
    clearInterval(timer);
    console.log('clear');
  }, 5000);
  // 看不见的队列，存放着需要默默执行的命令
```

### 1. 进程 & 线程
#### a. 概念 & 区别
#### b. 面试题: 
* 映射到前端 - 浏览器
chrome新开了一个窗口，是进程还是线程？=> 进程
* 发散：
方向一：窗口（进程间）通信？=> storage | cookie => 多种存储的区别 => 应用场景 => 结合简历项目
方向二：浏览器原理（中高级岗位面试居多）

### 2. EVENT-LOOP
#### a. 执行栈
* JS单线程语言，单步执行
```js
  function func2() {
    throw new Error('plz check your call stack');
  }

  function func1() {
    func2();
  }

  function func() {
    func1();
  }

  func();
```

#### b. 面试题
* 执行顺序
```js
  setTimeout(() => {
    console.log('timeout'); // 5. 宏任务2
  }, 0);

  new Promise(resolve => {
    console.log('new Promise'); // 1. 属于同步进入主线程 宏任务1
    resolve();
  }).then(() => {
    console.log('Promise then'); // 3. 微任务 1
  }).then(() => {
    console.log('Promise then then'); // 4. 微任务 2
  });

  console.log('hi'); // 2. 同步 + 宏任务1

  // 任务拆分 - macro micro
  // 同步 ｜ 异步
```

### promise
#### a. 理论 - 回调地狱
```js
  request.onreadystatechange = () => {
    // 回调后处理
  }

  // 加延时
  setTimeout(() => {
    request.onreadystatechange = () => {
      // 回调后处理
      setTimeout(() => {
        // 处理
        request.onreadystatechange = () => {
          // ...........
        }
      })
    }
  })

  // promsie 化 => 链式化
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok');
    })
  }).then(res => {
    request();
  }).catch(err => {
    console.log(err);
  })

  // 多个异步顺序执行 => 复合链式调用
  function wait500(input) {
    return new Promsie((resolve, reject) => {
      setTimeout(() => {
        resolve(input + 500);
      }, 500);
    })
  }
  function wait1000(input) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(input + 1000);
      }, 1000)
    })
  }

  const p = new Promise((resolve, reject) => {
    resolve(1);
  });

  p.then(wait500)
    .then(wait1000)
    .then(wait500)
    .then(wait1000)
    .then(() => {
      console.log('end', result);
    });

  // 全部执行完成回调
  Promise.all([wait1000, wait500]).then(result => {
    console.log('all end', result);
  });

  // 有执行完成的，立刻操作
  Promise.race([wait1000, wait500]).then(result => {
    console.log('race end', result);
  });
```

#### b. 面试 - promise
* 1. promise状态 - pending | fulfilled | rejected
executor: new Promise的时候立即执行，接收两个参数 resolve | reject

* 2. promise默认状态？状态是如何流转的？- 默认：pending   状态流转：pending => fulfilling | pending => rejected
内部维护成功value: undefined | thenable | promise
内部维护失败变量reason

* 3.promise返回值? - then方法：接收onFulfilled 和 onRejected
如果then时，promise已经成功，执行onFulFuilled，参数value
如果then时，promise已经失败，执行onRejected，参数reson
如果then中有异常，执行onRejected

* 追问：手写？
```js
  const PENDING = 'PENDING';
  const FULFILLED = 'FULFILLED';
  const REJECTED = 'REJCETED';

  class Promise {
    constructor(executor) {
      // 1. 默认状态 - PENDING
      this.status = PENDING;
      // 2. 内部维护的变量值
      this.value = undefined;
      this.reason = undefined;

      // 成功的回调
      let resove = value => {
        // 单向流转
        if (this.status === 'PENDING') {
          this.status = FULFILLED;
          this.value = value;
        }
      }

      // 失败的回调
      let reject = reason => {
        // 单向流转
        if (this.status === PENDING) {
          this.status = REJECTED;
          this.reason = reason;
        }
      }

      try {
        executor(resolve, reject);
      } catch(error) {
        reject(error);
      }
    }

    then(onFulfilled, onRejected) {
      if (this.status === FULFILLED) {
        onFulfilled(this.value);
      }
      if (this.status === REJECTED) {
        onRejceted(this.reason);
      }
    }
  }

  // 追问：异步怎么办？
  const PENDING = 'PENDING';
  const FULFILLED = 'FULFILLED';
  const REJECTED = 'REJECTED';

  class Promise {
    constructor(executor) {
      // 1. 默认状态 - PENDING
      this.status = PENDING;
      // 2. 内部维护的变量值
      this.value = undefined;
      this.reason = undefined;

      // 存放回调
      this.onResolvedCallbacks = [];
      this.onRejectedCallbacks = [];

      // 成功的回调
      let resolve = value => {
        // 单向流转
        if (this.status === PENDING) {
          this.status = FULFILLED;
          this.value = value;
          this.onResolvedCallbacks.forEach(fn => fn());
        }
      }

      // 失败的回调
      let reject = reason => {
        // 单向流转
        if (this.status === PENDING) {
          this.status === REJECTED;
          this.reason = reason;
          this.onRejectedCallbacks.forEach(fn => fn());
        }
      }

      try {
        executor(resolve, reject);
      } catch(error) {
        reject(error);
      }
    }

    then(onFulfilled, onRejected) {
      if (this.status === FULFILLED) {
        onFulfilled(this.value);
      }
      if (this.status === REJECTED) {
        onRejected(this.reason);
      }
      if (this.status === PENDING) {
        // 存放队列
        this.onResolvedCallbacks.push(() => {
          onFulfilled(this.value);
        });
        this.onRejectedCallbacks.push(() => {
          onRejected(this.reason);
        })
      }
    }
  }
  // 链式 + api + all / race
```

### async await & generator => 规范
