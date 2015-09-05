// App updater based on:
// https://github.com/sqwiggle/node-webkit-mac-updater

var fs          = require('fs')
  , http        = require('http')
  , path        = require('path')
  , exec        = require('child_process').exec
  , execPath    = window.process.execPath
  , filePath    = execPath.substr( 0, execPath.lastIndexOf( "\\" ) )
  , appPath     = path.normalize(execPath + "/../../../../../../..")
  , escapeshell = function(cmd) 
    {
      return '"'+cmd.replace(/(["'$`\\])/g,'\\$1')+'"'
    }

var UpdaterError = function( hash )
{
  hash =  hash || {}

  this.name    = 'Squid Updater'
  this.message = hash.message || 'Updater has failed'
  this.context = hash.context || null
}

var Updater = function( config )
{
  // Prevent actions during version check or DMG download
  this._redFlag = false

  // 
  this._store   = false

  // Defaut settings
  var _settings = 
  {
      dmg_name: 'Squid Installer'
    , app_name: 'Squid'
    , source: 
      {
          host: 'michael-lefebvre.github.io'
        , port: 80
        , path: '/Squid/download/Squid-Installer.dmg'
      }
    , tmpFile: appPath + '/.squid-update.dmg'
    , version: '/Squid/VERSION'
    , progress: function( percentage ) 
      {
        document.getElementById('js-update-progress').style.width = percentage + '%'
      }
  }

  // Mixe settings with context config
  this._config   = this._merge( _settings, config || {} ) 

  // Copy source config to check current version 
  // of the App on remote server
  
  this._versionSrc  = {
      host: this._config.source.host
    , port: this._config.source.port
    , path: this._config.version
  } 

  // Cureent App version
  this._VERSION = fs.readFileSync( './VERSION' ).toString()

  console.info( 'Squid version: '+ this._VERSION )
  console.log( this._versionSrc )
  console.log( this._config )
}

Updater.prototype.setStore = function( store )
{
  this._store = store
}

Updater.prototype._merge = function( target, source )
{
  for( var key in source )
  {
    var original = target[ key ]
      , next     = source[ key ]

    if( original && next && typeof next == 'object' )
    {
      this._merge( original, next )
    }
    else
    {
      target[key] = next
    }
  }

  return target
}

// Simply compares two string version values.
//
// Example:
// versionCompare('1.1', '1.2') => -1
// versionCompare('1.1', '1.1') =>  0
// versionCompare('1.2', '1.1') =>  1
// versionCompare('2.23.3', '2.22.3') => 1
// 
// Returns:
//  -1 = local is LOWER than server
//  0  = they are equal
//  1  = local is GREATER = server is LOWER
//  And FALSE if one of input versions are not valid
//
//      @param {String} local  Version #1
//      @param {String} server Version #2
//      @return  {Integer|Boolean}
//      @author Alexey Bass (albass)
//
Updater.prototype._versionCompare = function( local, server )
{
  if( typeof local + typeof server != 'stringstring' )
    return false
  
  var a = local.split('.')
  ,   b = server.split('.')
  ,   i = 0
  , len = Math.max( a.length, b.length )
      
  for( ; i < len; i++ )
  {
    if( ( a[i] && !b[i] && parseInt( a[i] ) > 0 ) || ( parseInt( a[i] ) > parseInt( b[i] ) ) )
    {
      return 1
    }
    else if( ( b[i] && !a[i] && parseInt( b[i] ) > 0 ) || ( parseInt( a[i] ) < parseInt( b[i] ) ) )
    {
      return -1
    }
  }
  
  return 0
}

// Get the App current version on server then compare it with locale version
// Return true if remote version is newer 
//
//      @return  {bool}
//
Updater.prototype.checkRemote = function( _callback )
{
  if( !navigator.onLine )
    return

  if( this._redFlag )
    return 

  this._redFlag = true

  var self = this

  var request = http.get( this._versionSrc, function( response )
  {    
    if( response.statusCode == 200 )
    {
      var version = ''

      response.on( 'data', function( chunk ) 
      {
        version += chunk
      })

      response.on( 'end', function() 
      {
        console.log('server version: ' + version )

        var compare = self._versionCompare( self._VERSION, version )

        console.log( 'check: '+ compare )

        if( compare == -1 ) // && window.confirm('New realease available, do you want to update?') )
        {
          console.warn('UPDATE APP AVAILABLE')

          if( typeof _callback === 'function')
            _callback( version )

        }
        else // don't want to update
        {
          self._redFlag = false
        }
      })

      response.on( 'error', function() 
      {
        console.log('error')

        this._redFlag = false
      })
    }
    else
    {
      console.log( response.statusCode )
      this._redFlag = false
    }
  })
  .on( 'error', function( e )
  {
    console.log("Got error: " + e.message)
  })
}

Updater.prototype.update = function( _callback )
{
  console.info('downloading update ' + this._config.source.path)

  try 
  {
    this._download(  function( err )
    {
      if( err ) throw err

      console.info('new release downloaded')

      // self._PubSub.publish( 'squid::updateInstalling' )
      if( typeof _callback === 'function')
        _callback()
    })
  }
  catch ( err ) 
  {
    console.error( err )
    // in the event of an error, cleanup what we can
    // this._cleanup()
      // callback(err)
  }
}

Updater.prototype.install = function( callback )
{
  var self = this

  try
  {
    this._mount( function( mount_point )
    {
      console.info( 'update mounted at ' + mount_point )
    
      self._hideOriginal( function( err )
      {
        if (err) throw err

        console.log('original application hidden')
        
        self._copyUpdate( mount_point, function( err, app )
        {
          if (err) throw err

          console.log('update applied successfully at ', app)
                
          self._removeQuarantine( app, function( err )
          {
            if (err) throw err
            console.log('quarantine removed, cleaning up')
          })
                
          // if either of these fails we're still going to call it a (messy) success
          self._cleanup()
          self._unmount( mount_point, function()
          {            
            console.log('update complete')
            callback() 
          })
        })
      }) 
    })
  }
  catch( e ) { throw e }
}

// Download last App version and save it localy
//
//      @param   {function} 
//      @return  {void}
//
Updater.prototype._download = function( callback )
{
  // throw 'download fail test'

  var self = this

  var request = http.get( this._config.source, function( res )
  {
    res.setEncoding('binary')
    
    var data    = ''
      , rln     = 0
      , percent = 0
      , ln      = res.headers['content-length']
    
    res.on('data', function( chunk )
    {
      rln  += chunk.length
      data += chunk
      
      var p = Math.round( ( rln / ln ) * 100 )

      if( p > percent )
      { 
          percent = p
          self._config.progress( p )
      }
    })
     
    res.on('end', function()
    {
      fs.writeFile( self._config.tmpFile, data, 'binary', callback )
    })
  })
}

// Mount freashly downloaded DMG
//
//      @param   {function}
//      @return  {bool}
//
Updater.prototype._mount = function( callback ) 
{
  // throw 'mount fail test'

  var self = this
  
  exec( 'hdiutil attach ' + escapeshell( this._config.tmpFile ) + ' -nobrowse', function( err )
  {
    if (err) throw err

    console.log('mounted volume')
    
    self._findMountPoint( callback )
  })
}

Updater.prototype._unmount = function( mount_point, callback )
{
  exec( 'hdiutil detach ' + escapeshell( mount_point ), callback )
}

// Return mounted Disk name
//
//      @param   {function}
//      @return  {bool}
//
Updater.prototype._findMountPoint = function( callback )
{
  var self = this 

  exec( 'hdiutil info', function( err, stdout )
  {
    if (err) throw err
    
    var results = stdout.split("\n")
    
    for( var i = -1, l = results.length; ++i < l; )
    {
      if( results[ i ].match( self._config.dmg_name ) )
      {
        callback( results[ i ].split("\t").pop() )
        return
      }
    }
    
    throw "Mount point not found"
  })
}

Updater.prototype._hideOriginal = function( callback ) 
{
  // throw '_hideOriginal fail test'

  var filename = this._config.app_name + '.app'

  fs.rename( appPath + '/' + filename, appPath + '/.' + filename, callback )
}

Updater.prototype._cleanup = function()
{
  // TODO: remove this closely coupled code
  // remove downloaded dmg
  this._deleteFile( this._config.tmpFile )
  
  // remove tmp old version of application
  this._deleteFolder( appPath + '/.' + this._config.app_name + '.app' )
}

Updater.prototype._deleteFile = function( path )
{  
  if( fs.existsSync( path ) )
  {
    fs.unlinkSync( path )
  }
}

Updater.prototype._deleteFolder = function( path )
{
  var self = this
  
  if( fs.existsSync( path ) ) 
  {
    fs.readdirSync( path ).forEach( function( file, index )
    {
      var curPath = path + '/' + file
  
      if( fs.statSync( curPath ).isDirectory() )
      { // recurse
        self._deleteFolder( curPath )
      }
      else
      { // delete file
        fs.unlinkSync( curPath )
      }
    })
    
    fs.rmdirSync( path )
  }
}

Updater.prototype._copyUpdate = function( from, callback )
{
  var self = this

  exec( 'cp -R ' + escapeshell( from + '/' + self._config.app_name + '.app' ) + ' ' + escapeshell( appPath ), function( err )
  {
    callback( err, appPath + '/' + self._config.app_name + '.app' )
  })
}

Updater.prototype._removeQuarantine = function( directory, callback )
{
  exec( 'xattr -rd com.apple.quarantine ' + escapeshell( directory ), callback )
}
