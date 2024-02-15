## 浏览器相关
### 一、认识浏览器运行态下的JS
#### 包含：BOM DOM ECMAScript
```js
  (function (global, context, undefined) {
    const _class = ['js', 2, {
      name: 'vue_base'
    }, {
      name: 'vue_promote',
      index: {}
    }];

    global.classArr = _class.map(item => item);

    const _url = location.href; // 路径地址相关

    document.title = 'browser';

    document.getElementById('app');
  })(window, this);

  // 简述
  // ECMAScript - 基础逻辑、数据处理
  // DOM - 对于浏览器视窗内HTML文本的相关操作
  // BOM - 对浏览器本身功能区域做的处理
```

### 二、BOM
#### 1. location
location.href => 'https:// www.course.com/search?class=browser#comments'
    .origin => https://www.course.com
    .protocol => https
    .host => www.course.com
    .port => ''
    .pathname => /search/
    .search => ?class=browser
    .hash => #comments

location.assign('url') 跳转到指定path，并替换pathname => path
        .replace('url') 效果同上，同时替换浏览器历史
        .reload()
        .toString()

* 面试方向
1. location本身api操作
2. 路由相关：跳转、参数、操作 => 场景：history hash
3. url处理 —— 正则 or 手写处理

#### 2. history
history.state => 存储获取当前页面状态
    .replaceState => 替换当前状态

#### 3. navigator
* 浏览器系统信息大集合
```js
  navigator.userAgent
```
面试方向：
1. UA读取系统信息 => 浏览器兼容性
2. 剪切板、键盘
3. 系统信息采集 => 数据上报 => 数据采集汇总

#### 4. screen
表示显示区域 —— 屏幕

* 面试方向 - 判断区域大小
    window视窗判断：
    全局入口处
    window.innerHeight
    window.innerWidth

    文本处获取
    document.documentElement.clientHeight
    document.documentElement.clientWidth

    网页内容size => offsetHeight =
    clientHeight + 滚动条 + 边框
    document.documentElement.offsetHeight
    document.documentElement.offsetWidth

    定位：
    scrollLeft / scrollTop - 距离常规左/上滚动的距离
    offsetLeft / offsetTop - 距离常规左/上距离

    el.getBoundingClientRect()
        el.getBoundingClientRect().top
        el.getBoundingClientRect().left
        el.getBoundingClientRect().right
    * 兼容性 - IE会多出2像素

### 三、时间模型
```js
  <div id="app">
    <p id="dom">Click</p>
  </div>

  // 冒泡： p => div => body => html => document
  // 捕获：document => html => body => div => p
  el.addEventListener(event, function, useCaption) // useCaption 默认 - false

  // 追问：
  // 1. 如何去阻止事件传播？
  event.stopPropagation(); // => 无法阻止默认事件的发生，比如：a标签跳转

  // 2. 如何阻止默认事件
  event.preventDefault();

  // 3. 相同节点绑定了多个同类事件，如何阻止？
  event.stopImmediatPropagation();
  // 面试核心：区分不同阻止

  // 4. 手写，实现一个多浏览器兼容的事件绑定
  // attachEvent vs addEventListener
  // 区别：
  // a. 传参 attachEvent对于事件名需要加上‘on’
  // b. 执行顺序 attachEvent - 后绑定先执行；addEventListener - 先绑定后执行
  // c. 解绑 dettachEvent vs removeEventListener
  // d. 阻断 e.cancelBubble = true vs e.stopPropagation()
  // e. 阻断默认事件 e.returnValue vs e.preventDefault

  class bindEvent {
    constructor(element) {
      this.element = element;
    }
    addEventListener = (type, handler) =>
    {
      if (this.element.addEventListener) {
        this.element.addEventlistener(type, handler, false);
      } else if (this.element.attachEvent) {
        const element = this.element;
        this.element.attachEvent('on' + type, () => {
          handler.call(element);
        })
      } else {
        this.element['on' + type] = handler;
      }
    }

    removeEventListener = (type, handler) => {
      if (this.element.removeEventListener) {
        this.element.removeEventListener(type, handler, false);
      } else if (this.element.detachEvent) {
        const element = this.element;
        this.element.detachEvent('on' + type, () => {
          handler.call(element);
        })
      } else {
        this.element['on' + type] = null;
      }
    }

    static stopPropagation(e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    }
  }

  // 5. 性能优化 - 事件代理
  <ul class="list">
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5</li>
    <li>6</li>
  </ul>
  <div class="content"></div>

  var list = document.querySelector(".list");
  var li = list.getElementsByTagName("li");
  var content = document.querySelector(".content");

  // 硬碰硬
  for (var n = 0; n < li.length; n++) {
    li[n].addEventListener('click',
    function() {
      // 点击逻辑
    })
  }

  // 代理后 - 利用冒泡
  function onClick(e) {
    var e = e || window.event;
    if (e.target.nodeName.toLowerCase() === 'li') {
      const liList = this.querySeletorAll("li");
      const index = Array.prototype.indexOf.call(liList, target);
    }
  }

  list.addEventListener('click', onClick, false);
```

