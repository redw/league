/**
 * 数组工具
 * @author hh
 * 2016/5/26
 */
var ArrayUtil;
(function (ArrayUtil) {
    function remove(array, item, global) {
        var index;
        if (global == null) {
            global = false;
        }
        if (global) {
            while (true) {
                index = array.indexOf(item);
                if (index >= 0) {
                    array.splice(array.indexOf(item), 1);
                }
                else {
                    break;
                }
            }
        }
        else {
            index = array.indexOf(item);
            if (index >= 0) {
                array.splice(array.indexOf(item), 1);
            }
        }
        return index >= 0;
    }
    ArrayUtil.remove = remove;
    /**
     * 随机数组中的唯一值
     * @param array
     * @returns {any}
     */
    function randomUniqueValue(array) {
        var keys = Object.keys(array);
        var index = Math.floor(Math.random() * keys.length);
        var key = keys[index];
        var result = array[key];
        array.splice(index, 1);
        return result;
    }
    ArrayUtil.randomUniqueValue = randomUniqueValue;
    /**
     * 从随机值中,获取数组
     * @param from
     * @param to
     * @param count
     * @returns {Array}
     */
    function getRandomArr(from, to, count) {
        var result = [];
        var c = Math.min(count, to - from + 1);
        c = Math.max(0, c);
        do {
            var value = from + Math.floor(Math.random() * (to - from + 1));
            if (result.indexOf(value) < 0) {
                result.push(value);
            }
        } while (result.length < c);
        return result;
    }
    ArrayUtil.getRandomArr = getRandomArr;
    function createArr(len, value) {
        var arr = Array(len);
        for (var i = 0; i < len; i++) {
            arr[i] = value;
        }
        return arr;
    }
    ArrayUtil.createArr = createArr;
})(ArrayUtil || (ArrayUtil = {}));
//# sourceMappingURL=ArrayUtil.js.map