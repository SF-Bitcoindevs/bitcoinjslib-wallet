/*
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
        return eckey.getAddress(NETWORK_VERSION).toString();
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
                var txin = new Bitcoin.TransactionIn({outpoint: {hash: hash, index: index}, script: script, sequence:[255,255,255,255]});
                selectedOuts.push(txin);
                sendTx.addInput(txin);
            }
        }

        for (var i in outputs) {
            var address = outputs[i].address;
            var fval = outputs[i].value;
            var value = new Bitcoin.BigInteger('' + Math.round(fval * 1e8), 10);
            sendTx.addOutput(address, value);
        }

        var hashType = 1;
        for (var i = 0; i < sendTx.ins.length; i++) {
            var connectedScript = selectedOuts[i].script;
            var hash = sendTx.hashTransactionForSignature(connectedScript, i, hashType);
            var pubKeyHash = connectedScript.toScriptHash();
            var signature = eckey.sign(hash);
            signature.push(parseInt(hashType, 10));
            var pubKey = eckey.getPub().toBytes();
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
        r['hash'] = Bitcoin.convert.bytesToHex( Bitcoin.convert.wordArrayToBytes( hash ).reverse() );
        r['ver'] = sendTx.version;
        r['vin_sz'] = sendTx.ins.length;
        r['vout_sz'] = sendTx.outs.length;
        r['lock_time'] = sendTx.lock_time;
        r['size'] = buf.length;
        r['in'] = []
        r['out'] = []

        for (var i = 0; i < sendTx.ins.length; i++) {
            var txin = sendTx.ins[i];
            var hash = Bitcoin.convert.hexToBytes(txin.outpoint.hash);
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
            var fval = txout.value / 100000000.0;
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
        var op = Bitcoin.Opcode.reverseMap[chunk];
        typeof chunk == 'number' ?  out.push(op) :
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