### 四、网络
```js
  // 实例化
  const xhr = new XMLHttpRequest();

  // 发送
  // 初始化连接 - open初始化连接不会发起真正的请求
  xhr.open(method, url, async)

  // 发送请求
  // 当请求方法为post时 - body请求体
  // 当请求方法为get时 - 可以为空
  // 都需要enCodeURIComponent进行转码
  xhr.send(data);

  // 接受
  xhr.readyStatus
  // 0 - 尚未调用open
  // 1 - 已调用open
  // 2 - 已调用send
  // 3 - 已接受请求返回数据
  // 4 - 已完成请求

  xhr.onreadystatechange = () => {
    if (xhr.readyStatus === 4) {
      if (xhr.status === 200) {
        // 逻辑
      }
    }
  }

  // 超时
  xhr.timeout = 1000;

  // 超时触发方法
  xhr.ontimeout = () => {
    // trace
  }

  // 手写请求封装
  ajax({
    url: 'reqUrl',
    method: 'get',
    async: true,
    timeout: 30000,
    data: {
      payload: 'text'
    }
  }).then(
    res => console.log('成功'),
    err => console.log('失败')
  )

  function ajax(options) {
    // 参数读取
    const {
      url,
      method,
      async,
      data,
      timeout
    } = options;

    // 实例化
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject)
    => {
      // 成功
      xhr.onreadystatechange = () => {
        if (xhr.readyStatus === 4) {
          if (xhr.status === 200) {
            // 逻辑
            resolve && resolve(xhr.responseText);
          } else {
            reject && reject();
          }
        }
      }

      // 失败
      xhr.ontimeout = () => reject && reject('超时');
      xhr.onerror = (err) => reject && reject(err);

      // 传参处理
      let _params = [];
      let encodeData;

      if (data instanceof Object) {
        for (let key in data) {
          _params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
        }
        encodeData = _params.join('&');
      }

      // methods处理
      // get类型拼接到url
      if (method === 'get') {
        const index = url.indexOf('?');
        if (index === -1) {
          url += '?';
        } else if (index !== url.length - 1) {
          url += '&';
        }

        url += encodeData;
      }

      // 建立连接
      xhr.open(method, url, async);

      if (method === 'get') {
        xhr.send(null);
      } else {
        xhr.setRequestHeader(
          'Content-type',
          'application/x-www-form-urlencoded;charset=UTF-8'
        );
        xhr.send(encodeData);
      }
    })
  }
```

面试方向：
1. RESTFUL - GET POST PUT DELETE OPTION
2. 跨域 - CORS 、iframe 、 JSONP
3. 状态码 - 2xx 4xx 5xx 3xx => 浏览器缓存
4. 强缓存 ｜ 协商缓存


DOM BOM EVENT NETWORK
