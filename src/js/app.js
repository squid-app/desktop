/**
 * Squid Desktop
 * Squid is a Github issues client on Mac OS X and IOS.
 *
 *
 *         MMM.           .MMM
 *         MMMMMMMMMMMMMMMMMMM
 *         MMMMMMMMMMMMMMMMMMM      _________________
 *        MMMMMMMMMMMMMMMMMMMMM    |                 |
 *       MMMMMMMMMMMMMMMMMMMMMMM   | Get Squid done! |
 *      MMMMMMMMMMMMMMMMMMMMMMMM   |_   _____________|
 *      MMMM::- -:::::::- -::MMMM    |/
 *       MM~:~   ~:::::~   ~:~MM
 *  .. MMMMM::. .:::+:::. .::MMMMM ..
 *        .MM::::: ._. :::::MM.
 *           MMMM;:::::;MMMM
 *    -MM        MMMMMMM
 *    ^  M+     MMMMMMMMM
 *        MMMMMMM MM MM MM
 *             MM MM MM MM
 *             MM MM MM MM
 *          .~~MM~MM~MM~MM~~.
 *      ~~~~MM:~MM~~~MM~:MM~~~~
 *      ~~~~~~==~==~~~==~==~~~~~~
 *       ~~~~~~==~==~==~==~~~~~~
 *           :~==~==~==~==~~
 *
 *
 * @package    Desktop
 * @version    0.1.0
 * @author     Squid Development Team
 * @license    MIT License
 * @copyright  2015 Squid Development Team
 * @link       http://getsquiddone.com
 *
 */

'use strict';

global.document  = window.document
global.navigator = window.navigator

var _      = require('lodash')
  , Gui    = window.require('nw.gui')
  , Config = require('./config') // private config file

var Squid = function()
{
  // APP's Constants
  // -------------------------------

  // Current version of the library from package file
  this._VERSION          = require('../../package.json').version

  // installed version
  this._INSTALLEDVERSION = 'VERSION'

  // test instance uniqueness
  this._UID              = _.uniqueId('squid_desktop_')

  //  test for retina / high resolution / high pixel density
  this._HIRES            = !!( window.devicePixelRatio > 1 )

  // APP's Core dependency
  // -------------------------------

  // Setup Squid core
  this._CORE = require('squid-core').setup({
      locale:   {
          github:  this.setupGhApp()
        , logger:  this.setupLogger()
        , storage: this.setupStorage()
      }
    // , envName: 'dev'
  })

  // Setup icon tray
  this._TRAY = new ( require('./utils/tray') )( this._HIRES )

  // display DevTools on dev env
  // -------------------------------

  if( Config.showDevTools )
    Gui.Window.get().showDevTools()

  // return Squid reference
  return this
}

// Core Alias/Dependencies
//-------------------------------

// Core instance alias
//
//      @return  {object}
//
Squid.prototype.core = function()
{
  return this._CORE
}

// Setup the Github application's config
//
//      @return  {object}
//
Squid.prototype.setupGhApp = function()
{
  return {
    credentials: {
        client_id:     Config.client_id
      , client_secret: Config.client_secret
    }
  }
}

// Setup the application's logger config
//
//      @return  {object}
//
Squid.prototype.setupLogger = function()
{
  if( !Gui.App.manifest.logger )
    return false

  var settings = {}

  // define log file storage path if required
  if( Config.logger.transports
      && Config.logger.transports.filename )
  {
    settings.transports = {
      filename:  this.dataPath() + Config.logger.transports.filename
    }
  }

  settings = _.merge( Config.logger, settings )

  return new ( require('./utils/logger') )( settings )
}

// Setup the application's storage config
//
//      @return  {object}
//
Squid.prototype.setupStorage = function()
{
  return new ( require('./utils/storage') )()
}

// Path and Directories
//-------------------------------

// Check if directory exist or create it.
//
//      @params  {string}  directory path
//      @return  {void}
//
Squid.prototype.isDirectoryExists = function( path )
{
  var fs = window.require('fs')

  if( !fs.existsSync( path ) )
    fs.mkdirSync( path, '0755' )
}

// Get the application's data path in user's directory
//
//      @return  {string}
//
Squid.prototype.dataPath = function()
{
  return Gui.App.dataPath
}

// Get Squid folder in the user's home directory
// If folder does not exist, we create it.
// We can ask for a sub folder. If it doesn't exist we create it
//
//      @params  {string}  subfolder in Squid directory
//      @return  {string}
//
Squid.prototype.userHome = function( subfolder )
{
  var path  = window.process.env['HOME'] + '/.squid'

  this.isDirectoryExists( path )

  if( _.isString( subfolder ) )
  {
    path += subfolder

    this.isDirectoryExists( path )
  }

  return path
}

// App's windows management
//-------------------------------

// Browserify can not add dynamic file,
// http://stackoverflow.com/a/27672458/3908378
// https://github.com/capaj/require-globify
//
// TODO: take a loke at webpack that seems to resolve the problem
Squid.prototype.windows = function( _filename )
{
  var w
  switch( _filename )
  {
    case 'main':
      w = require( './windows/main')
      break
  }

  return new ( w )()
}

// Expose class instance
//-------------------------------

window.Squid = new Squid()
