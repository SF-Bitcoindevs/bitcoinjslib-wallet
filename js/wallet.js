var WALLET = new function ()
{
  this.keys = [];
  this.withdrawals = 3;

  // Methods
  this.textToBytes = function(text) {
    return Bitcoin.Crypto.SHA256(text, { asBytes: true });
  };

  this.getKeys = function() {
    return this.keys;
  };

  this.getBalance = function() {
    balance = 0;
    for(i = 0; i < this.getKeys().length; i++) {
      _b = parseFloat($('#balance' + i).text());
      if (!isNaN(_b)) {
        balance = balance + _b;
      }
    }
    return balance;
  }

  this.isReady = function() {
    return this.keys.length != 0;
  }

  this.faucetWithdrawal = function(callback) {
    if (USE_TESTNET) {
      if (this.withdrawals <= 0) {
        return;
      }
      this.withdrawals -= 1;
      var delayedUpdate = function() {
        if (callback) callback();
      }
      var address = this.getKeys()[0].getAddress(NETWORK_VERSION).toString();
      helloblock.faucet.withdrawal(address, 30000, function(result) {
        if (callback) callback(result)
      })
    }
  }

  this.updateAllBalances = function() {
    var addresses = [];
    for(i = 0; i < this.getKeys().length; i++)
    {
      addresses[i] = this.getKeys()[i].getAddress(NETWORK_VERSION).toString();
    }
    helloblock.addresses.batchGet(addresses, function(addresses) {
      for(i = 0; i < addresses.length; i++) {
        var addr = addresses[i];
        var bal = addr.balance / 100000000.0;
        $('#balance' + i).text(bal);
      }
    });
  };
}
