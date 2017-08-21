var fs = require('fs')
var glob = require('glob')
var through = require('through2')
var readonly = require('read-only-stream')
var tern = require('tern')
var condense = require('tern/lib/condense')

module.exports = function(files, options) {
    options = Object.assign({
        plugins: ['es_modules'],
        defs: [],
        name: files,
    }, options)
    
    var origins = glob.sync(files)
    
    var defs = ['ecmascript'].map((name) => (
        JSON.parse(fs.readFileSync(require.resolve(`tern/defs/${name}.json`), 'utf8'))
    ))
    .concat(options.defs)
    
    var plugins = {};
    options.plugins.forEach((name) => {
        plugins[name] = fs.readFileSync(require.resolve(`tern/plugin/${name}.js`), 'utf8')
    })
    
    var server = new tern.Server({
        defs: defs,
        plugins: plugins
    })
    
    origins.forEach((f) => {
        server.addFile(f, fs.readFileSync(f, 'utf8'))
    })
    
    var stream = through();
    server.flush(function(err) {
        if (err) throw err
        
        var code = condense.condense(origins, options.name, {spans: true})
        stream.write(JSON.stringify(code, null, 2))
        stream.end()
    })
    return readonly(stream)
}
