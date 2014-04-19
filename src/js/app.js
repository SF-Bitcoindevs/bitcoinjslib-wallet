// util.js
// BigInteger monkey patching
// BigInteger.valueOf = nbv;

// /**
//  * Returns a byte array representation of the big integer.
//  *
//  * This returns the absolute of the contained value in big endian
//  * form. A value of zero results in an empty array.
//  */
// BigInteger.prototype.toByteArrayUnsigned = function () {
//   var ba = this.abs().toByteArray();
//   if (ba.length) {
//     if (ba[0] == 0) {
//       ba = ba.slice(1);
//     }
//     return ba.map(function (v) {
//       return (v < 0) ? v + 256 : v;
//     });
//   } else {
//     // Empty array, nothing to do
//     return ba;
//   }
// };

// /**
//  * Turns a byte array into a big integer.
//  *
//  * This function will interpret a byte array as a big integer in big
//  * endian notation and ignore leading zeros.
//  */
// BigInteger.fromByteArrayUnsigned = function (ba) {
//   if (!ba.length) {
//     return ba.valueOf(0);
//   } else if (ba[0] & 0x80) {
//     // Prepend a zero so the BigInteger class doesn't mistake this
//     // for a negative integer.
//     return new BigInteger([0].concat(ba));
//   } else {
//     return new BigInteger(ba);
//   }
// };

// *
//  * Converts big integer to signed byte representation.
//  *
//  * The format for this value uses a the most significant bit as a sign
//  * bit. If the most significant bit is already occupied by the
//  * absolute value, an extra byte is prepended and the sign bit is set
//  * there.
//  *
//  * Examples:
//  *
//  *      0 =>     0x00
//  *      1 =>     0x01
//  *     -1 =>     0x81
//  *    127 =>     0x7f
//  *   -127 =>     0xff
//  *    128 =>   0x0080
//  *   -128 =>   0x8080
//  *    255 =>   0x00ff
//  *   -255 =>   0x80ff
//  *  16300 =>   0x3fac
//  * -16300 =>   0xbfac
//  *  62300 => 0x00f35c
//  * -62300 => 0x80f35c
 
// BigInteger.prototype.toByteArraySigned = function () {
//   var val = this.abs().toByteArrayUnsigned();
//   var neg = this.compareTo(BigInteger.ZERO) < 0;

//   if (neg) {
//     if (val[0] & 0x80) {
//       val.unshift(0x80);
//     } else {
//       val[0] |= 0x80;
//     }
//   } else {
//     if (val[0] & 0x80) {
//       val.unshift(0x00);
//     }
//   }

//   return val;
// };

// /**
//  * Parse a signed big integer byte representation.
//  *
//  * For details on the format please see BigInteger.toByteArraySigned.
//  */
// BigInteger.fromByteArraySigned = function (ba) {
//   // Check for negative value
//   if (ba[0] & 0x80) {
//     // Remove sign bit
//     ba[0] &= 0x7f;

//     return BigInteger.fromByteArrayUnsigned(ba).negate();
//   } else {
//     return BigInteger.fromByteArrayUnsigned(ba);
//   }
// };

// // Console ignore
// var names = ["log", "debug", "info", "warn", "error", "assert", "dir",
//              "dirxml", "group", "groupEnd", "time", "timeEnd", "count",
//              "trace", "profile", "profileEnd"];

// if ("undefined" == typeof window.console) window.console = {};
// for (var i = 0; i < names.length; ++i)
//   if ("undefined" == typeof window.console[names[i]])
//     window.console[names[i]] = function() {};

