
'use strict';

module.exports = {
    window:
    {
        title:       'Squid'
      , toolbar:     false
      , width:       380
      , height:      465
      , resizable:   false
      , frame:       false
      , transparent: true
      , show:        false
    }
  , storage: { engine: 'localStorage' }
  , logger: {
        exitOnError: false
      , output:      'File'
      , transports: {
            level:            'info'
          , filename:         '/logs/info.log'
          , handleExceptions: true
          , json:             true
          , maxsize:          5242880 //5MB
          , maxFiles:         5
          , colorize:         false
        }
    }
  , showDevTools:    false
}
