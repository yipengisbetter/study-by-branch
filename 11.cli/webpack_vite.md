# webpack2 and vite
## 核心配置
Entry: 编译入口，webpack编译起点
Compiler: 编译管理器，webpack启动后会创建compiler对象，该对象一直存活直到结束退出
Compilation: 单次编辑过程的管理器，比如watch = true时，运行过程中只有一个
compiler: 但每次文件变更触发更新编译时，都会创建一个新的compilation对象
Dependence: 依赖对象，webpack基于该类型记录模块间依赖关系
Module: webpack内部所有资源都会以"module"对象形式存在，所有关于资源的操作、转译、合并都是以"module"为基本单位进行的
Chunk: 编译完成准备输出时，webpack会将module按特定的规则组织成一个一个的chunk, 这些chunk某种程度上跟最终的输出一一对应
Loader: 资源内容转换器，其实就是实现从内容A转换B的转换器
Plugin: webpack构建过程中，会在特定的时机广播对应的事件，插件监听这些事件，在特定时间点介入编译过程

## entry point(入口起点)
入口起点(entry point)指示webpack应该使用哪个模块，来作为构建其内部依赖图(dependency graph)开始。进入入口起点后，webpack会找出有哪些模块和库是入口起点（直接和间接）依赖的。
```js
module.exports = {
  entry: "./src/index.js"
};
```

## output
output属性告诉webpack在哪里输出它所创建的bundle，以及如何命名这些文件。主要输出文件的默认值是 ./dist/main.js ，其他生成文件默认放置在 ./dist 文件夹中。
```js
const path = require("path");

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  output: {
    path.resolve(__dirname, "dist"),
    filename: "main.bundle.js",
  }
}
```
## Loader加载器
loader用于对模块的源代码进行转换。loader可以使你在import或"load(加载)"模块时预处理文件。
- 默认只能处理json和js
- 其他文件需要通过专门的加载器处理
```json
module: {
  rules: [{ test: /\.txt$/, use: 'raw-loader' }],
}
```
## loader原理
loader是链式传递的，对文件资源从上一个loader传递到下一个，而loader的处理也遵循着从上到下的顺序，我们简单了解一下loader的开发原则：
1. 单一原则：每个Loader只做一件事，简单易用，便于维护；
2. 链式调用：webpack会按顺序链式调用每个loader;
3. 统一原则：遵循webpack制定的设计规则和结构，输入和输出均为字符串，各个Loader完全独立，即插即用；
4. 无状态原则：在转换不同模块时，不应该在loader中保留状态；
因此我们就来尝试写一个less-loader和style-loader，将less文件处理后通过style标签的方式渲染到页面上去。

## plugin插件
扩展插件，在webpack构建过程的特定时机注入扩展逻辑，用来改变或优化构建结果；
```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
}
```
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" >
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
  </head>
  <body>
    <h1>hello webpack3</h1>
  </body>
</html>
```
### 实现一个自己的plugin
```js
const fs = require('fs');
const http = require('http');

class UploadSourceMapWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // 打包结束后执行
    compiler.hooks.done.tap("upload-sourcemap-plugin", status => {
      console.log("webpack runing");
    });
  }
}

module.exports = UpdateSourceMapWebpackPlugin;
```
## DevServer开发服务器
> 提供一个基本的web server，并且具有live reloading(实时重新加载)功能
- 静态服务比如：图片
- live reloading(实时重新加载)
- 反向代理接口
```bash
yarn add -D webpack-dev-server
npx webpack serve
```
## SourceMap是什么
eval: 每个module会封装到eval里包裹起来执行，并且会在末尾追加注释 `// @sourceURL`
source-map: 生成一个**SourceMap**文件（编译速度最慢）
hidden-source-map: 和source-map一样，但不会在bundle末尾追加注释
inline-source-map: 生成一个**DataUrl** 形式的SourceMap文件
eval-source-map: 每个module会通过eval()来执行，并且生成一个DataUrl形式的SourceMap
cheap-source-map: 生成一个没有列信息（column-mappings）的sourceMaps文件，不包含loader的sourcemap（譬如babel的sourcemap）
cheap-module-source-map: 生成一个没有列信息（column-mappings）的SourceMaps文件，同时loader的sourcemap也被简化为只包含对应行的

