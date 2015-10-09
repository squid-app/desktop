var buildFolder   = './build/'
  , assetsFolder  = buildFolder + 'assets/'
  , releaseFolder = './release/'
  , environment   = 'dev'
  , gulp          = require('gulp')
  , plumber       = require('gulp-plumber')
  , del           = require('del')
  , source        = require('vinyl-source-stream')
  , buffer        = require('vinyl-buffer')
  , browserify    = require('browserify')
  , reactify      = require('reactify')
  , replace       = require('gulp-replace-task')
  , sequence      = require('run-sequence')
  , gutil         = require('gulp-util')
  , sass          = require('gulp-sass')
  , sourcemaps    = require('gulp-sourcemaps')
  , autoprefixer  = require('gulp-autoprefixer')
  , concat        = require('gulp-concat')
  , argv          = require('yargs').argv
  , pkg           = require('./package.json')
  , run           = require('gulp-run')
  , exec          = require('child_process').exec
  , spawn         = require('child_process').spawn
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
  return del( [ releaseFolder + '*'] )
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
    , name   = pkg.displayName

  if( environment !== 'prod' )
  {
    var envConfig = require( './config/' + environment )
    config = _.merge( config, envConfig )
    name   = name + '-' + environment
  }

  var json = JSON.stringify({
      'name':            name
    , 'version':         pkg.version
    , 'main':            'index.html'
    , 'single-instance': true
    , 'window':          config.window
    , 'dependencies':    pkg.dependencies
    , 'showDevTools':    config.showDevTools
    , 'logger':          config.logger
    , 'githubApp':       require('./github.json')
  }, null, 2)

  return string_src( 'package.json', json)
            .pipe( gulp.dest( buildFolder ) )
})

gulp.task('build:modules', function ()
{
  var cmd = 'npm install --prefix ./build --production'

  console.log('install package dependencies')

  return run( cmd ).exec()
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
  // gulp
  //   .src(['./github.json'])
  //   .pipe( gulp.dest( buildFolder ) )

  gulp
    .src(['./src/html/*'])
    .pipe( gulp.dest( buildFolder ) )

  // gulp
  //   .src(['./logs'])
  //   .pipe( gulp.dest( buildFolder ) )

  gulp
    .src(['./src/img/**/*'])
    .pipe( gulp.dest( assetsFolder + 'img' ) )

  gulp
    .src([ './src/fonts/**/*' ])
    .pipe( gulp.dest( assetsFolder + 'fonts' ) )

  // gulp
  //   .src([ './config/**/*' ])
  //   .pipe( gulp.dest( buildFolder + '/config' ) )
})

gulp.task('browserify', function ()
{
  // set up the browserify instance on a task basis
  var bundle = browserify(
  {
      entries:   ['./src/js/app.js']
    , paths:     ['./node_modules','./src/js/']
    , basedir:    '.'
    , fullPaths:  true
    , debug:      true
  })

  return bundle
          .transform('reactify')
          .bundle()
          .pipe( source('squid.js') )
          .pipe( buffer() )
          .pipe( sourcemaps.init( { loadMaps: true } ) )
          .pipe( sourcemaps.write('./') )
          .on('error', gutil.log)
          .pipe( gulp.dest( assetsFolder + 'js' ) )
})

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
      'build:clean'
    , 'build:package'
    , 'build:modules'
    , 'move'
    , ['sass', 'browserify']
    , 'watch'
    , function(){} )
})

gulp.task('watch', function()
{
  gulp.watch( [
      './src/scss/**'
    , './src/js/**/*'
    , './src/html/**/*'
    , './config/**/*'
    , './github.json'
  ], [
      'sass'
    , 'browserify'
    , 'move'
  ])
})

gulp.task('build', function()
{
  sequence(
      'build:newrelease'
    , 'build:clean'
    , 'build:version'
    , 'build:package'
    , 'build:modules'
    , 'move'
    , ['sass', 'browserify']
    , function()
      {
        console.log('start build script')

        exec('./scripts/build.sh', function (err, stdout, stderr)
        {
          console.log('build done')
        })
      })
})




