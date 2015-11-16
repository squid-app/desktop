/**
 * Squid Desktop
 * Main window
 *
 */

'use strict';

var Desktop = window.Squid
  , Core    = Desktop.core()
  , Gui     = window.require('nw.gui')

var MainWindow = function()
{
  console.log('+++++++')
  console.log( Desktop._UID )
  console.log( screen.height )
  console.log( screen.width )
  console.log( Desktop.isHires() )

  var win = Gui.Window.get()

  win.moveTo(0, 22)
  win.resizeTo(screen.width, screen.height)

 // Setup icon tray
  this._TRAY = new ( require('../utils/tray') )( Desktop.isHires() )


  // set user token
  // --------------------
  var Config = require('../config') // private config file
  Core.setGithubToken( Config.githubApp.token )

  console.log( Core.getGithubToken() )

  var store = Core.store('user')

  store.listen( function( status )
  {
    if( status.user )
    {
      // console.log('------------------')
      // console.log( store.model().attributes )
      // console.log('------------------')
      console.log(store.model().getName())
      // userRepo()
      // userOrgs()
    }

    if( status.error )
      console.log('status: ', status.message)
  })

  return this
}

module.exports = MainWindow