// Bitcoin utility functions
Bitcoin.Util = {
  /**
   * Cross-browser compatibility version of Array.isArray.
   */
  isArray: Array.isArray || function(o)
  {
    return Object.prototype.toString.call(o) === '[object Array]';
  },

  /**
   * Create an array of a certain length filled with a specific value.
   */
  makeFilledArray: function (len, val)
  {
    var array = [];
    var i = 0;
    while (i < len) {
      array[i++] = val;
    }
    return array;
  },

  /**
   * Turn an integer into a "var_int".
   *
   * "var_int" is a variable length integer used by Bitcoin's binary format.
   *
   * Returns a byte array.
   */
  numToVarInt: function (i)
  {
    if (i < 0xfd) {
      // unsigned char
      return [i];
    } else if (i <= 1<<16) {
      // unsigned short (LE)
      return [0xfd, i >>> 8, i & 255];
    } else if (i <= 1<<32) {
      // unsigned int (LE)
      return [0xfe].concat(Crypto.util.wordsToBytes([i]));
    } else {
      // unsigned long long (LE)
      return [0xff].concat(Crypto.util.wordsToBytes([i >>> 32, i]));
    }
  },

  /**
   * Parse a Bitcoin value byte array, returning a BigInteger.
   */
  valueToBigInt: function (valueBuffer)
  {
    if (valueBuffer instanceof Bitcoin.BigInteger) return valueBuffer;

    // Prepend zero byte to prevent interpretation as negative integer
    return Bitcoin.BigInteger.fromByteArrayUnsigned(valueBuffer);
  },

  /**
   * Format a Bitcoin value as a string.
   *
   * Takes a Bitcoin.BigInteger or byte-array and returns that amount of Bitcoins in a
   * nice standard formatting.
   *
   * Examples:
   * 12.3555
   * 0.1234
   * 900.99998888
   * 34.00
   */
  formatValue: function (valueBuffer) {
    var value = this.valueToBigInt(valueBuffer).toString();
    var integerPart = value.length > 8 ? value.substr(0, value.length-8) : '0';
    var decimalPart = value.length > 8 ? value.substr(value.length-8) : value;
    while (decimalPart.length < 8) decimalPart = "0"+decimalPart;
    decimalPart = decimalPart.replace(/0*$/, '');
    while (decimalPart.length < 2) decimalPart += "0";
    return integerPart+"."+decimalPart;
  },

  /**
   * Parse a floating point string as a Bitcoin value.
   *
   * Keep in mind that parsing user input is messy. You should always display
   * the parsed value back to the user to make sure we understood his input
   * correctly.
   */
  parseValue: function (valueString) {
    // TODO: Detect other number formats (e.g. comma as decimal separator)
    var valueComp = valueString.split('.');
    var integralPart = valueComp[0];
    var fractionalPart = valueComp[1] || "0";
    while (fractionalPart.length < 8) fractionalPart += "0";
    fractionalPart = fractionalPart.replace(/^0+/g, '');
    var value = Bitcoin.BigInteger.valueOf(parseInt(integralPart));
    value = value.multiply(Bitcoin.BigInteger.valueOf(100000000));
    value = value.add(Bitcoin.BigInteger.valueOf(parseInt(fractionalPart)));
    return value;
  },

  /**
   * Calculate RIPEMD160(SHA256(data)).
   *
   * Takes an arbitrary byte array as inputs and returns the hash as a byte
   * array.
   */
  sha256ripe160: function (data) {
    return Crypto.RIPEMD160(Crypto.SHA256(data, {asBytes: true}), {asBytes: true});
  }
};

// for (var i in Crypto.util) {
//   if (Crypto.util.hasOwnProperty(i)) {
//     Bitcoin.Util[i] = Crypto.util[i];
//   }
// }
;/*
    tx.js - Bitcoin transactions for JavaScript (public domain)

    Obtaining inputs:
    1) http://blockchain.info/unspent?address=<address>
    2) http://blockexplorer.com/q/mytransactions/<address>

    Sending transactions:
    1) http://bitsend.rowit.co.uk
    2) http://www.blockchain.info/pushtx
*/

