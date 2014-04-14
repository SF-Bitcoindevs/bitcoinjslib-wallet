// Here we hold all the interactions with the blockchain.
var BLOCKCHAIN = new function () {

  this.retrieveAllBalances = function(addresses, callback) {
    var url = 'https://mainnet.helloblock.io/v1/addresses?';

    var addrs = []
    for(i = 0; i < addresses.length; i++) {
			addrs.push('addresses=' + addresses[i])
		}
    url = url + addrs.join('&')

    $.ajax({
          url: url,
          success: function(res) {
              callback(res.data.addresses)
          },
          error:function (xhr, opt, err) {
              if (onError)
                  onError(err);
          }}
          )
  }

  this.getUnspentOutputs = function(address, callback) {
      var url = 'https://mainnet.helloblock.io/v1/addresses/' + address;
      $.ajax({
        url: url,
        success: function(res) {
            callback(res.data.address.balance.toString());
        },
        error:function (xhr, opt, err) {
            if (onError)
                onError(err);
        }}
      )
  }

  this.sendTX = function(tx, callback) {
      // url = 'http://blockchain.info/pushtx';
      // postdata = 'tx=' + tx;
      // if (url != null && url != "") {
      //     this.tx_fetch(url, callback, callback, postdata);
      // }
      callback()
  }
}
