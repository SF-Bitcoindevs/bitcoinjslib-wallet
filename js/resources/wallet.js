var util = require('util'),
  _ = require('underscore'),
  Client = require('./client').Client;

module.exports = Wallet;
// inherits from base Client class
function Wallet(options) {
  Client.call(this, options)
}

util.inherits(Wallet, Client);

// todo: // better error message
// addresses {Array[String]}
Wallet.prototype.get = function(addresses, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  self.request({
    method: 'GET',
    uri: ['wallet'],
    params: {
      addresses: addresses,
      transactions: true,
      unspents: true
    },
    options: options
  }, callback)
}
