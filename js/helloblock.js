// Here we hold all the interactions with the blockchain.
var helloblock = new function () {

  this.retrieveAllBalances = function(addresses, callback) {
    var url = HELLOBLOCK_URL + '/v1/addresses?';

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
      var url = HELLOBLOCK_URL + '/v1/addresses/' + address + '/unspents?limit=10';
      $.ajax({
        url: url,
        success: function(res) {
            callback(res.data.unspents);
        },
        error:function (xhr, opt, err) {
            if (onError)
                onError(err);
        }}
      )
  }

  this.sendTX = function(tx, callback) {
      var url = HELLOBLOCK_URL + '/v1/transactions'
      $.ajax({
        type: 'post',
        url: url,
        data: {rawTxHex: tx},
        success: function(res) {
          var msg = 'Transaction complete!\n';
          console.log( msg, res );
          if (callback) {
            var detail =  'txHash: ' + res.data.transaction.txHash;
            callback( msg + detail );
          }
        }, 
        error: function(xhr, opt, err) {
          alert("Failed! ", err )
        }
      });
  }
}
