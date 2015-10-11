
'use strict';

module.exports = {
    window:
    {
        toolbar:     true
      , frame:       true
      , transparent: false
      , show:        true
    }
  , logger: {
        exitOnError: true
      , output:      'Console'
      , transports: {
            filename:         false
          , handleExceptions: false
          , json:             false
        }
    }
  , showDevTools:    true
}
