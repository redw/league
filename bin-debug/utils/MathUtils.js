/**
 * 数学工具
 * @author j
 *
 */
var MathUtil;
(function (MathUtil) {
    var _hasInit = false;
    var _unitValue = [];
    MathUtil.unitKey = ["K", "M", "B", "t", "q", "Q", "s", "S", "o", "n", "d", "U", "D", "T", "Qt", "Qd", "Sd", "St", "O", "N", "v", "c"];
    MathUtil.lowercaseLetter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    MathUtil.capitalLetter = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    init();
    function init() {
        if (_hasInit == false) {
            _hasInit = true;
            var tempKey = MathUtil.unitKey.concat();
            for (var _i = 0, tempKey_1 = tempKey; _i < tempKey_1.length; _i++) {
                var unit = tempKey_1[_i];
                for (var _a = 0, lowercaseLetter_1 = MathUtil.lowercaseLetter; _a < lowercaseLetter_1.length; _a++) {
                    var letter = lowercaseLetter_1[_a];
                    MathUtil.unitKey.push(unit + letter);
                }
            }
            for (var _b = 0, tempKey_2 = tempKey; _b < tempKey_2.length; _b++) {
                var unit = tempKey_2[_b];
                for (var _c = 0, capitalLetter_1 = MathUtil.capitalLetter; _c < capitalLetter_1.length; _c++) {
                    var letter = capitalLetter_1[_c];
                    MathUtil.unitKey.push(unit + letter);
                }
            }
            for (var i = 0; i < MathUtil.unitKey.length; i++) {
                _unitValue.push((i + 1) * 3);
            }
        }
    }
    /**
     * 两点之间的距离
     * @param pos1
     * @param pos2
     * @returns {number}
     */
    function pointDistance(pos1, pos2) {
        return Math.sqrt((pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y));
    }
    MathUtil.pointDistance = pointDistance;
    /**
     * 数值上下限制
     * @param value
     * @param min
     * @param max
     * @returns {number}
     */
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    MathUtil.clamp = clamp;
    /**
     * 区间随机数
     * @param min
     * @param max
     * @returns {number}
     */
    function rangeRandom(min, max) {
        return MathUtil.clamp(Math.floor(Math.random() * (max - min + 1) + min), min, max);
    }
    MathUtil.rangeRandom = rangeRandom;
    function easyNumber(value) {
        var num = new BigNum(value);
        if (num.e < 3) {
            var n = num.n * Math.pow(10, num.e);
            if (num.e == 0) {
                return Math.round(n).toString();
            }
            else if (num.e == 1) {
                return Math.round(n).toString();
            }
            else {
                return Math.round(n).toString();
            }
        }
        for (var i = 0; i < MathUtil.unitKey.length; i++) {
            var diff = num.e - _unitValue[i];
            if (diff < 3) {
                var n = num.n * Math.pow(10, diff);
                if (diff == 0) {
                    return parseFloat(n.toFixed(2)) + MathUtil.unitKey[i];
                }
                else if (diff == 1) {
                    return parseFloat(n.toFixed(1)) + MathUtil.unitKey[i];
                }
                else {
                    return parseFloat(n.toFixed(0)) + MathUtil.unitKey[i];
                }
            }
        }
        return num + MathUtil.unitKey[MathUtil.unitKey.length - 1];
    }
    MathUtil.easyNumber = easyNumber;
})(MathUtil || (MathUtil = {}));
//# sourceMappingURL=MathUtils.js.map