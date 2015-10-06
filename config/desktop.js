
'use strict';

var _ = require('lodash')

var logFileConfig = {
    outputTransports: 'File'
  , handleExceptions: true
  , json:             true
  , maxsize:          5242880 //5MB
  , maxFiles:         5
  , colorize:         false
}

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
  , logger: {
        exitOnError: false
      , transports: {
            info: _.merge({
                level:            'info'
              , name:             'info-log'
              , filename:         './logs/all-logs.log'
            }, logFileConfig )
          , error: _.merge({
                level:            'error'
              , name:             'error-log'
              , filename:         './logs/error-logs.log'
            }, logFileConfig )
          , debug: {
                level:            'debug'
              , name:             'debug-log'
              , outputTransports: 'Console'
              , handleExceptions: true
              , json:             false
              , colorize:         true
            }
        }
    }
}
