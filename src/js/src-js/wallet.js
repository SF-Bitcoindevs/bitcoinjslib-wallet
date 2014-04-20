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
    balance = 0;
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

    for(i = 0; i < this.getKeys().length; i++)
    {
      addresses[i] = this.getKeys()[i].getAddress().toString();
    }

    helloblock.retrieveAllBalances(addresses, function(addresses) {
		for(i = 0; i < addresses.length; i++) {
            var addr = addresses[i];
			var bal = addr.balance;
            $('#balance' + i).text(bal);
		}
    });
  };

}
