/**
 * 长数字
 * @author j
 * 2016/10/9
 */
var BigNum = (function () {
    function BigNum(x) {
        //----------------------------------------//
        this._n = 0;
        this._e = 0;
        if (typeof (x) == "string") {
            x = x.replace(/exp/g, "e");
            var param = x.split("e");
            if (param.length == 1) {
                this._n = Number(param[0]);
                if (isNaN(this._n)) {
                    throw new Error("Invalid Number " + x);
                }
            }
            else if (param.length == 2) {
                this._n = Number(param[0]);
                this._e = Number(param[1]);
                if (isNaN(this._n) || isNaN(this._e)) {
                    throw new Error("Invalid Number " + x);
                }
            }
            else {
                throw new Error("Invalid Number " + x);
            }
        }
        else if (typeof (x) == "number") {
            this._n = x;
        }
        else if (x instanceof BigNum) {
            this._n = x._n;
            this._e = x._e;
        }
        else {
            throw new Error("Invalid Type Number " + JSON.stringify(x));
        }
        BigNum.format(this);
    }
    var d = __define,c=BigNum,p=c.prototype;
    BigNum.add = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        var result = new BigNum(0);
        var flag = BigNum.alignExp(numX, numY);
        if (flag == 0) {
            result._n = numX._n + numY._n;
            result._e = numX._e;
            return result.toString();
        }
        else if (flag == -1) {
            return numY.toString();
        }
        else {
            return numX.toString();
        }
    };
    BigNum.sub = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        var result = new BigNum(0);
        var flag = BigNum.alignExp(numX, numY);
        if (flag == 0) {
            result._n = numX._n - numY._n;
            result._e = numX._e;
            return result.toString();
        }
        else if (flag == -1) {
            numY._n = -numY._n;
            return numY.toString();
        }
        else {
            return numX.toString();
        }
    };
    BigNum.mul = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        var result = new BigNum(0);
        result._n = numX._n * numY._n;
        result._e = numX._e + numY._e;
        return result.toString();
    };
    BigNum.div = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        var result = new BigNum(0);
        result._n = numX._n / numY._n;
        result._e = numX._e - numY._e;
        return result.toString();
    };
    BigNum.sqrt = function (x) {
        var result = new BigNum(x);
        if (result._n < 0) {
            throw new Error("Sqrt Not Support Nagtive Number");
        }
        if (result._e % 2 == 1) {
            result._n *= 10;
            result._e--;
        }
        result._n = Math.sqrt(result._n);
        result._e = result._e / 2;
        return result.toString();
    };
    BigNum.pow = function (x, y) {
        if (y < 0) {
            throw new Error("Pow Not Support Nagtive Number");
        }
        if (x == 0) {
            return new BigNum(0).toString();
        }
        else if (x == 1) {
            return new BigNum(1).toString();
        }
        else if (y == 0) {
            return new BigNum(1).toString();
        }
        else {
            var a = y * 2;
            var b = 2;
            var num = new BigNum(x).toString();
            var result = "1";
            while (Math.round(a) < 1 || Math.abs(Math.round(a) / b - y) > 0.00001) {
                a *= 2;
                b *= 2;
            }
            a = Math.round(a);
            while (a != 0) {
                if (a % 2 == 1) {
                    result = BigNum.mul(result, num);
                }
                a = Math.floor(a / 2);
                num = BigNum.mul(num, num);
            }
            while (b > 1) {
                b /= 2;
                result = BigNum.sqrt(result);
            }
            return result;
        }
    };
    BigNum.greater = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        if (numX._n < 0) {
            if (numY._n < 0) {
                if (numX._e < numY._e) {
                    return true;
                }
                else if (numX._e == numY._e && numX._n < numY._n) {
                    return true;
                }
            }
        }
        else if (numX._n == 0) {
            if (numY._n < 0) {
                return true;
            }
        }
        else if (numX._n > 0) {
            if (numY._n <= 0) {
                return true;
            }
            else {
                if (numX._e > numY._e) {
                    return true;
                }
                else if (numX._e == numY._e && numX._n > numY._n) {
                    return true;
                }
            }
        }
        return false;
    };
    BigNum.greaterOrEqual = function (x, y) {
        return BigNum.less(x, y) == false;
    };
    BigNum.less = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        if (numX._n < 0) {
            if (numY._n >= 0) {
                return true;
            }
            else {
                if (numX._e > numY._e) {
                    return true;
                }
                else if (numX._e == numY._e && numX._n > numY._n) {
                    return true;
                }
            }
        }
        else if (numX._n == 0) {
            if (numY._n > 0) {
                return true;
            }
        }
        else if (numX._n > 0) {
            if (numY._n > 0) {
                if (numX._e < numY._e) {
                    return true;
                }
                else if (numX._e == numY._e && numX._n < numY._n) {
                    return true;
                }
            }
        }
        return false;
    };
    BigNum.lessOrEqual = function (x, y) {
        return BigNum.greater(x, y) == false;
    };
    BigNum.equal = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        if (numX._e == numY._e && numX._n == numY._n) {
            return true;
        }
        else {
            return false;
        }
    };
    BigNum.min = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        if (BigNum.less(numX, numY)) {
            return numX.toString();
        }
        else {
            return numY.toString();
        }
    };
    BigNum.max = function (x, y) {
        var numX = new BigNum(x);
        var numY = new BigNum(y);
        if (BigNum.greater(numX, numY)) {
            return numX.toString();
        }
        else {
            return numY.toString();
        }
    };
    BigNum.clamp = function (x, min, max) {
        var num = new BigNum(x);
        var numMin = new BigNum(min);
        var numMax = new BigNum(max);
        return BigNum.min(BigNum.max(num, numMin), numMax);
    };
    BigNum.parseNumber = function (x) {
        var num = new BigNum(x);
        return num._n * Math.pow(10, num._e);
    };
    BigNum.format = function (x) {
        if (x._n == 0) {
            x._e = 0;
        }
        else {
            while (Math.abs(x._n) < 1) {
                x._n *= 10;
                x._e--;
            }
            while (Math.abs(x._n) >= 10) {
                x._n /= 10;
                x._e++;
            }
        }
    };
    BigNum.alignExp = function (x, y) {
        var diff = Math.abs(x._e - y._e);
        if (x._e < y._e) {
            if (diff > 100) {
                return -1;
            }
            y._n *= Math.pow(10, diff);
            y._e -= diff;
        }
        if (x._e > y._e) {
            if (diff > 100) {
                return 1;
            }
            x._n *= Math.pow(10, diff);
            x._e -= diff;
        }
        return 0;
    };
    d(p, "n"
        ,function () {
            return this._n;
        }
    );
    d(p, "e"
        ,function () {
            return this._e;
        }
    );
    p.toString = function () {
        BigNum.format(this);
        return this._n + "e" + this._e;
    };
    return BigNum;
}());
egret.registerClass(BigNum,'BigNum');
