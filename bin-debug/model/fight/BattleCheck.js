/**
 * Created by hh on 2016/11/30.
 */
var fight;
(function (fight) {
    function check(clientObj, serverObj) {
        var result = true;
        var clientArr = clientObj.concat();
        var serverArr = serverObj.concat();
        console.group("------------报告检测-------------");
        var clientLen = clientArr.length;
        var serverLen = serverArr.length;
        if (clientLen != serverLen) {
            console.warn("\u5BA2\u6237\u7AEF\u6218\u62A5\u6B65\u6570:" + clientLen + " \u670D\u52A1\u5668\u7AEF\u6218\u62A5\u6B65\u6570:" + serverLen);
        }
        var len = Math.min(clientLen, serverLen);
        var props = fight.CHECK_PROP.split(",");
        for (var i = 0; i < len; i++) {
            var clientItem = clientArr[i];
            var serverItem = serverArr[i];
            var ok = true;
            for (var j = 0; j < props.length; j++) {
                var prop = props[j];
                if (!checkProp(clientItem[prop], serverItem[prop])) {
                    ok = false;
                    result = false;
                    console.warn("step:" + i + ",pos:" + clientItem["pos"] + ",prop:" + prop + ",client:" + String(clientItem[prop]) + ",server:" + String(serverItem[prop]));
                    break;
                }
            }
            if (ok) {
                var clientTarget = clientItem.target || [];
                var serverTarget = serverItem.target;
                for (var k = 0; k < clientTarget.length; k++) {
                    for (var j = 0; j < props.length - 1; j++) {
                        var prop = props[j];
                        if (!checkProp(clientTarget[k][prop], serverTarget[k][prop])) {
                            result = false;
                            console.warn("step:" + i + ",pos:" + clientTarget[k]["pos"] + ",,prop:" + prop + ",client:" + String(clientTarget[k][prop]) + ",server:" + String(serverTarget[k][prop]));
                            break;
                        }
                    }
                }
            }
        }
        if (!result) {
            console.warn(clientArr, serverArr);
        }
        console.groupEnd();
        return result;
    }
    fight.check = check;
    /**
     * 检测属性
     * @param clientValue
     * @param serverValue
     * @returns {boolean}
     */
    function checkProp(clientValue, serverValue) {
        if (typeof clientValue == "number" && typeof serverValue == "number") {
            return clientValue == serverValue;
        }
        if (Array.isArray(clientValue)) {
            return true;
        }
        var value0 = String(clientValue);
        var value1 = String(serverValue);
        if (value0 == value1) {
            return true;
        }
        else {
            var value0Arr = value0.split(",");
            var value1Arr = value1.split(",");
            if (value0Arr.length > 1) {
                return false;
            }
            else {
                value1 = BigNum.max(0, value1);
                return MathUtil.easyNumber(value0) == MathUtil.easyNumber(value1);
            }
        }
    }
})(fight || (fight = {}));
//# sourceMappingURL=BattleCheck.js.map