## 文件指纹设置
## 占位符
[ext]: 资源后缀名
[id]: 文件标识符
[name]: 文件名称
[path]: 文件的相对路径
[folder]: 文件所在的文件夹
[hash]: 模块标识符的hash
[chunkhash]: chunk内容的hash
[contenthash]: 文件内容的hash
[query]: 文件的query，例如，文件名？后面的字符串
[emoji]: 一个随机的指代文件内容的emoji

Hash: 和整个项目的构建相关，只要项目文件有修改，整个项目的hash值就会更改
Chunkhash: 和webpack打包的chunk有关，不同的entry会生成不同的chunkhash值
Contenthash: 根据文件内容来定义，文件内容不变，则contenthash值不变

## 谈谈chunk
SRC目录我们手写的代码：index.css, common.js, index.js, utils.js
webpack正在打包的代码...：chunks0(index.css, common.js, index.js), chunks1(utils.js)
生成的bundle代码可在浏览器中直接运行：index.bundle.css, index.bundle.js, utils.bundle.js

webpack会根据模块依赖图的内容组织分包 -- Chunk对象，默认的分包规则
- 同一个`entry`下触发到的模块组织成一个chunk
- 异步模块单独组织为一个chunk
- `entry.runtime`单独组织成一个chunk

## optimization
从webpack4开始，会根据你选择的mode来执行不同的优化，不过所有的优化还是可以手动配置和重写。

## split-chunks-plugin
最初，chunks（以及内部导入的模块）是通过内部webpack图谱中的父子关系关联的。CommonChunkPlugin曾被用来避免他们之间的重复依赖，但是不可能再做进一步的优化。
从webpack v4开始，移除了CommonChunkPlugin，取而代之的是optimization.splitchunks。
```js
module.exports = {
  // ...
  optilization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroup: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
}
```
### Default: Example 1
```js
// index.js
import('./a'); // dynamic import
```
```js
// a.js
import 'react';

// ...
```
结果：将创建一个单独的包含react的chunk。在导入调用中，此chunk并行加载到包含./a的原始chunk中。
为什么：
- 条件一：chunk包含来自node_modules的模块
- 条件二：react 大于 30kb
- 条件三：导入调用中的并行请求数为2
- 条件四：在初始页面加载时不影响请求
这背后的原因是什么？react不可能不会像你的应用程序代码那样频繁地更改。通过将其移动到单独的chunk中，可以将该chunk与应用程序代码分开进行缓存（假设你使用的是chunkhash，records, Cahe-Control或其他长缓存的方法）。

### Default: Example 2
```js
// entry.js

// dynamic imports
import('./a');
import('./b');
```
```js
import './helper.js'; // helpers is 40kb in size

// ...
```
```js
// b.js
import './helpers';
import './more-helpers'; // more-helpers is also 40kb in size

// ...
```
结果：将创建一个单独的chunk，其中包含 ./helpers 以及其所有的依赖项。在导入调用时，此chunk与原始chunks并行加载。
为什么：
- 条件一：chunk在两个导入调用之间共享
- 条件二：helpers大于30kb
- 条件三：导入调用中的并行请求数为2
- 条件四：在初始页面加载时不影响请求
将helpers的内容放入每个chunk中将导致其代码被下载两次。通过使用单独的块，这只会发生一次。我们会进行额外的请求，这可以视为一种折衷。这就是为什么最小体积为30kb的原因。

### Split Chunks: Example 1
创建一个 commons chunk，其中包含入口（entry points）之间所有共享的代码。
```js
// webpack.config.js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        name: 'commons',
        chunks: 'initial',
        minChunks: 2,
      }
    }
  }
}

// 警告：此配置可以扩大你的初始 bundles，建议在不需要立即使用模块时使用动态导入。
```

