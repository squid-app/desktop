var buildFolder   = './build/'
  , assetsFolder  = buildFolder + 'assets/'
  , releaseFolder = './release/'
  , environment   = 'dev'
  , noModules     = false
  , gulp          = require('gulp')
  , plumber       = require('gulp-plumber')
  , del           = require('del')
  , source        = require('vinyl-source-stream')
  , buffer        = require('vinyl-buffer')
  , browserify    = require('browserify')
  , reactify      = require('reactify')
  , uglify        = require('gulp-uglify')
  , replace       = require('gulp-replace-task')
  , rename        = require('gulp-rename')
  , sequence      = require('run-sequence')
  , gutil         = require('gulp-util')
  , sass          = require('gulp-sass')
  , sourcemaps    = require('gulp-sourcemaps')
  , autoprefixer  = require('gulp-autoprefixer')
  , concat        = require('gulp-concat')
  , shell         = require('gulp-shell')
  , argv          = require('yargs').argv
  , pkg           = require('./package.json')
  , spawn         = require('child_process').spawn
  , config        = require('./config/desktop')


if( argv.prod === true )
  environment = 'prod'

if( argv.noModules )
  noModules = argv.noModules

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

gulp.task('set:config', function()
{
  console.log( 'env config', environment )
  if( environment !== 'prod' )
  {
    var path = './config/' + environment

    delete require.cache[ path ]

    var envConfig = require( path )

    config = require('lodash').merge( config, envConfig )
  }
})

gulp.task('build:clean', function()
{
  var files = [ buildFolder + '*' ]

  if( noModules )
    files.push( buildFolder + 'node_modules' )

  return del( files )
})

gulp.task('build:version', function ()
{
  return gulp.src('./osx/Info.plist')
      .pipe(replace({
        patterns: [
          {
              match:       'version'
            , replacement: pkg.version
          }
        ]
      }))
      .pipe( gulp.dest( releaseFolder ) )
})

gulp.task('build:package', function ()
{
  var name   = pkg.displayName

  if( environment !== 'prod' )
    name   = name + '-' + environment

  var json = JSON.stringify({
      'name':            name
    , 'version':         pkg.version
    , 'main':            'index.html'
    , 'single-instance': true
    , 'window':          config.window
    , 'chromium-args':   '--disable-gpu --force-cpu-draw'
    , 'dependencies':    pkg.dependencies
  }, null, 2)

  return string_src( 'package.json', json )
            .pipe( gulp.dest( buildFolder ) )
})

gulp.task('build:config', function ()
{
  return gulp.src( './src/config_tpl.txt' )
      .pipe( replace({
        patterns: [
            {
                match:       'showDevTools'
              , replacement: config.showDevTools
            }
          , {
                match:       'logger'
              , replacement: config.logger
            }
          , {
                match:       'storage'
              , replacement: config.storage
            }
          , {
                match:       'githubApp'
              , replacement: require('./github.json')
            }
        ]
      }))
      .pipe( rename('config.js') )
      .pipe( gulp.dest( './src/js' ) )
})

gulp.task('build:modules', shell.task([
  ( noModules ) ? 'do not reload npm modules' :  'npm install --prefix ./build --production'
]))

// Compile Sass
gulp.task('build:sass', function()
{
  gulp.src( './src/scss/squid.scss' )
    .pipe(plumber({
        errorHandler: onError
    }))
    .pipe( sourcemaps.init() )
    .pipe( sass({
        includePaths: require('node-bourbon').includePaths
      , errLogToConsole: true
    }) )
    .pipe( autoprefixer(
    {
        browsers: ['last 2 versions']
      , cascade: false
    }) )
    .pipe( sourcemaps.write() )
    .pipe( gulp.dest( assetsFolder + 'css' ) )
})

gulp.task('build:move', function()
{
  gulp
    .src(['./src/html/*'])
    .pipe( gulp.dest( buildFolder ) )

  gulp
    .src(['./src/img/**/*'])
    .pipe( gulp.dest( assetsFolder + 'img' ) )

  gulp
    .src([ './src/fonts/**/*' ])
    .pipe( gulp.dest( assetsFolder + 'fonts' ) )
})

gulp.task('build:browserify', function ()
{
  // set up the browserify instance on a task basis
  var bundle = browserify(
  {
      entries:   ['./src/js/app.js']
    , paths:     ['./node_modules','./src/js/', './config/']
    , basedir:    '.'
    , fullPaths:  true
    , debug:      true
  })

  return bundle
          .transform('reactify')
          .bundle()
          .on( 'error', gutil.log )
          .pipe( source('squid.js') )
          .pipe( buffer() )
          // .pipe( uglify() )
          .pipe( sourcemaps.init( { loadMaps: true } ) )
          .pipe( sourcemaps.write('./') )
          .pipe( gulp.dest( assetsFolder + 'js' ) )
          // .pipe( shell( './node_modules/nw/nwjs/nwjc ./build/squid.js ./build/squid.bin') )
})


gulp.task('build:post', function ()
{
  return del( [
      './build/squid.js'
  ] )
})

gulp.task('build:separator', function ()
{
  console.log('*****************')
})


gulp.task('release:clean', function()
{
  return del( [ releaseFolder + '*'] )
})

gulp.task('release:package', shell.task([
    'echo start build script'
  , './scripts/build.sh'
]))


// Commands
// ---------------

// reload Gulpfile on change
gulp.task('default', function()
{
  var p

  gulp.watch( 'gulpfile.js', spawnChildren )
  spawnChildren()

  function spawnChildren( event )
  {
    // kill previous spawned process
    if( p )
      p.kill()

    // `spawn` a child `gulp` process linked to the parent `stdio`
    p = spawn( 'gulp', ['init'], {stdio: 'inherit'} )
  }
})

gulp.task('init', function()
{
  sequence(
      'set:config'
    , 'build:clean'
    , 'build:package'
    , 'build:config'
    , 'build:modules'
    , 'build:move'
    , ['build:sass', 'build:browserify']
    , 'build:post'
    , 'watch')
})

gulp.task('watch', function()
{
  gulp.watch( [
      './src/scss/**/*'
    , './src/js/**/*'
    , './src/html/*'
    , './config/*'
    , './github.json'
  ], [
      'build:separator'
    , 'set:config'
    , 'build:package'
    , 'build:config'
    , 'build:move'
    , 'build:sass'
    , 'build:browserify'
    , 'build:post'
  ])
})

gulp.task('build', function()
{
  sequence(
      'release:clean'
    , 'build:clean'
    , 'set:config'
    , 'build:version'
    , 'build:package'
    , 'build:config'
    , 'build:modules'
    , 'build:move'
    , ['build:sass', 'build:browserify']
    , 'build:post'
    , 'release:package')
})




