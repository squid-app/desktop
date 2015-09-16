
'use strict';

module.exports = {
    updater:
    {
      dmg_name: 'Squid Installer'
    , app_name: 'Squid'
    , source:
      {
          host: 'getsquiddone.com'
        , path: '/download/squid-lastest.dmg'
        , port: 80
      }
  }
  , window:
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
}
