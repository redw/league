/**
 * Created by hh on 2016/11/30.
 */
module fight{
    export function check(clientObj, serverObj) {
        let result = true;
        let clientArr = clientObj.concat();
        let serverArr = serverObj.concat();
        console.group("------------报告检测-------------");
        let clientLen = clientArr.length;
        let serverLen = serverArr.length;
        if (clientLen != serverLen) {
            console.warn(`客户端战报步数:${clientLen} 服务器端战报步数:${serverLen}`);
        }
        const len = Math.min(clientLen, serverLen);
        const props = fight.CHECK_PROP.split(",");
        for (let i = 0; i < len; i ++) {
            let clientItem = clientArr[i];
            let serverItem = serverArr[i];
            let ok:boolean = true;
            for (let j = 0; j < props.length; j++) {
                let prop = props[j];
                if (!checkProp(clientItem[prop], serverItem[prop])) {
                    ok = false;
                    result = false;
                    console.warn(`step:${i},pos:${clientItem["pos"]},prop:${prop},client:${String(clientItem[prop])},server:${String(serverItem[prop])}`);
                    break;
                }
            }
            if (ok) {
                let clientTarget = clientItem.target || [];
                let serverTarget = serverItem.target;
                for (let k = 0; k < clientTarget.length; k++) {
                    for (let j = 0; j < props.length - 1; j++) {
                        let prop = props[j];
                        if (!checkProp(clientTarget[k][prop], serverTarget[k][prop])) {
                            result = false;
                            console.warn(`step:${i},pos:${clientTarget[k]["pos"]},,prop:${prop},client:${String(clientTarget[k][prop])},server:${String(serverTarget[k][prop])}`);
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

        /**
         * 检测属性
         * @param clientValue
         * @param serverValue
         * @returns {boolean}
         */
    function checkProp(clientValue:any, serverValue:any){
        if (typeof clientValue == "number" && typeof serverValue == "number") {
            return clientValue == serverValue;
        }
        if (Array.isArray(clientValue)) {
            return true;
        }
        let value0:string = String(clientValue);
        let value1:string = String(serverValue);
        if (value0 == value1) {
            return true;
        } else {
            let value0Arr = value0.split(",");
            let value1Arr = value1.split(",");
            if (value0Arr.length > 1) {
                return false;
            } else {
                value1 = BigNum.max(0, value1);
                return MathUtil.easyNumber(value0) == MathUtil.easyNumber(value1);
            }
        }
    }
}