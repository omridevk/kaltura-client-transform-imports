var types = require('@babel/types');

var pathLib = require('path');

function findOptionFromSource(source, state) {
    var opts = state.opts;
    if (opts[source]) return source;


    if (opt) return opt;

    var isRelativePath = source.match(/^\.{0,2}\//);
    // This block handles relative paths, such as ./components, ../../components, etc.
    if (isRelativePath) {
        var dirname = source[0] === '/' ? '' : state.file.opts.filename ? pathLib.dirname(state.file.opts.filename) : '.'
        var _source = pathLib.resolve(pathLib.join(dirname, source));

        if (opts[_source]) {
            return _source;
        }
    }
}

function getMatchesFromSource(opt, source) {
    var regex = new RegExp(opt, 'g');
    var matches = [];
    var m;
    while ((m = regex.exec(source)) !== null) {
        if (m.index === regex.lastIndex) regex.lastIndex++;
        m.forEach(function (match) {
            matches.push(match);
        });
    }
    return matches;
}

function barf(msg) {
    throw new Error('babel-plugin-transform-imports: ' + msg);
}

function transform(transformOption, importName, matches) {
    if (typeof transformOption === 'function') {
        return transformOption(importName, matches);
    }

    return transformOption.replace(/\$\{\s?([\w\d]*)\s?\}/ig, function (str, g1) {
        if (g1 === 'member') return importName;
        return matches[g1];
    });
}

module.exports = function () {
    return {
        visitor: {
            ImportDeclaration: function (path, state) {
                console.log(path);
                console.log(state);
            }
        }
    }
}
