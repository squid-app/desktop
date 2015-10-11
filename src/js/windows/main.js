/**
 * Squid Desktop
 * Main window
 *
 */

'use strict';

var Desktop = window.Squid
  , Core    = Desktop.core()

var MainWindow = function()
{
  console.log('+++++++')
  console.log( Desktop._UID )
  console.log( screen.height )


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
