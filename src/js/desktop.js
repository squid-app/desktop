/**
 * Squid Desktop
 *
 */

'use strict';

var _       = require('lodash')

var __dirseparator = '/'

var Squid = function()
{
  // APP'S Constants
  // -------------

  // Current version of the library from package file
  this._VERSION          = require('../../package.json').version

  // installed version
  this._INSTALLEDVERSION = 'VERSION'

  // test instance uniqueness
  this._UID         = _.uniqueId('squid_')

  // return Squid reference
  return this
}

// Path and Directories
//-------------------------------

// Get the application's data path in user's directory
//
//      @return  {string}
//
Squid.prototype.dataPath = function()
{
  return window.require('nw.gui').App.dataPath
}

// Check if directory exist or create it.
//
//      @params  {string}  directory path
//      @return  {void}
//
Squid.prototype.isDirectoryExists = function( path )
{
  var fs = window.require('fs')

  if( !fs.existsSync( path ) )
  {
    fs.mkdirSync( path, '0755' )
  }
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


// Init
// ----------

module.exports = new Squid()
