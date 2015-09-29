
global.document  = window.document
global.navigator = window.navigator

var React       = require('react')
  , Gui         = window.require('nw.gui')
  , Squid       = require('squid-core')
  , GHapp       = require('./github.json')

// Setup core config
Squid.setup({
    config:   {
        github: {
            credentials: {
                client_id:     GHapp.client_id
              , client_secret: GHapp.client_secret
            }
        }
      , logger: false
    }
  , env: 'dev'
})

console.log( Squid._VERSION )
console.log( Squid.getConfig() )

var HelloMessage = React.createClass({
  render: function() {
    return <div>Hello {this.props.name}</div>;
  }
});

React.render(<HelloMessage name="John" />,  document.getElementById('squid-app'))
