var buildFolder  = './build/'
  , environment  = 'dev'
  , gulp         = require('gulp')
  , del          = require('del')
  , source       = require('vinyl-source-stream')
  , browserify   = require('browserify')
  , reactify     = require('reactify')
  , replace      = require('gulp-replace-task')
  , gutil        = require('gulp-util')
  , sass         = require('gulp-sass')
  , sourcemaps   = require('gulp-sourcemaps')
  , autoprefixer = require('gulp-autoprefixer')
  , concat       = require('gulp-concat')
  , argv         = require('yargs').argv
  , pkg          = require('./package.json')
  , exec         = require('child_process').exec
  , _            = require('lodash')

if( gutil.env.prod === true )
  environment = 'prod'

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

gulp.task('build:clean', function()
{
  return del(['build/*'])
})

gulp.task('build:version', ['build:clean'], function ()
{
  gulp.task('default', function ()
  {
    gulp.src('./osx/Info.plist')
      .pipe(replace({
        patterns: [
          {
            match: 'version',
            replacement: pkg.version
          }
        ]
      }))
      .pipe( gulp.dest( buildFolder ) )
  })
  // return string_src( 'VERSION', pkg.version)
  //           .pipe( gulp.dest( buildFolder ) )
})

gulp.task('build:package', ['build:clean'], function ()
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

gulp.task('build:modules', ['build:package'], function ()
{
  exec('npm install --prefix ./build --production', function (err, stdout, stderr)
  {
    console.log(stdout)
    console.log(stderr)
  })
})

// Compile Sass
gulp.task('sass', function ()
{
  gulp.src('./src/scss/squid.scss')
    .pipe( sourcemaps.init() )
    .pipe( sass({
      includePaths: require('node-bourbon').includePaths
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
      , './scripts/updater.js'
    ])
    .pipe( gulp.dest( buildFolder ) )
})


gulp.task('browserify', function ()
{
  return browserify( './src/js/app.js' )
    .transform( reactify )
    .bundle()
    .pipe( source('squid.js') )
    .pipe( gulp.dest( buildFolder ) )
})

gulp.task('watch', function()
{
  gulp.watch( [
      './src/scss/**/*.scss'
    , './src/js/**/*.js'
    , './src/scripts/updater.js'
  ], [
      'sass'
    , 'browserify'
    , 'move'
  ])
})

var tasks = [
    'build:clean'
  , 'build:version'
  , 'build:package'
  , 'build:modules'
  , 'move'
  // , 'sass'
  // , 'browserify'
  // , 'watch'
]

gulp.task('default', tasks ) //.concat( ['watch'] ) )

gulp.task('build', tasks )