var TX = new function () {

    var inputs = [];
    var outputs = [];
    var eckey = null;
    var balance = 0;

    this.init = function(_eckey) {
        outputs = [];
        eckey = _eckey;
    }

    this.addOutput = function(addr, fval) {
        outputs.push({address: addr, value: fval});
    }

    this.getOutputs = function() {
        return outputs;
    }

    this.getBalance = function() {
        return balance;
    }

    this.getSendBalance = function() {
      value = 0.0
      for (var i in outputs) {
          if(outputs[i].address == this.getAddress())
            continue;

          var fval = outputs[i].value;
          value += fval;
      }
      value += 0.0001;
      return value.toFixed(4);
    }

    this.getChange = function() {
      value = 0.0
      for (var i in outputs) {
          if(outputs[i].address != this.getAddress())
            continue;

          var fval = outputs[i].value;
          value += fval;
      }
      return value.toFixed(6);
    }

    this.getAddress = function() {
        return eckey.getAddress().toString();
    }

    this.parseInputs = function(text, address) {
        try {
            var res = txParseHelloBlockUnspents(text, address);
        } catch(err) {
            var res = { "balance":"0" };
        }

        balance = res.balance;
        inputs = res.unspenttxs;
    }

    this.construct = function() {
        var sendTx = new Bitcoin.Transaction();
        var selectedOuts = [];
        for (var hash in inputs) {
            if (!inputs.hasOwnProperty(hash))
                continue;
            for (var index in inputs[hash]) {
                if (!inputs[hash].hasOwnProperty(index))
                    continue;
                var script = parseScript(inputs[hash][index].script);
                var b64hash = Bitcoin.convert.bytesToBase64(Bitcoin.convert.hexToBytes(hash));
                var txin = new Bitcoin.TransactionIn({outpoint: {hash: b64hash, index: index}, script: script, sequence: 4294967295});
                selectedOuts.push(txin);
                sendTx.addInput(txin);
            }
        }

        for (var i in outputs) {
            var address = outputs[i].address;
            var fval = outputs[i].value;
            var value = new Bitcoin.BigInteger('' + Math.round(fval * 1e8), 10);
            sendTx.addOutput(new Bitcoin.Address(address), value);
        }

        var hashType = 1;
        for (var i = 0; i < sendTx.ins.length; i++) {
            var connectedScript = selectedOuts[i].script;
            var hash = sendTx.hashTransactionForSignature(connectedScript, i, hashType);
            var pubKeyHash = connectedScript.simpleOutPubKeyHash();
            var signature = eckey.sign(hash);
            signature.push(parseInt(hashType, 10));
            var pubKey = eckey.getPub();
            var script = new Bitcoin.Script();
            script.writeBytes(signature);
            script.writeBytes(pubKey);
            sendTx.ins[i].script = script;
        }
        return sendTx;
    };

    this.toBBE = function(sendTx) {
        //serialize to Bitcoin Block Explorer format
        var buf = sendTx.serialize();
        var hash = Bitcoin.Crypto.SHA256(Bitcoin.Crypto.SHA256(Bitcoin.convert.bytesToWordArray(buf), {asBytes: true}), {asBytes: true});

        var r = {};
        r['hash'] = Bitcoin.convert.bytesToHex(hash.reverse());
        r['ver'] = sendTx.version;
        r['vin_sz'] = sendTx.ins.length;
        r['vout_sz'] = sendTx.outs.length;
        r['lock_time'] = sendTx.lock_time;
        r['size'] = buf.length;
        r['in'] = []
        r['out'] = []

        for (var i = 0; i < sendTx.ins.length; i++) {
            var txin = sendTx.ins[i];
            var hash = Bitcoin.convert.base64ToBytes(txin.outpoint.hash);
            var n = txin.outpoint.index;
            var prev_out = {'hash': Bitcoin.convert.bytesToHex(hash.reverse()), 'n': n};

            if (n == 4294967295) {
                var cb = Bitcoin.convert.bytesToHex(txin.script.buffer);
                r['in'].push({'prev_out': prev_out, 'coinbase' : cb});
            } else {
                var ss = dumpScript(txin.script);
                r['in'].push({'prev_out': prev_out, 'scriptSig' : ss});
            }
        }

        for (var i = 0; i < sendTx.outs.length; i++) {
            var txout = sendTx.outs[i];
            var bytes = txout.value.slice(0);
            var fval = parseFloat(Bitcoin.Util.formatValue(bytes.reverse()));
            var value = fval.toFixed(8);
            var spk = dumpScript(txout.script);
            r['out'].push({'value' : value, 'scriptPubKey': spk});
        }

        return JSON.stringify(r, null, 4);
    };


    return this;
};

function dumpScript(script) {
    var out = [];
    for (var i = 0; i < script.chunks.length; i++) {
        var chunk = script.chunks[i];
        var op = new Bitcoin.Opcode(chunk);
        typeof chunk == 'number' ?  out.push(op.toString()) :
            out.push(Bitcoin.convert.bytesToHex(chunk));
    }
    return out.join(' ');
}

