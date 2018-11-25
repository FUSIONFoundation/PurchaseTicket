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
    let len = val.length;
    if ( len < 19 ) {
      val = "." + val
    } else {
      val = Utils.insert( val, val.length - 18, "." )
    }
    return Utils.removeZeros( val, true, true )
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
}
