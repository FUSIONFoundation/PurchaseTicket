export default class Utils {
  // https://stackoverflow.com/questions/10599933/convert-long-number-into-abbreviated-string-in-javascript-with-a-special-shortn
  static displayNumber2(value) {
    var newValue = value;
    if (value >= 1000) {
      let suffixes = ["", "K", "M", "B", "T"];
      let suffixNum = Math.floor(("" + value).length / 3);
      let shortValue = "";
      for (let precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat(
          (suffixNum !== 0
            ? value / Math.pow(1000, suffixNum)
            : value
          ).toPrecision(precision)
        );
        var dotLessShortValue = (shortValue + "").replace(
          /[^a-zA-Z 0-9]+/g,
          ""
        );
        if (dotLessShortValue.length <= 2) {
          break;
        }
      }
      if (shortValue % 1 !== 0) shortValue = shortValue.toFixed(2);
      newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
  }

  static insert(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
  }

  static formatWei( val ) {
    if ( typeof val === 'object') {
      val = val.toString()
    }
    let len = val.length;
    if ( len < 18 ) {
      val = "0".repeat(18-len) + val
      len = 18
    }
    if ( len === 18 ) {
      val = "." + val
    } else {
      val = Utils.insert( val, val.length - 18, "." )
    }

    val = Utils.removeZeros( val, true, true , true )

    if ( val.charAt(0) === '.') {
      return "0" + val;
    }
    if ( val.length === 0 ) {
      return 0
    }
    return val;
  }

  static removeZeros(val, trailing = true, leading = false, decimal = true) {
    var regEx1 = /^[0]+/;
    var regEx2 = /[0]+$/;
    var regEx3 = /[.]$/;

    var before = "";
    var after = "";

    before = val;

    if (leading) {
      after = before.replace(regEx1, ""); // Remove leading 0's
    } else {
        after = before;
    }
    if (trailing) {
      if (after.indexOf(".") > -1) {
        after = after.replace(regEx2, ""); // Remove trailing 0's
      }
    }
    if (decimal) {
      after = after.replace(regEx3, ""); // Remove trailing decimal
    }
    return after;
  }

  static displayNumber(value, precision = 2, trimTrailingZeros = false) {
    var units = " K M G T P E Z Y".split(" ");

    if (value < 0) {
      return "-" + Utils.displayNumber(Math.abs(value));
    }

    if (value < 1) {
      return value + units[0];
    }

    var power = Math.min(
      Math.floor(Math.log(value) / Math.log(1000)),
      units.length - 1
    );

    var val = "" + (value / Math.pow(1000, power)).toFixed(precision);

    if (trimTrailingZeros) {
        val = Utils.removeZeros( val );
    }

    return val + units[power];
  }

  static displayPercent(a) {
    a = a * 100;
    return a.toFixed(2);
  }

  static midHashDisplay(addr) {
    let first = addr.substr(0, 9);
    let end = addr.substr(addr.length - 10, 9);
    return first + "..." + end;
  }

  /**
   * Should be called to get ascii from it's hex representation
   *
   * @method toAscii
   * @param {String} string in hex
   * @returns {String} ascii string representation of hex value
   */
  static toAscii(hex) {
    // Find termination
    var str = "";
    var i = 0,
      l = hex.length;
    if (hex.substring(0, 2) === "0x") {
      i = 2;
    }
    for (; i < l; i += 2) {
      var code = parseInt(hex.substr(i, 2), 16);
      str += String.fromCharCode(code);
    }

    return str;
  }

}
