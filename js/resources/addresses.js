var util = require('util'),
  _ = require('underscore'),
  Client = require('./client').Client;

module.exports = Address;

// inherits from base Client class
function Address(options) {
  Client.call(this, options)
}

util.inherits(Address, Client)

// todo: // better error message
// txHash {String}
Address.prototype.get = function(address, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  self.request({
    method: 'GET',
    resource: 'address',
    uri: ['addresses', address],
    options: options
  }, callback)
}

// txHashes Array[String]
Address.prototype.batchGet = function(addresses, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  self.request({
    method: 'GET',
    resource: 'addresses',
    uri: ['addresses'],
    params: {
      addresses: addresses
    },
    options: options
  }, callback)
}

// address {string|Array[string]}
Address.prototype.getTransactions = function(address, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  if ('string' == typeof address) {
    self.request({
      method: 'GET',
      resource: 'transactions',
      uri: ['addresses', address, 'transactions'],
      options: options
    }, callback)
  } else if (Array.isArray(address)) {
    self.request({
      method: 'GET',
      resource: 'transactions',
      uri: ['addresses', 'transactions'],
      params: {
        addresses: address
      },
      options: options
    }, callback)
  } else {
    return callback(new Error('Incorrect Addresses'))
  }
}

// address {string|Array[string]}
Address.prototype.getUnspents = function(address, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  if ('string' == typeof address) {
    self.request({
      method: 'GET',
      resource: 'unspents',
      uri: ['addresses', address, 'unspents'],
      options: options
    }, callback)
  } else if (Array.isArray(address)) {
    self.request({
      method: 'GET',
      resource: 'unspents',
      uri: ['addresses', 'unspents'],
      params: {
        addresses: address
      },
      options: options
    }, callback)
  } else {
    return callback(new Error('Incorrect Addresses'))
  }
}
