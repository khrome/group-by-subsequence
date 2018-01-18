var lcs = require('common-prefix');
var lcw = require('common-path-prefix');
var Objects = require('async-objects');

function listToCommonIndex(list, opts){
    var options = opts || {};
    var index = {};
    list.forEach(function(item){
        var cans = {};
        var forwardExpression = new RegExp(options.wordBoundary, 'g');
        var backwardExpression = new RegExp('/', 'g');
        list.forEach(function(compItem){
            if(item !== compItem){
                var common = options.wordBoundary?
                    lcw([
                        item.replace(forwardExpression, '/'),
                        compItem.replace(forwardExpression, '/')
                    ]).replace(backwardExpression, options.wordBoundary):
                    lcs([item, compItem]);
                if(common[common.length-1] === options.wordBoundary){
                    common = common.substring(0, common.length-1);
                };
                if(!common.length) return;
                if(item[common.length] !== '_'){
                    throw new Error('not a boundary['+common+']:'+item[common.length]);
                }
                if(common && options.stopwords && options.stopwords.indexOf(common) !== -1){
                    var next = item.substring(common.length+1).indexOf(options.wordBoundary);
                    var length = common.length+(next === -1?item.length:next+1);
                    common = common+item.substring(common.length, length);
                    if(options.objectReturn && typeof options.objectReturn === 'function'){
                        common = options.objectReturn(common, '');
                    }
                };
                if(!cans[common]) cans[common] = 1;
                else cans[common]++;
            }
        });
        var can = Object.keys(cans).sort(function(a, b){
            return cans[a] + a.length > cans[b] + b.length;
        })[0];
        //console.log('CAN', can, cans)
        if(can){
            if(!index[can]) index[can] = [];
            var s = item[can.length] === options.wordBoundary?
                item.substring(can.length+1):
                item.substring(can.length);
            index[can].push(item);
        }
    });
    return index;
}

function buildTree(list, options){
    if(!options) options = {};
    var root = listToCommonIndex(list, options);
    var result = root;
    /*var result = Object.keys(root).map(function(key){
        console.log('KEY', key);
        var item = root[key];
        if(Array.isArray(item)){
            if(item.length === 1) return item[0];
            return buildTree(item, options);
        }
        return item;
    });*/
    //console.log('TREE', result);
    return result;
}

function process(obj, options, ancestry){
    if(!ancestry) ancestry = '';
    if(options.objectReturn){
        var result = {};
        if(Array.isArray(obj)){
            obj.forEach(function(item, index){
                var post = typeof options.objectReturn === 'function'?
                    options.objectReturn:
                    function(a){ return a };
                var key = post(item, ancestry);
                if(options.replacements[key]){
                    key = options.replacements[key];
                }
                result[key] = item;
            });
            return result;
        }
        if(typeof obj == 'object'){
            Object.keys(obj).forEach(function(key){
                var targetKey = key;
                if(options.replacements[key]){
                    targetKey = options.replacements[key];
                }
                result[targetKey] = process(obj[key], options, ancestry+(options.wordBoundary)+key);
            });
            return result;
        }
    }
    return obj;
}

module.exports = function(items, options, recursive){ //switch to opts add stopwords
    if(recursive) return process(buildTree(items, options), options);
    else return process(listToCommonIndex(items, options), options);
}
