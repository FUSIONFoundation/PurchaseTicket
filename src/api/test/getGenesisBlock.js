var assert = require('assert');
var web3 = require('web3')
var web3FusionExtend = require('../web3FusionExtend')

console.log( process.env.PRIVATEKEY )
console.log( process.env.CONNECTSTRING )

describe( "ensure environment variables are setup correctly ", function() {
        assert(  process.env.CONNECTSTRING , "Environment Variable CONNECTSTRING must be set.")

        describe('Connect to Server', function(done) {
    
        });
    }
)