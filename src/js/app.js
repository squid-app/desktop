
global.document  = window.document
global.navigator = window.navigator

var _           = require('lodash')
  , Gui         = window.require('nw.gui')
  , Squid       = require('squid-core')
  , GHapp       = require('../../github.json')
  , config      = require('../../config/desktop')
  , Logger      = require('./utils/logger')

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
    })
  , envName: 'dev'
  , logger:  Logger
})

// console.log( Squid.getConfig() )

var desktop = require('./desktop')
  , d       = new desktop( nw )
console.log(d)
console.log(d.userHome('/logs'))
