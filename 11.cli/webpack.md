# webpack核心原理
## webpack的核心概念
```js
- Sourcemap
- 文件指纹技术
- Babel与AST
- Treeshaking树摇
- 优化篇
  - 构建速度
  - 提高页面性能
- 原理篇
  - webpack
  - plugin
  - loader
```

## 手写实现webpack理解原理
### 准备工作
- src
  - add.js
  - minus.js
  - index.js
- index.html
### 我们创建了add.js文件和minus.js文件，然后在index.js中引入，再将index文件引入index.html
```js
// add.js
export default (a, b) => {
  return a + b;
}

// minus.js
export const minus = (a, b) => { return a - b }

// index.js
import add from './add.js';
import minus from './minus.js';
const sum = add(1, 2);
const division = minus(2, 1);
console.log(sum);
console.log(division);
```
### index.html
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" >
    <title>Title</title>
  </head>
  <body>
    <script src="./src/index.js" />
  </body>
</html>
```
### 我们来创建一个bundle.js文件
```js
// 获取主入口文件
const fs = require('fs');
const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  console.log(body);
}
getModuleInfo("./src/index.js");
```
### 执行
### 怎么解决内部循环引入的问题
```bash
npm install @babel/parser
```
```js
// 获取主入口文件
const fs = require('fs');
const parser = require('@babel/parser');
const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  const ast = parser.parse(body, {
    sourceType: 'module'  // 表示我们要解析的是ES模块
  })
  console.log(ast);
}
getModuleInfo("./src/index.js");
```
### 收集依赖
```bash
npm install @babel/traverse
```
```js
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  const ast = parser.parse(body, {
    sourceType: 'module' // 表示我们要解析的是ES模块
  })
  // 新增代码
  const deps = {};
  traverse(ast, {
    ImportDeclaration({node}) {
      const dirname = path.dirname(file);
      const abspath = './' + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    }
  });
  console.log(deps);

  // 新增代码
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  });
  const moduleInfo = { file, deps, code };
  return moduleInfo;
}
getModuleInfo("./src/index.js");
```
### 收集完依赖，怎么加载所有文件
```js
const parseModules = (file) => {
  const entry = getModuleInfo(file);

  const temp = [entry];
  for (let i = 0; i < temp.length; i++) {
    const deps = temp[i].deps;
    if (deps) {
      for (const key in deps) {
        if (deps.hasOwnProperty(key)) {
          temp.push(getModuleInfo(deps[key]));
        }
      }
    }
  }
  console.log(temp);
}
```
讲解下parseModules方法：
1. 我们首先传入主模块路径
2. 将获得的模块信息放到temp数组里
3. 外面的循环遍历temp数组，此时的temp数组只有主模块
4. 循坏里面再获得主模块的依赖deps
5. 遍历deps，通过调用getModuleInfo将获得的依赖模块信息push到temp数组里
```js
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  const ast = parser.parse(body, {
    sourceType: 'module' // 表示我们要解析的是ES模块
  })
  // 新增代码
  const deps = {};
  traverse(ast, {
    ImportDeclaration({node}) {
      const dirname = path.dirname(file);
      const abspath = './' + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    }
  });
  console.log(deps);

  // 新增代码
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  });
  const moduleInfo = { file, deps, code };
  return moduleInfo;
}

const parseModules = (file) => {
  const entry = getModuleInfo(file);

  const temp = [entry];
  for (let i = 0; i < temp.length; i++) {
    const deps = temp[i].deps;
    if (deps) {
      for (const key in deps) {
        if (deps.hasOwnProperty(key)) {
          temp.push(getModuleInfo(deps[key]));
        }
      }
    }
  }
  console.log(temp);
  const depsGraph = {};
  temp.forEach(moduleInfo => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code
    }
  })
  console.log(depsGraph);
  return depsGraph;
}
parseModules("./src/index.js");
```
使得引入的代码可以被执行最终需要处理require和exports
```js
const bundle = (file) => {
  const depsGraph = JSON.stringify(parseModules(file));
  return `(function (graph) {
    function require(file) {
      (function (code) {
        eval(code);
      })(graph[file].code)
    }
    require(file);
  })(depsGraph)`;
}

const bundle = (file) => {
  const depsGraph = JSON.stringify(parseModules(file));
  return `(function (graph) {
    function require(file) {
      function absRequire(relPath) {
        return require(graph[file].deps[relPath]);
      }
      (function (require, exports, code) {
        eval(code);
      })(absRequire, exports, graph[file].code)
    }
    require(`${file}`);
  })(${depsGraph})`;
}
```
### 最终代码
```js
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const getModuleInfo = (file) => {
  const body = fs.readFileSync(file, 'utf-8');
  const ast = parser.parse(body, {
    sourceType: 'module' // 表示我们要解析的是ES模块
  })
  // 新增代码
  const deps = {};
  traverse(ast, {
    ImportDeclaration({node}) {
      const dirname = path.dirname(file);
      const abspath = './' + path.join(dirname, node.source.value);
      deps[node.source.value] = abspath;
    }
  });
  console.log(deps);

  // 新增代码
  const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"]
  });
  const moduleInfo = { file, deps, code };
  return moduleInfo;
}

const parseModules = (file) => {
  const entry = getModuleInfo(file);

  const temp = [entry];
  for (let i = 0; i < temp.length; i++) {
    const deps = temp[i].deps;
    if (deps) {
      for (const key in deps) {
        if (deps.hasOwnProperty(key)) {
          temp.push(getModuleInfo(deps[key]));
        }
      }
    }
  }
  console.log(temp);
  const depsGraph = {};
  temp.forEach(moduleInfo => {
    depsGraph[moduleInfo.file] = {
      deps: moduleInfo.deps,
      code: moduleInfo.code
    }
  })
  console.log(depsGraph);
  return depsGraph;
}

const bundle = (file) => {
  const depsGraph = JSON.stringify(parseModules(file));
  return `(function (graph) {
    function require(file) {
      function absRequire(relPath) {
        return require(graph[file].deps[relPath]);
      }
      (function (require, exports, code) {
        eval(code);
      })(absRequire, exports, graph[file].code)
    }
    require(`${file}`);
  })(${depsGraph})`;
}
const content = bundle('./src/index.js');

console.log(content);

// 写入到我们的dist目录下
fs.mkdirSync('./dist');
fs.writeFileSync('./dist/bundle.js', content);
```
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
