
var Gui = window.require('nw.gui')

module.exports = Tray = function()
{
  this._hires = this.hires()

  var icon    = ( this._hires ) ? 'anchor-black-@2x.png' : 'anchor-black.png'
    , alticon = ( this._hires ) ? 'anchor-white-@2x.png' : 'anchor-white.png'


  // Create a tray icon
  this._tray = new Gui.Tray({
      title:   ''
    , icon:    'assets/img/' + icon
    , alticon: 'assets/img/' + alticon
  })

  return this
}

//  test for retina / high resolution / high pixel density.
Tray.prototype.hires = function()
{
  // starts with default value for modern browsers
  var dpr = window.devicePixelRatio ||

  // fallback for IE
      (window.screen.deviceXDPI / window.screen.logicalXDPI) ||

  // default value
      1;

  return !!(dpr > 1);
}

// Get _tray instance
Tray.prototype.get = function()
{
  return this._tray
}

// Set new icon
Tray.prototype.set = function( icon )
{
  if( this._hires )
    icon = icon + '-@2x'

  this._tray.icon = icon + '.png'
}
