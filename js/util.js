// util.js

// Bitcoin utility functions
Bitcoin.Util = {
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
  }
};