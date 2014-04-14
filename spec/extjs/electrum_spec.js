// electrum_spec.js
describe("Electrum", function() {

  describe('electrum_get_pubkey', function() {
    it("calculates the correct pubKey", function() {
      privKeyHex = '13c6c846b741d53c44d54d701bba50d9f5d616be3535a107435c3b3e3df2f3f9';
      privKey = Bitcoin.convert.hexToBytes(privKeyHex);

      pubkey = electrum_get_pubkey(privKey)

      pubkeyString = Bitcoin.convert.bytesToHex( pubkey );
      expect(pubkeyString).toEqual('04bd817f173994dbcaa958427d46c5ed5a038254d1bb0e225cdc9f00747cd6ba7f694d99e799b3839c69995777a5d2443d56c092cc8b8af0ac4c263102e4036889');
    });
  });

  describe('electrum_extend_chain', function() {
    var privKey, pubKey, n, forChange, fromPrivKey;

    beforeEach(function() {
      privKey = [19, 198, 200, 70, 183, 65, 213, 60, 68, 213, 77, 112, 27, 186, 80, 217, 245, 214, 22, 190, 53, 53, 161, 7, 67, 92, 59, 62, 61, 242, 243, 249]
      pubKey = [4, 189, 129, 127, 23, 57, 148, 219, 202, 169, 88, 66, 125, 70, 197, 237, 90, 3, 130, 84, 209, 187, 14, 34, 92, 220, 159, 0, 116, 124, 214, 186, 127, 105, 77, 153, 231, 153, 179, 131, 156, 105, 153, 87, 119, 165, 210, 68, 61, 86, 192, 146, 204, 139, 138, 240, 172, 76, 38, 49, 2, 228, 3, 104, 137]
      forChange = false;
      fromPrivKey = true;
    });

    it("calculates address and other params for n=0", function() {
      n = 0;
      r = electrum_extend_chain(pubKey, privKey, n, forChange, fromPrivKey);
      expect(r[0]).toEqual("1GM6wTd9H1Zishsn3WyB1UyomPC3HNuXdf");
      expect(r[1]).toEqual("5JCUtAGKs92HFhDtB7TQpDpGgEJgsPkwP9FUyysXGHFCrttdRam");
      expect(r[2]).toEqual([ 4, 253, 213, 214, 89, 230, 240, 115, 113, 156, 200, 188, 220, 236, 17, 192, 107, 95, 7, 117, 151, 130, 112, 33, 8, 196, 137, 8, 30, 72, 102, 99, 123, 196, 249, 216, 10, 198, 20, 67, 155, 86, 223, 202, 72, 3, 240, 227, 185, 28, 67, 134, 165, 10, 106, 223, 255, 174, 96, 203, 18, 33, 152, 242, 49 ]);
      expect(r[3]).toEqual([ 50, 101, 104, 112, 241, 42, 165, 216, 194, 252, 157, 112, 35, 49, 221, 125, 162, 169, 6, 190, 7, 36, 19, 183, 53, 165, 99, 139, 98, 93, 98, 1 ]);
      console.log( r )
    });

    it("calculates address and other params for n=1", function() {
      n = 1;
      r = electrum_extend_chain(pubKey, privKey, n, forChange, fromPrivKey);
      expect(r[0]).toEqual("1MDB7YF8GM7p2THTHv4RkYtJp1bb6gAKZa");
      expect(r[1]).toEqual("5KDznTwBKbqQ1Mdx1nCbV4xDyXywwhYLZX5rqYTRb7SdmVy2cDZ");
      expect(r[2]).toEqual([ 4, 234, 33, 148, 179, 139, 204, 88, 238, 162, 192, 171, 9, 82, 254, 28, 187, 211, 252, 237, 232, 202, 22, 184, 206, 118, 7, 35, 223, 126, 4, 244, 121, 33, 140, 35, 70, 154, 73, 183, 175, 77, 2, 30, 70, 236, 221, 93, 71, 148, 140, 175, 251, 193, 172, 87, 16, 207, 169, 152, 240, 98, 144, 118, 58 ]);
      expect(r[3]).toEqual([ 185, 136, 144, 182, 134, 88, 63, 82, 71, 163, 50, 221, 54, 82, 5, 191, 164, 2, 136, 0, 137, 252, 79, 179, 250, 144, 12, 21, 197, 193, 107, 154 ]);
      console.log( r )
    });

    it("calculates address and other params for n=2", function() {
      n = 2;
      r = electrum_extend_chain(pubKey, privKey, n, forChange, fromPrivKey);
      expect(r[0]).toEqual("1KUjS2hmXCNtnP1qH8WL2JvkgD9q79uWuq");
      expect(r[1]).toEqual("5Jn9ZVTCH9dpdTYKQxFe2t8DegXcp4vNErZLiArcPZVGr4aByLY");
      expect(r[2]).toEqual([ 4, 251, 170, 37, 38, 150, 97, 151, 152, 62, 97, 240, 190, 179, 49, 241, 2, 38, 123, 190, 111, 245, 61, 161, 165, 94, 124, 16, 140, 62, 221, 153, 103, 122, 56, 152, 12, 220, 43, 77, 125, 136, 47, 207, 224, 25, 96, 66, 245, 44, 83, 162, 140, 144, 141, 213, 218, 217, 159, 49, 176, 243, 121, 129, 126 ]);
      expect(r[3]).toEqual([ 126, 215, 66, 126, 233, 51, 162, 235, 158, 188, 68, 85, 241, 158, 190, 86, 132, 155, 156, 97, 190, 54, 101, 186, 175, 201, 34, 154, 155, 25, 71, 251 ]);
      console.log( r )
    });

  });
});