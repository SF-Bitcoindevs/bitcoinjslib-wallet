var Transaction = require('./resources/transactions');
var Address = require('./resources/addresses');
var Block = require('./resources/blocks');
var Faucet = require('./resources/faucet');
var Wallet = require('./resources/wallet');

function createClient(options) {
  var client = {};
  client.options = options;

  client.transactions = new Transaction(options)
  client.addresses = new Address(options)
  client.blocks = new Block(options)
  client.faucet = new Faucet(options)
  client.wallet = new Wallet(options)

  return client;
}

module.exports = createClient;