### Split Chunks: Example 2
创建一个 vendors chunks，其中包含整个应用程序中 node_modules的所有代码。
```js
// webpack.config.js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroup: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}

// 警告：这可能会导致包含所有外部程序包的较大chunk。建议仅包括你的核心框架和实用程序，并动态加载其余依赖项。
```

### Split Chunks: Example 3
创建一个 custom vendor chunk，其中包含与RegExp匹配的某些node_modules包。
```js
// webpack.config.js
module.exports = {
  // ...
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  }
}

// 提示：这将导致将 react 和 react-dom 分成一个单独的chunk。如果你不确定chunk中包含哪些包，请参考Bundle Analysis部分以获取详细信息。
```

## webpack 5.0优化
- 增加持久化存储能力，提升构建性能（核心）
- 提升算法能力来改进长期缓存（降低产物资源的缓存失效率）
- 提升Tree Shaking能力降低产物大小和代码生成逻辑
- 提升Web平台的兼容性能力
- 清除了内部结构中，在webpack4没有重大更新而引入一些新特性时所遗留下来的一些奇怪的state
- 通过引入一些重大的变更为未来的一些特性做准备，使得能够长期的稳定在webpack5版本上
### 思路一：
先确定哪些可以进行优化模块，webpack主要配置（entry, output, resolve, module, performance, externals, module, plugins, 其他）进行优化

### 思路二：
使用包体积检测工具webpack-bundle-analyzer分析包大小，着手优化

### 思路三
使用打包速度及各个模块检测插件 speed-measure-webpack-plugin，分析着手优化
SMP
General output time took 2.74 secs

SMP Plugins
HtmlWebpackPlugin took 0.006 secs
ProgressPlugin took 0.002 secs

SMP Loaders
css-loader, and
postcss-loader, and
sass-loader took 1.84 secs
  module count = 1
modules with no loaders took 0.948 secs
  module count = 50
esbuild-loader took 0.114 secs
  module count = 3
html-webpack-plugin took 0.013 secs
style-loader, and
css-loader, and
postcss-loader, and
sass-loader took 0.007 secs
 module count = 1

## Vite
Vite是新一代的前端构建工具，在尤雨溪开发Vue3.0的时候诞生。类似于webpack + webpack-dev-server。其主要利用浏览器ESM特性导入组织代码，在服务器端按需编译返回，完全跳过了打包这个概念，服务器随起随用。生产中利用Rollup作为打包工具，号称下一代的前端构建工具。
Vite有如下特点：
- 快速的冷启动：No Bundle + esbuild 预构建
- 即时的模块热更新：基于ESM的HMR，同时利用浏览器缓存策略提升速度
- 真正的按需加载：利用浏览器ESM支持，实现真正的按需加载

### 考点：Vite的基本流程
Development(Pre-bundle, HTTP Server(Proxy, Cache, Middleware, HMR)) -> Esbuild, Plugin Container(Mock Rollup) <- Vite Plugin Pipeline(alias plugin, module preload plugin, resolve plugin, html plugin, css plugin, Esbuild plugin -> Esbuild transform, ...) -> Rollup <- Production(Prepare Plugin For Rollup(build html, commonjs to es, import analysis, manifest, reporter, (minify -> Esbuild minify), ...))

### Vite为什么使用两个构建引擎 —— Esbuild 和 Rollup
Esbuild: An extremely fast bundler for the web

Esbuild: 0.39s
parcel 2: 14.91s
rollup 4 + terser: 34.10s
webpack 5: 41.21s
Above: the time to do a production bundle of 10 copies of the three.js library from scratch useing default settings, including minification and source maps. More info here.

Esbuild的缺点：
- 不支持降级到ES5的代码。这意味着在低端浏览器代码会跑不起来。
- 不支持const enum等语法。这意味着单独使用这些语法在Esbuild会直接抛错。
- 不提供操作打包产物的接口，像Rollup中灵活处理打包产物的能力（如renderChunk钩子）在Esbuild当中完全没有。
- 不支持自定义Code Splitting策略。传统的Webpack和Rollup都提供了自定义拆包策略的API，而Esbuild并未提供，从而降级了拆包优化的灵活性。
