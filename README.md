Gulp Tern Condense
==================
This is a plugin to create tern type-def index files

Usage
-----
```js
var condense = require('gulp-tern-condense')
var source   = require('vinyl-source-stream')
var buffer   = require('vinyl-buffer')

gulp.task('condense', function() {
    condense({
        files: 'src/*',
        name: 'mylibrary', // this defaults to files[0]
        defs: ['browser'], // this already includes ecmascript
        plugins: ['es_modules'], // default es_modules
        options: {spans: true}, // arguments for condense (below)
    })
    .pipe(source('typedef.json'))
    .pipe(buffer())
    .pipe(gulp.dest('dist/'))
})
```

### Condense Options
- `spans`: bool - include line number range for code scopes
- `server`: alternate TernServer instance
- `sortOutput`: bool - output sorting
