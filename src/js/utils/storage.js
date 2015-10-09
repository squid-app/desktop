/**
 * Squid Desktop
 *
 * Local Storage Strategy
 *
 */

'use strict';

var Storage = function(){}

Storage.prototype.getEngineName = function()
{
  return 'LOCALSTORAGE'
}

Storage.prototype.get = function( key )
{
  return window.localStorage[ key ]
}

Storage.prototype.set = function( key, value )
{
  window.localStorage[ key ] = value
}

module.exports = Storage
