var buildFolder   = './build/'
  , assetsFolder  = buildFolder + 'assets/'
  , releaseFolder = './release/'
  , environment   = 'dev'
  , gulp          = require('gulp')
  , plumber       = require('gulp-plumber')
  , del           = require('del')
  , source        = require('vinyl-source-stream')
  , reactify      = require('reactify')
  , replace       = require('gulp-replace-task')
  , sequence      = require('run-sequence')
  , gutil         = require('gulp-util')
  , sass          = require('gulp-sass')
  , sourcemaps    = require('gulp-sourcemaps')
  , autoprefixer  = require('gulp-autoprefixer')
  , concat        = require('gulp-concat')
  , pkg           = require('./package.json')
  , exec          = require('child_process').exec
  , _             = require('lodash')

if( gutil.env.prod === true )
  environment = 'prod'


// Gulp plumber error handler
var onError = function(err) {
  console.log(err);
}


// Helpers
// ---------------

function string_src(filename, string)
{
  var src = require('stream').Readable({ objectMode: true })

  src._read = function ()
  {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }

  return src
}

// Tasks
// ---------------

gulp.task('build:clean', function()
{
  return del( ['./build/*'] )
})

gulp.task('build:newrelease', function()
{
  return del( ['./build/*'] )
})

gulp.task('build:version', function ()
{
  return gulp.src('./osx/Info.plist')
      .pipe(replace({
        patterns: [
          {
            match: 'version',
            replacement: pkg.version
          }
        ]
      }))
      .pipe( gulp.dest( releaseFolder ) )
})

gulp.task('build:package', function ()
{
  var config = require('./config/desktop')
    , name   = pkg.name

  if( environment !== 'prod' )
  {
    var devConfig = require('./config/dev')
    config = _.merge( config, devConfig )
    name   = name + '-' + environment
  }

  var json = JSON.stringify({
      'name':           name
    , 'version':        pkg.version
    , 'main':           'index.html'
    , 'single-instance': true
    , 'window':          config.window
    , 'dependencies':    pkg.dependencies
  }, null, 2)

  return string_src( 'package.json', json)
            .pipe( gulp.dest( buildFolder ) )
})

gulp.task('build:modules', function ()
{
  console.log('install package dependencies')

  exec('npm install --prefix ./build --production', function (err, stdout, stderr){})
})

// Compile Sass
gulp.task('sass', function ()
{
  gulp.src('./src/scss/squid.scss')
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe( sourcemaps.init() )
    .pipe( sass({
        includePaths: require('node-bourbon').includePaths
      , errLogToConsole: true
    }) )
    .pipe(sourcemaps.write())
    .pipe(autoprefixer(
    {
        browsers: ['last 2 versions']
      , cascade: false
    }))
    .pipe( gulp.dest( assetsFolder + 'css' ) )
})

gulp.task('move', function()
{
  gulp
    .src(['./github.json'])
    .pipe( gulp.dest( buildFolder ) )

  gulp
    .src(['./src/html/*'])
    .pipe( gulp.dest( buildFolder ) )

  gulp
    .src(['./src/img/**/*'])
    .pipe( gulp.dest( assetsFolder + 'img' ) )

  gulp
    .src([ './src/fonts/**/*' ])
    .pipe( gulp.dest( assetsFolder + 'fonts' ) )

  gulp
    .src([ './config/**/*' ])
    .pipe( gulp.dest( buildFolder + '/config' ) )
})

gulp.task('concat', function ()
{
  gulp.src([
        './src/js/utils/*.js'
      , './src/js/app.js'])
    .pipe(require('gulp-reactify')())
    .pipe( sourcemaps.init() )
    .pipe( concat('squid.js') )
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest( assetsFolder + 'js' ) )
})

// Commands
// ---------------

gulp.task('init', function()
{
  sequence(
      'build:clean'
    , 'build:package'
    , 'build:modules'
    , 'move'
    , ['sass', 'concat']
    , 'watch'
    , function(){} )
})

gulp.task('watch', function()
{
  gulp.watch( [
      './src/scss/**'
    , './src/js/**'
    , './src/html/*'
    , './config/*'
    , './github.json'
  ], [
      'sass'
    , 'concat'
    , 'move'
  ])
})

gulp.task('build', function()
{
  sequence(
      'build:clean'
    , 'build:newrelease'
    , 'build:version'
    , 'build:package'
    , 'build:modules'
    , 'move'
    , ['sass', 'concat']
    , function()
      {
        console.log('start build script')

        exec('./scripts/build.sh', function (err, stdout, stderr)
        {
          console.log('build done')
        })
      })
})




