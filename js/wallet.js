var WALLET = new function ()
{
  this.keys = [];
  this.withdrawls = 0;

  // Methods
  this.textToBytes = function(text) {
    return Bitcoin.Crypto.SHA256(text, { asBytes: true });
  };

  this.getKeys = function() {
    return this.keys;
  };

  this.getBalance = function() {
    balance = 0
        for(i = 0; i < 10; i++) {
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

  this.faucetWithdrawl = function() {
    if (USE_TESTNET) {
      this.withdrawls += 1;
      if (this.withdrawls > 3) {
        return;
      }
      var delayedUpdate = function() {
        WALLET.updateAllBalances();
      }
      var address = this.getKeys()[0].getAddress(NETWORK_VERSION).toString();
      var hb = new HBlock({"network": "testnet"});
      hb.faucet.withdraw(address, 30000, {}, function(error, xyz) {
        setTimeout( delayedUpdate, 1000 );
      });


    }
  }

  this.updateAllBalances = function() {
    var addresses = [];
    for(i = 0; i < this.getKeys().length; i++)
    {
      addresses[i] = this.getKeys()[i].getAddress(NETWORK_VERSION).toString();
    }

    helloblock.retrieveAllBalances(addresses, function(addresses) {
      for(i = 0; i < addresses.length; i++) {
        var addr = addresses[i];
        var bal = addr.balance / 100000000.0;
        $('#balance' + i).text(bal);
      }
    });
  };
}
