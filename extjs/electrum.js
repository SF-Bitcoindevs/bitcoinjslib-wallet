/*
    electrum.js : Electrum deterministic wallet implementation (public domain)
*/

function electrum_extend_chain(pubKey, privKey, n, forChange, fromPrivKey) {
    var curve = Bitcoin.getSECCurveByName("secp256k1");
    var mode = forChange ? 1 : 0;
    var mpk = pubKey.slice(1);
    var bytes = Bitcoin.convert.stringToBytes(n + ':' + mode + ':').concat(mpk);
    var firsthash =  Bitcoin.Crypto.SHA256(Bitcoin.convert.bytesToWordArray(bytes), {asBytes: true});
    var sequence = Bitcoin.convert.wordArrayToBytes(Bitcoin.Crypto.SHA256(firsthash, {asBytes: true}))
    var secexp = null;
    var pt = Bitcoin.ECPointFp.decodeFrom(curve.getCurve(), pubKey);

    if (fromPrivKey) {
        var A = Bitcoin.BigInteger.fromByteArrayUnsigned(sequence);
        var B = Bitcoin.BigInteger.fromByteArrayUnsigned(privKey);
        var C = curve.getN();
        secexp = A.add(B).mod(C);
        pt = pt.add(curve.getG().multiply(A));
    } else {
        var A = Bitcoin.BigInteger.fromByteArrayUnsigned(sequence);
        pt = pt.add(curve.getG().multiply(A));
    }

    var newPriv = secexp ? secexp.toByteArrayUnsigned(): [];
    for(;newPriv.length<32;) newPriv.unshift(0x00);
    var newPub = pt.getEncoded();
    // var h160 = Bitcoin.Util.sha256ripe160(newPub);
    var s256 =  Bitcoin.Crypto.SHA256( Bitcoin.convert.bytesToWordArray( newPub ) );
    var h160 = Bitcoin.Crypto.RIPEMD160( s256 );
    var addr = new Bitcoin.Address(h160.toString());
    var sec = secexp ? new Bitcoin.Address(newPriv) : '';
    if (secexp)
        sec.version = 128;

    return [addr.toString(), sec.toString(), newPub, newPriv];
}

function electrum_get_pubkey(privKey) {
    var curve = Bitcoin.getSECCurveByName("secp256k1");
    var secexp = Bitcoin.BigInteger.fromByteArrayUnsigned(privKey);
    var pt = curve.getG().multiply(secexp);
    var pubKey = pt.getEncoded();
    return pubKey;
}

var Electrum = new function () {
    var seedRounds = 100000;
    var seed;
    var oldseed;
    var pubKey;
    var privKey;
    var rounds;
    var range;
    var counter;
    var timeout;
    var onUpdate;
    var onSuccess;
    var addChange;

    function calcSeed() {
        if (rounds < seedRounds) {
            var portion = seedRounds / 100;
            onUpdate(rounds * 100 / seedRounds, seed);
            for (var i = 0; i < portion; i++)
                seed = Bitcoin.convert.wordArrayToBytes( Bitcoin.Crypto.SHA256(Bitcoin.convert.bytesToWordArray(seed.concat(oldseed)), {asBytes:true}) );
            rounds += portion;
            if (rounds < seedRounds) {
                timeout = setTimeout(calcSeed, 0);
            } else {
                privKey = seed;
                pubKey = electrum_get_pubkey(privKey);
                onSuccess(privKey);
            }
        }
    }

    function calcAddr() {
        var change = (counter == range);
        var r = electrum_extend_chain(pubKey, privKey, change ? 0 : counter, change, true);
        onUpdate(r);
        counter++;
        if (counter < range || (addChange && counter <= range)) {
            timeout = setTimeout(calcAddr, 0);
        } else {
            if (onSuccess) 
                onSuccess();
        }
    }

    this.init = function(_seed, update, success) {
        seed = Bitcoin.convert.stringToBytes(_seed);
        oldseed = seed.slice(0);
        rounds = 0;
        onUpdate = update;
        onSuccess = success;
        clearTimeout(timeout);
        calcSeed();
    };

    this.gen = function(_range, update, success, useChange) {
        addChange = useChange;
        range = _range;
        counter = 0;
        onUpdate = update;
        onSuccess = success;
        clearTimeout(timeout);
        calcAddr();
    };

    this.stop = function() {
        clearTimeout(timeout);
    }

    return this;
};

function electrum_test() {

    Electrum.init('12345678', function(r) {console.log(r);},
        function(privKey) {Electrum.gen(5, function(r) {console.log(r);});});

    /*
    1DLHQhEuLftmAMTiYhw4DvVWhFQ9hnbXio
    1HvoaBYqebPqFaS7GEZzywTaiTrS8cSaCF
    1KMtsVJdde66kjgaK5dcte3TiWfFBF2bC7
    159zjjZB3TadPXE3oeei5MfxTCYu5bqDCd
    1H4uQ5i3MWSiUdHLJiPop9HWw2fe96CrLR
    1EkX2PAY21FuqsKVirZS6wkLkSwbbE4EFD
    */
}
