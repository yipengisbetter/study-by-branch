### 性能优化进阶
#### Navigation Timing API
1. navigationStart / end
表示从上一个文档卸载结束时 => 如果没有上一个文档，这个值和fetchStart相等

2. unloadEventStart / end
标识前一个网页unload的时间点

3. redirectStart / end
第一个http重定向发生和结束的时间

4. fetchStart
浏览器准备好使用请求获取文档的时间

（from cache）

5. domainLookupStart / end
HTTP开始建立连接的时间

6. connectStart / end
TCP开始建立连接的时间

7. secureConnectionStart
HTTPS连接开始的时间

8. requestStart / end
9. responseStart / end

10. domLoading
开始解析渲染DOM树的时间 => readyState变成loading => readystatechange
11. domInteractive
完成解析 => dom树解析完成时间

12. domContentLoadedEventStart / end
加载网页内资源的时间

13. domComplete
Dom完全解析完成

```js
  // index.html
  <script>
    javascript:(() => {
      var perfData = window.performance.timing;
      var pageLoadTime = perfData.domComplete - perfData.navigationStart;

      console.log("页面加载耗时：", pageLoadTime, 'ms');
    })();
  </script>

  // 平均值、实时值
```

#### Core Web Vitals - 网页核心的性能指标
* Google，每个CWV代表用户体验的一个不同方面 —— 加载、交互、视觉稳定性

##### Largest Contentful Paint（LCP）
衡量装载性能：LCP应该在页面首次开始加载后2.5s内发生
* 前2.5s进行最大内容的渲染

a. 最大内容包含了哪些？
- <img>
- <svg>
- <video>
- 通过url函数加载的背景图片元素
- 包含了大块内嵌内容的块级元素

b. LCP值低下的原因
- 服务器响应慢
- 阻断渲染的Javascript ｜ CSS
- 资源的加载时间过长
- 客户端渲染机器的影响

c. 针对性的改造
- 服务器优化
缓存HTML离线页面，缓存页面资源，减少浏览器直接对资源的请求
=> 缓存机制

对图片的优化，进行图片合理化使用，降低图片大小，加快请求速度
=> 图片上传格式 ｜ 云资源管理

重写、压缩、注释过滤……减少最终文件大小，加快加载速度 => webpack vite 工程化打包

使用CDN —— 物理上接近请求点

- 渲染阻断优化
CSS + JS => 延迟处理
首屏优化 => 懒加载、异步加载
CSS模块优化
SSR服务端渲染

##### First Input Delay（FID）
衡量交互性，页面的FID应该小于100ms
* 首面首次输入延迟应该小于100ms

执行阻塞

a. 减少JS的执行时间
- 缩小压缩JS文件
- 延迟加载不需要的JS
=> 模块懒加载 ｜ tree shaking
- 尽量减少未使用的polyfill

b. 分解耗时任务
- 减少长逻辑
- 异步化

c. worker
web worker | service worker

```js
// 1. web worker
// main.js
// 新增worker
const myWorker = new Worker('worker.js');

// 与main thread之间通信
myWorker.postMessage('hello');
myWorker.onmessage = function(e) {
  console.log(e);
}

// worker.js
// 接收消息
self.onmessage = function(e) {
  console.log(e.data);
  // 回调逻辑
  let workResult = '';
  self.postMessage(workResult);
}

// 2. service worker
// main.js
navigator.serviceWorker.register('./service-worker.js');

// service-worker.js
self.addEventListener('install', function (event) {
  //...
})
self.addEventListener('fetch', function(event) {
  //...
})
// => 面向网络和cache处理
```

Cumulative Layout Shift (CLS)
测量视觉稳定性 - 页面稳定性在加载过程中以及渲染后CLS小于0.1
* 整体布局的移动可能发生在可见元素从一帧到下一帧改变位置的任何阶段

会带来偏移的因素：图片、内容插入、字体

a. 不使用无尺寸元素
=> scrset & sizes
```js
  <img srcset="yy-320w.jpg 320w,
              yy-480w.jpg 480w
              yy-800w.jpg 800w"
      sizes="(max-width: 320px) 280px
              (max-width: 480px) 440px
              800px"
      src="yy.jpg" alt="yy pic">
```

b. 整体化内容插入 => 影响整体布局 => 重排 => 重绘
c. 动态字体控制
```js
  //  加载完默认字体再显示 => 先用默认字体渲染，下载完成之后，在替换成后续字体
  @font-face {
    src: local('xxx Regular'), url(http://fonts.xxxx.com/xxx.woff2);
  }
```

#### 性能评估神器 - performance

#### 大厂监控体系
从数据采集 => 汇总展示
a) 埋点上报 => 点到点 + 信息采集
b) 数据处理 => 阈值设置 + 数据分类 + 数据重组
c) 可视化展示
i. 自研监控
ii. grafana ……

评估
a）根据指标要求进行数据圈层 => 数据归档
b）定位问题

指导提升
a) 告警处理
b) 触发分派

#### 性能优化另一个可能性 —— bigpipe