// helloblock parser
// https://mainnet.helloblock.io/v1/addresses/<address>/unspents?limit=10
function txParseHelloBlockUnspents(data, address) {
    // var r = JSON.parse(data);
    // var txs = r.unspent_outputs;
    var txs = JSON.parse(data);

    if (!txs)
        throw 'Not a helloblock format';

    delete unspenttxs;
    var unspenttxs = {};
    var balance = Bitcoin.BigInteger.ZERO;

    for (var i in txs) {
        var o = txs[i];
        var lilendHash = o.txHash;

        //convert script back to BBE-compatible text
        var script = dumpScript( new Bitcoin.Script(Bitcoin.convert.hexToBytes(o.scriptPubKey)) );

        var value = new Bitcoin.BigInteger('' + o.value, 10);
        if (!(lilendHash in unspenttxs))
            unspenttxs[lilendHash] = {};
        unspenttxs[lilendHash][o.index] = {amount: value, script: script};
        balance = balance.add(value);
    }
    return {balance:balance, unspenttxs:unspenttxs};
}

function isEmpty(ob) {
    for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
    return true;
}

function endian(string) {
    var out = []
    for(var i = string.length; i > 0; i-=2) {
        out.push(string.substring(i-2,i));
    }
    return out.join("");
}

function btcstr2bignum(btc) {
    var i = btc.indexOf('.');
    var value = new Bitcoin.BigInteger(btc.replace(/\./,''));
    var diff = 9 - (btc.length - i);
    if (i == -1) {
        var mul = "100000000";
    } else if (diff < 0) {
        return value.divide(new Bitcoin.BigInteger(Math.pow(10,-1*diff).toString()));
    } else {
        var mul = Math.pow(10,diff).toString();
    }
    return value.multiply(new Bitcoin.BigInteger(mul));
}

function parseScript(script) {
    var newScript = new Bitcoin.Script();
    var s = script.split(" ");
    for (var i in s) {
        if (Bitcoin.Opcode.map.hasOwnProperty(s[i])){
            newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
        } else {
            newScript.writeBytes(Bitcoin.convert.hexToBytes(s[i]));
        }
    }
    return newScript;
}
// --->8---

;// Here we hold all the interactions with the blockchain.
var helloblock = new function () {

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
      var url = 'https://mainnet.helloblock.io/v1/addresses/' + address + '/unspents?limit=10';
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
      // url = 'http://blockchain.info/pushtx';
      // postdata = 'tx=' + tx;
      // if (url != null && url != "") {
      //     this.tx_fetch(url, callback, callback, postdata);
      // }
      callback()
  }
}
;var WALLET = new function ()
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
    console.log(this.getKeys());

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
;// Global, hmmm.
var timeout;

