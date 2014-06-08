var util = require('util'),
  _ = require('underscore'),
  Client = require('./client').Client;

module.exports = Block;

// inherits from base Client class
function Block(options) {
  Client.call(this, options)
}

util.inherits(Block, Client)

// todo: // better error message
// txHash {String}
Block.prototype.get = function(block, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  self.request({
    method: 'GET',
    resource: 'block',
    uri: ['blocks', block],
    options: options
  }, callback)
}

// block {string|integer}
Block.prototype.getTransactions = function(block, options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  self.request({
    method: 'GET',
    resource: 'transactions',
    uri: ['blocks', block, 'transactions'],
    options: options
  }, callback)
}

Block.prototype.latest = function(options, callback) {
  var self = this;
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }

  self.request({
    method: 'GET',
    resource: 'blocks',
    uri: ['blocks', 'latest'],
    options: options
  }, callback)
}
