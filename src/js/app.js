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

global.document  = window.document
global.navigator = window.navigator

var _           = require('lodash')
  , Gui         = window.require('nw.gui')
  , Squid       = require('squid-core')
  // , GHapp       = require('../../github.json')
  // , config      = require('../../config/desktop')
  , Logger      = require('./utils/logger')
  , localeLogger = new Logger( Gui.App.manifest.logger )
  // , localeLogger = new Logger({
  //       exitOnError: true
  //     , output:      'Console'
  //     , transports: {
  //           level:            'info'
  //         , filename:         './logs/all-logs.log'
  //         , handleExceptions: false
  //         , json:             false
  //         , maxsize:          5242880 //5MB
  //         , maxFiles:         5
  //         , colorize:         false
  //       }
  //   })

// display DevTools on dev env
if( Gui.App.manifest.showDevTools )
  Gui.Window.get().showDevTools()

// Setup core config
Squid.setup({
    locale:   {
        github: {
            credentials: {
                client_id:     Gui.App.manifest.githubApp.client_id
              , client_secret: Gui.App.manifest.githubApp.client_secret
            }
        }
      , logger:  localeLogger
    }
  , envName: 'dev'
})

console.log( Squid.getConfig() )

var desktop = require('./desktop')
console.log(desktop)
console.log(desktop.userHome('/logs'))
