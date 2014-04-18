// consts.js
/***********
 * IS_DEV / USE_TESTNET
 ***********/
function qs(key) {
  //http://stackoverflow.com/a/7732379
  key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
  var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
}

//Allow the site root to specify "testnet" parameter
// USE_TESTNET is enabled if ?testnet=1
var USE_TESTNET = qs("testnet") && qs("testnet") != '0';

//CONSTANTS THAT DEPEND ON USE_TESTNET
var HELLOBLOCK_URL = USE_TESTNET ? "https://testnet.helloblock.io" : "https://mainnet.helloblock.io";
var NETWORK_VERSION = USE_TESTNET ? Bitcoin.network.testnet.addressVersion : Bitcoin.network.mainnet.addressVersion;
