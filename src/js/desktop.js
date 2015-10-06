/**
 * Squid Desktop
 *
 */

'use strict';

var _       = require('lodash')

var __dirseparator = '/'

var Squid = function( nw )
{
  // APP'S Constants
  // -------------

  // Current version of the library from package file
  this._VERSION          = require('../../package.json').version

  // installed version
  this._INSTALLEDVERSION = 'VERSION'

  // node env
  this._NW               = nw

  // test instance uniqueness
  this._UID         = _.uniqueId('squid_')

  // return Squid reference
  return this
}

Squid.prototype.userHome = function( directory )
{
  // Gui.App.dataPath

  var path  = this._NW.process.env['HOME'] + '/.squid'
    , fs    = this._NW.fs
    , isDir = function( p )
      {
        if( !fs.existsSync( p ) )
        {
          fs.mkdirSync( p, '0755' )
        }
      }.bind( this )

  isDir( path )

  if( _.isString( directory ) )
  {
    path += directory

    isDir( path )
  }

  return path
}


// Init
// ----------

module.exports = Squid
