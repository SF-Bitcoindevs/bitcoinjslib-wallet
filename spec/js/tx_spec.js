// tx_spec.js
describe("TX", function() {
  var sendTx, txJSON, buf, txHex;

  beforeEach(function() {
    var addr = "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA";
    var balance = 0.0039;
    var fee = 0.0001;
    var privKey = "32656870f12aa5d8c2fc9d702331dd7da2a906be072413b735a5638b625d6201";
    var txUnspent = JSON.stringify([
    {
        confirmations: 394,
        blockHeight: 226346,
        txHash: "157858ce53376ad932db5a51e9651ba623fb13d31fde911ba9f8d2239c661a80",
        index: 0,
        scriptPubKey: "76a914a85729e0303ae68f27726c9054fc4c944ec841c588ac",
        type: "pubkeyhash",
        value: 25000,
        hash160: "a85729e0303ae68f27726c9054fc4c944ec841c5",
        address: "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA"
    },
    {
        confirmations: 395,
        blockHeight: 226345,
        txHash: "ce07dc883356a4c244353ca8372e853eae16b7eb035a74d32170b0b29fe00c64",
        index: 0,
        scriptPubKey: "76a914a85729e0303ae68f27726c9054fc4c944ec841c588ac",
        type: "pubkeyhash",
        value: 65000,
        hash160: "a85729e0303ae68f27726c9054fc4c944ec841c5",
        address: "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA"
    },
    {
        confirmations: 395,
        blockHeight: 226345,
        txHash: "671ce7eb4bcde7023c114eea86c1d0fc3cdb2c9524076beb7061df02e418132f",
        index: 0,
        scriptPubKey: "76a914a85729e0303ae68f27726c9054fc4c944ec841c588ac",
        type: "pubkeyhash",
        value: 25000,
        hash160: "a85729e0303ae68f27726c9054fc4c944ec841c5",
        address: "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA"
    },
    {
        confirmations: 847,
        blockHeight: 225893,
        txHash: "0c37c58031000a7ba3e1e2ec024ecefa601c00c44fdf64a682bf29496554cd26",
        index: 0,
        scriptPubKey: "76a914a85729e0303ae68f27726c9054fc4c944ec841c588ac",
        type: "pubkeyhash",
        value: 10000,
        hash160: "a85729e0303ae68f27726c9054fc4c944ec841c5",
        address: "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA"
    },
    {
        confirmations: 850,
        blockHeight: 225890,
        txHash: "b80c6e210b2b3e7a1a1157d3c858018619d0e59248e0ded430e6f4c9b8cd434d",
        index: 0,
        scriptPubKey: "76a914a85729e0303ae68f27726c9054fc4c944ec841c588ac",
        type: "pubkeyhash",
        value: 6000,
        hash160: "a85729e0303ae68f27726c9054fc4c944ec841c5",
        address: "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA"
    },
    {
        confirmations: 923,
        blockHeight: 225817,
        txHash: "1a6733e3f1072161ee8fbda3b147afcd34345f7a44417ee02e71445dd933c60c",
        index: 1,
        scriptPubKey: "76a914a85729e0303ae68f27726c9054fc4c944ec841c588ac",
        type: "pubkeyhash",
        value: 259000,
        hash160: "a85729e0303ae68f27726c9054fc4c944ec841c5",
        address: "mvs4EWi862zyepMPm5wYqQC8dNnkACz5oA"
    }
]);

      TX.parseInputs(txUnspent, '')
      var eckey = new Bitcoin.ECKey( privKey );
      TX.init(eckey);

      var fval = 0;
      var o = [{ dest: "n1j8QbL75NZ4oZm51V2oaU6dg1CHz2QaLY", fval: 0.001 }];
      for (i in o) {
          TX.addOutput(o[i].dest, o[i].fval);
          fval += o[i].fval;
      }

      // send change back or it will be sent as fee
      if (balance > fval + fee) {
          var change = balance - fval - fee;
          TX.addOutput(addr, change);
      }

    sendTx = TX.construct();
    txJSON = TX.toBBE(sendTx);
    buf = sendTx.serialize();
    txHex = Bitcoin.convert.bytesToHex(buf);
  })

  describe("construct", function() {
    it("constructs a tx from inputs", function() {
      expect(sendTx.defaultSequence).toEqual([ 255, 255, 255, 255 ])
      expect(sendTx.ins.length).toEqual(6);
      expect(sendTx.outs.length).toEqual(2);
      expect(sendTx.version).toEqual(1);
      expect(sendTx.locktime).toEqual(0);
    });
  });

  describe("serialize", function() {
    it("serializes the transaction", function() {
      expect(txHex).toEqual('0100000006801a669c23d2f8a91b91de1fd313fb23a61b65e9515adb32d96a3753ce587815000000008b483045022100995daeb6ed8333af514706e0cd87e68a481bc2c3b27db72cf4c52a5ad23940af02203f9e887c23226f7e55595076febbd0703ac75c6b2c06248667bf275008c73de9014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff640ce09fb2b07021d3745a03ebb716ae3e852e37a83c3544c2a4563388dc07ce000000008b483045022049e904a3de43d3b4466088e2f0a8bd31eeb6c39c8b1bf252d91fddc245d3bb6a022100dcba5f2d2a8acbba7dc09269cb7d1439e0be3fd4908959fd024c184c8f12a35e014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff2f1318e402df6170eb6b0724952cdb3cfcd0c186ea4e113c02e7cd4bebe71c67000000008a4730440220193fa5b475634ecad198c0be14ad0299816ddd9938b7bd4f75df96d02d80c3b402205aeb6dc161f2dba7ae3a70dc27910991508d08bdf491f6a6074128cd0e1082d4014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff26cd54654929bf82a664df4fc4001c60face4e02ece2e1a37b0a003180c5370c000000008a4730440220585a0e5d5914bc78b7a2714fbcd8d66a757cd857355d656d0d8bd6ca77438692022078d33124f7d471c6dd0148b5a04092a570c3d3695396ae5eaee6acde4fd0aa74014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff4d43cdb8c9f4e630d4dee04892e5d019860158c8d357111a7a3e2b0b216e0cb8000000008b483045022100b93743a56e612d1ed6f3a7adfe5dc8eca597a0eb359478835cfc7579ac7011fb0220164dc675e57223ad9ceaeb6d91c9cca5dfbbdd7b8ac5cfdd34f83b980865a9b6014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff0cc633d95d44712ee07e41447a5f3434cdaf47b1a3bd8fee612107f1e333671a010000008b48304502200693e92c6ab8ffdfaaa1cf898e96eca6615db2642d4f083cf6505d1c776394ac0221009330d38dc0b63bfa2abcf95cc1dca0d1699801d07eceeb69be3830e1c27f8b5d014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff02a0860100000000001976a914ddaff2eb5c713ef41dd91d7fa36c4dddcf3aacb188acc0450400000000001976a914a85729e0303ae68f27726c9054fc4c944ec841c588ac00000000');
      expect(txHex).toEqual("0100000006801a669c23d2f8a91b91de1fd313fb23a61b65e9515adb32d96a3753ce587815000000008b483045022100995daeb6ed8333af514706e0cd87e68a481bc2c3b27db72cf4c52a5ad23940af02203f9e887c23226f7e55595076febbd0703ac75c6b2c06248667bf275008c73de9014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff640ce09fb2b07021d3745a03ebb716ae3e852e37a83c3544c2a4563388dc07ce000000008b483045022049e904a3de43d3b4466088e2f0a8bd31eeb6c39c8b1bf252d91fddc245d3bb6a022100dcba5f2d2a8acbba7dc09269cb7d1439e0be3fd4908959fd024c184c8f12a35e014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff2f1318e402df6170eb6b0724952cdb3cfcd0c186ea4e113c02e7cd4bebe71c67000000008a4730440220193fa5b475634ecad198c0be14ad0299816ddd9938b7bd4f75df96d02d80c3b402205aeb6dc161f2dba7ae3a70dc27910991508d08bdf491f6a6074128cd0e1082d4014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff26cd54654929bf82a664df4fc4001c60face4e02ece2e1a37b0a003180c5370c000000008a4730440220585a0e5d5914bc78b7a2714fbcd8d66a757cd857355d656d0d8bd6ca77438692022078d33124f7d471c6dd0148b5a04092a570c3d3695396ae5eaee6acde4fd0aa74014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff4d43cdb8c9f4e630d4dee04892e5d019860158c8d357111a7a3e2b0b216e0cb8000000008b483045022100b93743a56e612d1ed6f3a7adfe5dc8eca597a0eb359478835cfc7579ac7011fb0220164dc675e57223ad9ceaeb6d91c9cca5dfbbdd7b8ac5cfdd34f83b980865a9b6014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff0cc633d95d44712ee07e41447a5f3434cdaf47b1a3bd8fee612107f1e333671a010000008b48304502200693e92c6ab8ffdfaaa1cf898e96eca6615db2642d4f083cf6505d1c776394ac0221009330d38dc0b63bfa2abcf95cc1dca0d1699801d07eceeb69be3830e1c27f8b5d014104fdd5d659e6f073719cc8bcdcec11c06b5f07759782702108c489081e4866637bc4f9d80ac614439b56dfca4803f0e3b91c4386a50a6adfffae60cb122198f231ffffffff02a0860100000000001976a914ddaff2eb5c713ef41dd91d7fa36c4dddcf3aacb188acc0450400000000001976a914a85729e0303ae68f27726c9054fc4c944ec841c588ac00000000");
    });
  });
});