var WALLET = new function ()
{
  this.keys = [];

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

  this.updateAllBalances = function() {

    var addresses = [];
    if (USE_TESTNET) {
        var hb = new HBlock({
            "network": "testnet"
        });
    }
    var done = function(err, data) {
        // do nothing
        if (err) {
            console.log("Error: " + JSON.stringify(err));
        } else {
            console.log(data);
        }
        helloblock.retrieveAllBalances(addresses, function(addresses) {
            for(i = 0; i < addresses.length; i++) {
                var addr = addresses[i];
                var bal = addr.balance / 100000000.0;
                $('#balance' + i).text(bal);
            }
        });
    }

    for(i = 0; i < this.getKeys().length; i++)
    {
      addresses[i] = this.getKeys()[i].getAddress(NETWORK_VERSION).toString();
    }
    if (USE_TESTNET) {
        hb.faucet.withdraw(addresses[0], 30000, done);
    }

  };

}
