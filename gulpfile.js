var buildFolder   = './build/'
  , releaseFolder = './release/'
  , environment   = 'dev'
  , gulp          = require('gulp')
  , del           = require('del')
  , source        = require('vinyl-source-stream')
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
  , exec          = require('child_process').exec
  , _             = require('lodash')

if( gutil.env.prod === true )
  environment = 'prod'

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
  var config = require('./config/squid.json').default

  if( environment !== 'prod' )
  {
    var devConfig = require('./config/default.json').dev
    config = _.merge( config, devConfig )
  }

  var json = JSON.stringify({
      'name':           'Squid'
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
    .pipe( gulp.dest( buildFolder ) )
})

gulp.task('move', function()
{
  gulp
    .src([
        './src/html/*'
      , './src/img/*'
      , './config'
      , './scripts/updater.js'
    ])
    .pipe( gulp.dest( buildFolder ) )

  gulp
    .src([
       './config/**/*'
    ])
    .pipe( gulp.dest( buildFolder + '/config' ) )
})


gulp.task('browserify', function ()
{
  return browserify( './src/js/app.js' )
    .transform( reactify )
    .bundle()
    .pipe( source('squid.js') )
    .pipe( gulp.dest( buildFolder ) )
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
    , ['sass'] // , 'browserify'
    , 'watch'
    , function(){} )
})

gulp.task('watch', function()
{
  gulp.watch( [
      './src/scss/**/*.scss'
    , './src/js/**/*.js'
    , './src/scripts/updater.js'
    , './config/**/*.js'
  ], [
      'sass'
    // , 'browserify'
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
    , ['sass'] // , 'browserify'
    , function()
      {
        console.log('start build script')

        exec('./scripts/build.sh', function (err, stdout, stderr)
        {
          console.log('build done')
        })
      })
})




