// 异步：另起了一个队列，延时执行

// 进程：在系统里，以进程为基本的程序划分单位，cpu资源分配的最小单位
// 线程：可简单理解成，进程由线程组成，程序执行的最小单位

// 窗口（进程间）通信
// 非同源：如果有点击事件，通过url传递参数
// 同源：window.name共享

// storage ｜ cookie

// 多种存储的区别，应用场景，结合简历项目

// 浏览器原理

// 事件循环：js是单线程语言，异步任务通过事件队列，在合适的时间进入主线程进行执行

// 回调地狱：起源于链式调用未开发出来，但是本质上是链式调用

// Promise，回调地狱的本质实现，所以为了实现的就是链式

class MyPromise {
  constructor(exec) {
    this.status = 'pending';
    this.value = undefined;
    this.reason = undefined;

    this.resolveCbs = [];
    this.rejectCbs = [];

    const resolve = (value) => {
      if (this.status === 'pending') {
        this.status = 'resolved';
        this.value = value;
        this.resolveCbs.forEach(fn => fn());
      }
    }

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.status = 'rejected';
        this.reason = reason;
        this.rejectCbs.forEach(fn => fn());
      }
    }

    exec(resolve, reject);
  }

  then(onResolve, onReject) {
    if (this.status === 'resolved') {
      onResolve(this.value);
    }

    if (this.status === 'rejected') {
      onResolve(this.reason);
    }

    if (this.status === 'pending') {
      this.resolveCbs.push(() => onResolve(this.value));
      this.rejectCbs.push(() => onReject(this.reason));
    }
  }
}
