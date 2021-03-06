const glob = require('glob')
const path = require('path')
const chalk = require('chalk')
const fs = require('fs')
const _ = require('lodash')

function getEntries (globPath, pagesDir, tmpDir) {
  let files = []
  if (Object.prototype.toString.call(globPath) === '[object Array]') {
    globPath.forEach(function(o, i) {
      files = files.concat(glob.sync(o))
    })
  } else {
    files = glob.sync(globPath)
  }
  let _entries = {}
  let entry, dirname, filename, target
  for (let i = 0; i < files.length; i++) {
    entry = files[i]
    dirname = path.dirname(entry)
    filename = path.basename(entry)
    target = path.relative(pagesDir ,path.join(dirname, filename))
    tmpDir && (target = path.join(tmpDir, target))
    _entries[target] = path.resolve(entry)
  }

  return _entries
}

function walk(path) {
  path += !/\/$/.test(path) ? '/' : '';
  let files = [],
    directs = [];
  const _temp = fs.readdirSync(path);
  _temp.forEach(function(o, i) {
    const thepath = path + o;
    const stats = fs.statSync(thepath);
    if (stats.isDirectory()) {
      const _detail = walk(thepath);
      directs = directs.concat(_detail.directs);
      files = files.concat(_detail.files);
      directs.push(thepath);
    } else {
      files.push(thepath);
    }
  });
  return {
    files: files,
    directs: directs
  }
}

function rmFolder(path, onlycontent) {
  if (!fs.existsSync(path)) {
    return;
  }
  const files = walk(path);
  files.files.forEach((o, i) => {
    fs.unlinkSync(o);
  });

  files.directs.forEach((o, i) => {
    fs.rmdirSync(o);
  });
  !onlycontent && fs.rmdirSync(path);
}

function unifyPath(str) {
  return str.replace(/\\/g, '/')
}

function mergeArray(o, p) {
  return (o || []).concat(p || [])
}

function mergeWpConf(defaultConf, custom) {
  if(!_.isObject(defaultConf) || !_.isObject(custom)){
    return defaultConf
  }

  if(custom.resolve) {
    !defaultConf.resolve && (defaultConf.resolve = {})

    if(custom.resolve.extensions){
      if(!_.isArray(custom.resolve.extensions)){
        throw `Err: config value ${custom.resolve.extensions} shuld be Array`
      }
      defaultConf.resolve.extensions = mergeArray(defaultConf.resolve.extensions, custom.resolve.extensions)
    }
    if(custom.resolve.alias) {
      if(!_.isObject(custom.resolve.alias)){
        throw `Err: config value ${custom.resolve.alias} shuld be Object`
      }
      defaultConf.resolve.alias = _.defaultsDeep(custom.resolve.alias, defaultConf.resolve.alias || {})
    }
    if(custom.resolve.modules){
      if(!_.isArray(custom.resolve.modules)){
        throw `Err: config value ${custom.resolve.modules} shuld be Array`
      }
      defaultConf.resolve.modules = mergeArray(defaultConf.resolve.modules, custom.resolve.modules)
    }
  }

  if(custom.module) {
    !defaultConf.module && (defaultConf.module = {})
    if(custom.module.rules){
      if(!_.isArray(custom.module.rules)){
        throw `Err: config value ${custom.module.rules} shuld be Array`
      }
      defaultConf.module.rules = mergeArray(defaultConf.module.rules, custom.module.rules)
    }
    if(custom.module.plugins){
      if(!_.isArray(custom.module.plugins)){
        throw `Err: config value ${custom.module.plugins} shuld be Array`
      }
      defaultConf.module.plugins = mergeArray(defaultConf.module.plugins, custom.module.plugins)
    }
  }
  return defaultConf
}
exports.getEntries = getEntries
exports.rmFolder = rmFolder
exports.unifyPath = unifyPath
exports.mergeWpConf = mergeWpConf
