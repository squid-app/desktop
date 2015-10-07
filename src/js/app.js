
global.document  = window.document
global.navigator = window.navigator

var _           = require('lodash')
  , Gui         = window.require('nw.gui')
  , Squid       = require('squid-core')
  , GHapp       = require('../../github.json')
  , config      = require('../../config/desktop')
  , Logger      = require('./utils/logger')
  , localeLogger = new Logger({
        exitOnError: true
      , output:      'Console'
      , transports: {
            level:            'info'
          , filename:         './logs/all-logs.log'
          , handleExceptions: false
          , json:             false
          , maxsize:          5242880 //5MB
          , maxFiles:         5
          , colorize:         false
        }
    })

Gui.Window.get().showDevTools()

// Setup core config
Squid.setup({
    locale:   _.merge( config, {
        github: {
            credentials: {
                client_id:     GHapp.client_id
              , client_secret: GHapp.client_secret
            }
        }
      , logger:  localeLogger
    })
  , envName: 'dev'
})

// console.log( Squid.getConfig() )

var desktop = require('./desktop')
console.log(desktop)
console.log(desktop.userHome('/logs'))
