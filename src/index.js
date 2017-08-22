var fs = require('fs')
var glob = require('glob')
var through = require('through2')
var readonly = require('read-only-stream')
var tern = require('tern')
var condense = require('tern/lib/condense')

module.exports = function(options) {
    var files = typeof options.files === 'string' ? [options.files] : files
    
    options = Object.assign({
        plugins: ['es_modules'],
        defs: [],
        name: files[0],
        options: {spans: true},
    }, options)
    
    var origins = files
    .reduce((sum, f) => sum.concat(glob.sync(f)), [])
    .filter((v, i, self) => !self.slice(0, i).includes(i))
    
    var defs = ['ecmascript']
    .concat(options.defs)
    .filter((v, i, self) => !self.slice(0, i).includes(i))
    .map(name => {
        try {
            return JSON.parse(fs.readFileSync(require.resolve(`tern/defs/${name}.json`), 'utf8'))
        } catch (e) {}
        return JSON.parse(fs.readFileSync(name), 'utf8')
    })
    
    var plugins = {};
    options.plugins.forEach(name => {
        plugins[name] = fs.readFileSync(require.resolve(`tern/plugin/${name}.js`), 'utf8')
    })
    
    var server = options.options.server || new tern.Server({
        defs: defs,
        plugins: plugins
    })
    
    origins.forEach(f => {
        server.addFile(f, fs.readFileSync(f, 'utf8'))
    })
    
    var stream = through();
    server.flush(err => {
        if (err) throw new Error(`gulp-tern-condense: {error.message}`)
        
        var code = condense.condense(origins, options.name, options.options)
        stream.write(JSON.stringify(code, null, 2))
        stream.end()
    })
    return readonly(stream)
}
