/**
 * Squid Desktop
 *
 * Display menubar icon and
 * manage main window visibility
 *
 */

'use strict';

var Gui = window.require('nw.gui')

var Tray = function( hires )
{
  this._HIRES = hires

  // Setup menubar icon
  // depending on screen resolution and OS theme
  var icon    = ( this._HIRES ) ? 'anchor-black-@2x.png' : 'anchor-black.png'
    , alticon = ( this._HIRES ) ? 'anchor-white-@2x.png' : 'anchor-white.png'

  // Create a tray icon
  this._TRAY = new Gui.Tray({
      title:   ''
    , icon:    'assets/img/' + icon
    , alticon: 'assets/img/' + alticon
  })

  // Minimal Menu bar item
  var nativeMenuBar = new Gui.Menu({ type: 'menubar' })

  nativeMenuBar.createMacBuiltin('Squid')

  Gui.Window.get().menu = nativeMenuBar

  // Test, to remove
  this._TRAY.on( 'click', function()
  {
    window.require('nw.gui').Window.open('new.html', {
        'position': 'center'
      , 'focus':    true
      , 'toolbar':  true
      , 'frame':    true
      , 'width':    475
      , 'height':   330
    })
  })
}

// Get _TRAY instance
Tray.prototype.get = function()
{
  return this._TRAY
}

// Update menubar icon icon
Tray.prototype.set = function( icon )
{
  if( this._HIRES )
    icon = icon + '-@2x'

  this._TRAY.icon = icon + '.png'
}

module.exports = Tray