$(document).ready(function() {

  $('#site').hide();
  $('#tx').hide();
  $('#decrypt-url').hide();
  $('#your-addresses').hide();
  $('#logout-menu').hide();

  // Add instawallet style URLS. Only we use a hash
  // and therefore the URL is not sent to the server.
  // See http://en.wikipedia.org/wiki/Fragment_identifier
  var hash = $(location).attr('href').split('#')[1];
  if(hash != '' && hash != undefined)
  {
    $('#logon').hide();
    $('#decrypt-url').show();
  }

  $('#open-with-password').click(function(){
    var pass = $('#enc-password').val();
    var hash = $(location).attr('href').split('#')[1];

    try {
      GibberishAES.size(128);
      var dec = GibberishAES.dec(hash, pass);
      $('#password').val(mn_encode(dec));
      $('#decrypt-url').hide();
      $('#logon').show();
      checkValidPassword();
    } catch(err) {
      alert(err);
    }
  })

  $('#open-sesame').click(function(){

    var seed = $('#password').val();
    seed = mn_decode(seed);
    Electrum.init(seed, function(r) {
        if(r % 20 == 0)
          $('#seed-progress').css('width', (r + 19) + '%');
      },
      function(privKey) {
        Electrum.gen(10, function(r) {
          WALLET.getKeys().push(new Bitcoin.ECKey(r[1]));
          if(WALLET.getKeys().length == 10)
            login_success();
        });
      }
    );

    return true;
  })


  $('#txDropGetUnspent').click(txDropGetUnspent);
  $('#txDropAddr').change(txOnChangeSource);
  $('#txValue').change(txOnChangeDest);
  $('#txDest').change(txOnChangeDest);
  $('#txDest').keypress(verifySoon);
  $('#txValue').keypress(verifySoon);

  $('#password').keyup(checkValidPassword);

  $('#txAddDest').click(txOnAddDest);
  $('#txRemoveDest').click(txOnRemoveDest);
  $('#txSend').click(txVerify);
  $('#sendPayment').click(txSend);
  $('#generate-password').click(generatePassword);
  $('#regenerate-password').click(regeneratePassword);
  $('#regenerate-password').tooltip();

  $('#your-addresses-nav, #home').click(function(){
    hideAll();
    $('#your-addresses').show();
    $('#your-addresses-nav').parent().addClass('current');
    return false;
  });

  $('#make-payment-nav').click(function(){
    hideAll();
    $('#tx').show();
    $('#make-payment-nav').parent().addClass('current');
    return false;
  });

  $('#your-dashboard-nav').click(function(){
    hideAll();
    $('#dashboard').show();
    $('#your-dashboard-nav').parent().addClass('current');
    return false;
  });

  $('#logout').click(function(){
    $('#password').val('');
    $('#site').hide();
    $('#create-keys').collapse('hide');
    $('#create-WALLET').collapse('hide');
    $('#logout-menu').hide();
    checkValidPassword();
    $('#logon').show();
    return false;
  });

  $('#passphrase').click(function() {
    $('#linkModalText').text($('#password').val());
    $('#linkModal').modal();
    return false;
  });

  $('#gen-link').click(function() {
    var passphrase = $('#password').val();

    // Convert it to hex as it's smaller.
    var dec = mn_decode(passphrase);
    var pass = $('#link-password').val();
    GibberishAES.size(128);
    var key = GibberishAES.enc(dec, pass)
    $('#link-text').text('http://carbonwallet.com/app.html#' + key);
    return false;
  });

  function alertModal(text) {
    $('#alertModalText').text(text || 'Nevermind');
    $('#alertModal').modal();
  }

  function verifySoon() {
    if(timeout)
    {
        clearTimeout(timeout);
        timeout = null;
    }
    timeout = setTimeout(txOnChangeDest, 1000);
  }

  function hideAll()
  {
    $('ul.side-menu li').removeClass('current');
    $('#your-addresses').hide();
    $('#tx').hide();
    $('#dashboard').hide();
  }

  function login_success()
  {
    $('#logon').hide();
    $('#site').show();
    $('#logout-menu').show();

    WALLET.updateAllBalances();
    $("#txDropAddr").find("option").remove();

    for(i = 0; i < WALLET.getKeys().length; i++)
    {
      var addr = WALLET.getKeys()[i].getAddress().toString();
      $('#address' + i).text(addr);
      $("#txDropAddr").append('<option value=' + i + '>' + addr + '</option>');
      var qrcode = makeQRCode(addr);
      $('#qrcode' + i).popover({ title: 'QRCode', html: true, content: qrcode, placement: 'bottom' });
    }

    txOnChangeSource();

    return false;
  }

  function makeQRCode(addr) {
    var qr = qrcode(3, 'M');
    addr = addr.replace(/^[\s\u3000]+|[\s\u3000]+$/g, '');
    qr.addData(addr);
    qr.make();
    return qr.createImgTag(4);
  }

  function checkValidPassword(){
    var password = $('#password').val()
    var valid = true;

    if(password.split(' ').length != 12)
      valid = false;

    //make sure each word is a valid one from elctrum poetry list (mn_words variable)
    password.split(' ').forEach(function (word) {
        if (mn_words.indexOf(word) == -1) {
            valid = false;
        }
    });

    if(valid)
    {
      $('#open-sesame').addClass('btn-primary');
      $('#open-sesame').removeAttr('disabled');
    }
    else
    {
      $('#open-sesame').removeClass('btn-primary');
      $('#open-sesame').attr('disabled', 'disabled');
    }
  }

  // -- WALLET Creation --
  function regeneratePassword() {
    $('#generated').val('');
    return generatePassword();
  }

  function generatePassword() {

    $('#generated').focus();

    if($('#generated').val() != '')
      return true;

    var pk = secureRandom(32, { array: true })
    var seed = Bitcoin.convert.bytesToHex(pk.slice(0,16));
    //nb! electrum doesn't handle trailing zeros very well
    // and we want to stay compatible.
    if (seed.charAt(0) == '0') seed = seed.substr(1);
    var codes = mn_encode(seed);
    $('#generated').val(codes);

    return true;
  }

  // -- transactions --

  function txOnChangeSource() {
    var i = $('#txDropAddr option:selected').prop('index');
    $('#txSec').val(WALLET.getKeys()[i].priv.toRadix(16));
    txDropGetUnspent();
  }

  function txSetUnspent(unspents) {
      txUnspent = JSON.stringify(unspents, null, 4);
      $('#txUnspent').val(txUnspent);
      var address = $('#txAddr').val();
      TX.parseInputs(txUnspent, address);
      var value = TX.getBalance();
      var fval = Bitcoin.Util.formatValue(value);
      //var fee = parseFloat($('#txFee').val());
      $('#txBalance').val(fval);
      //$('#txValue').val(fval - fee);
      //txRebuild();
  }

  function txUpdateUnspent() {
      txParseUnspent($('#txUnspent').val());
  }

  function txParseUnspent(text) {
      if (text == '')
          return;
      var r = JSON.parse(text);
      txSetUnspent(r);
  }

  function txDropGetUnspent() {
      var addr = WALLET.getKeys()[$('#txDropAddr').val()].getAddress().toString();

      $('#txUnspent').val('');
      helloblock.getUnspentOutputs(addr, txSetUnspent);
  }

  function txOnChangeDest() {

    var res = txGetOutputs();
    var valid = true;

    for( i in res)
    {
      if(res[i].dest == '' || res[i].fval == 0)
      {
        valid = false;
        break;
      }
      else
      {
        try {
          parseBase58Check(res[i].dest);
        }
        catch (e) {
          valid = false;
          break;
        }
      }
    }

    if(valid)
      $('#txSend').removeAttr('disabled');
    else
      $('#txSend').attr('disabled','disabled');
  }

  function txOnAddDest() {
      var list = $(document).find('.txCC');
      var clone = list.last().clone();
      clone.find('.help-inline').empty();
      clone.find('.control-label').text('Cc');
      var dest = clone.find('#txDest');
      var value = clone.find('#txValue');
      clone.insertAfter(list.last());
      $(dest).change(txOnChangeDest);
      $(value).change(txOnChangeDest);
      dest.val('');
      value.val('');
      $('#txRemoveDest').attr('disabled', false);
      return false;
  }

  function txOnRemoveDest() {
      var list = $(document).find('.txCC');
      if (list.size() == 2)
          $('#txRemoveDest').attr('disabled', true);
      list.last().remove();
      return false;
  }

  function txSent(text) {
      alertModal(text ? text : 'No response!');

      WALLET.updateAllBalances();
  }

  function txVerify() {
    txRebuild();

    $('#verifySource').text(TX.getAddress());
    $('#verifyAmountTitle').text(TX.getSendBalance());
    $('#verifyTotal').text(TX.getSendBalance());

    $('#verifyTable').find("tr:gt(0)").remove();
    for(i = 0; i < TX.getOutputs().length; i++)
    {
      if(TX.getOutputs()[i].address != TX.getAddress()
        && TX.getOutputs()[i].address != '1carbQXAt6aUcePdFcfS3Z8JNwMCMDb4V')
      {
        $('#verifyTable').append('<tr><td><span class="label label-info">'
          + TX.getOutputs()[i].address
          + '</span></td><td><span><strong>'
          + TX.getOutputs()[i].value
          + '</strong> BTC</span></td></tr>');
      }
    }
    $('#verifyChange').remove();
    $('#tx-toggle').prepend('<p id="verifyChange"><span>'
        + TX.getChange()
        + '</span> BTC will be returned to the sending address as change</p>');

    $('#verifyModal').modal();
  }

  function txSend() {
      var txAddr = $('#txDropAddr option:selected').text();
      var address = TX.getAddress();

      var r = '';
      if (txAddr != address)
          r += 'Warning! Source address does not match private key.\n\n';

      var tx = $('#txHex').val();

      helloblock.sendTX(tx, txSent);
      return true;
  }


  function txRebuild() {
      var sec = $('#txSec').val();
      var addr = $('#txDropAddr option:selected').text();
      var unspent = $('#txUnspent').val();
      var balance = parseFloat($('#txBalance').val());

      var fee = parseFloat('0.0001');

      try {
          var res = parseBase58Check(sec);
          var version = res[0];
          var payload = res[1];
      } catch (err) {
          $('#txJSON').val('');
          $('#txHex').val('');
          return;
      }

      var compressed = false;
      if (payload.length > 32) {
          payload.pop();
          compressed = true;
      }

      var eckey = new Bitcoin.ECKey(payload);

      eckey.setCompressed(compressed);

      TX.init(eckey);

      var fval = 0;
      var o = txGetOutputs();
      for (i in o) {
          TX.addOutput(o[i].dest, o[i].fval);
          fval += o[i].fval;
      }

      // Add on the 0.0004 CarbonWallet fee.
      TX.addOutput('1carbQXAt6aUcePdFcfS3Z8JNwMCMDb4V', parseFloat('0.0004'));
      fval += parseFloat('0.0004');

      // send change back or it will be sent as fee
      if (balance > fval + fee) {
          var change = balance - fval - fee;
          TX.addOutput(addr, change);
      }

      try {
          var sendTx = TX.construct();
          var txJSON = TX.toBBE(sendTx);
          var buf = sendTx.serialize();
          var txHex = Bitcoin.convert.bytesToHex(buf);
          $('#txJSON').val(txJSON);
          $('#txHex').val(txHex);
      } catch(err) {
          $('#txJSON').val('Error ' + err);
          $('#txHex').val('Error ' + err);
      }
  }

  function txGetOutputs() {
      var res = [];
      $.each($(document).find('.txCC'), function() {
          var dest = $(this).find('#txDest').val();
          var fval = parseFloat('0' + $(this).find('#txValue').val());
          res.push( {"dest":dest, "fval":fval } );
      });
      return res;
  }

  function parseBase58Check(address) {
      var bytes = Bitcoin.Base58.decode(address);
      var end = bytes.length - 4;
      var hash = bytes.slice(0, end);
      var checksum = Bitcoin.Crypto.SHA256(Bitcoin.Crypto.SHA256(Bitcoin.convert.bytesToWordArray(hash), {asBytes: true}), {asBytes: true});
      if (checksum[0] != bytes[end] ||
          checksum[1] != bytes[end+1] ||
          checksum[2] != bytes[end+2] ||
          checksum[3] != bytes[end+3])
              throw new Error("Wrong checksum");
      var version = hash.shift();
      return [version, hash];
  }
});
;$(document).ready(function() {
  setInterval(updateDashboard, (10 * 1000));
  setInterval(updateBalances, (600 * 1000));

  function updateDashboard() {

    if (! WALLET.isReady())
      return;

    $.ajax({
        url: "https://blockchain.info/q/24hrprice?cors=true",
        type: "GET",
        context: this,
        error: function () {},
        dataType: 'text',
        success : function (response) {
            $('#btc-price').text('$' + response);

            var balance = WALLET.getBalance();
            $('#btc-balance').text(formatBTC(balance));

            balance = balance * parseFloat(response);
            $('#dollar-balance').text('$' + balance.toFixed(2));
        }
    });

  }

  function updateBalances() {


    if (! WALLET.isReady())
      return;

    WALLET.updateAllBalances();
    $("#txDropAddr").find("option").remove();

    for(i = 0; i < WALLET.getKeys().length; i++)
    {
      var addr = WALLET.getKeys()[i].getAddress().toString();
      $('#address' + i).text(addr);
      $("#txDropAddr").append('<option value=' + i + '>' + addr + '</option>');
    }

  }

  function formatBTC(btc) {
    if(btc < 0.001)
      return btc.toFixed(5);
    return btc.toFixed(3);
  }
});
