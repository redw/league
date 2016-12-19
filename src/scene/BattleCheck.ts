/**
 * Created by Administrator on 2016/11/30.
 */
module fight{
    export function check(clientObj, serverObj) {
        let result = true;
        let clientArr = clientObj.concat();
        let serverArr = serverObj.concat();
        console.log("检测战报:", clientArr, serverArr);
        let clientLen = clientArr.length;
        let serverLen = serverArr.length;

        if (clientLen != serverLen) {
            // result = false;
            // console.error("客户端战斗轮数:" + clientLen, " 服务器端战斗轮数:" + serverLen)
        }
        const len = Math.min(clientLen, serverLen);
        for (let i = 0; i < len; i ++) {
            let clientItem = clientArr[i];
            let serverItem = serverArr[i];
            let clientTargets = clientItem.target;
            let serverTargets = serverItem.target;

            if (clientItem.pos != serverItem.pos) {
                result = false;
                console.error("第" + i + "步攻击者不同", clientItem.pos, serverItem.pos);
                continue;
            }

            if (clientItem.vertigo) {
                continue;
            }

            var clientRoleHP = MathUtil.easyNumber(clientItem.hp).toString();
            var serverRoleHP = MathUtil.easyNumber(serverItem.hp).toString();
            if (!checkEquip(clientRoleHP, serverRoleHP)) {
                result = false;
                console.error("第" + i + "步攻击者" + clientItem.pos + "血量不同", clientRoleHP, "    " , serverRoleHP);
            }

            if (serverTargets && clientTargets) {
                if (clientTargets.length != serverTargets.length) {
                    result = false;
                    console.error("第" + i + "步目标个数不同");
                } else {
                    for (var j = 0; j < clientTargets.length; j++) {
                        var superClientItem = clientTargets[j];
                        var superSeverItem = serverTargets[j];
                        if (superClientItem.pos != superSeverItem.pos) {
                            result = false;
                            console.error("第" + i + "步第" + j + "个目标不同");
                        } else {
                            if (superClientItem.addHP > 0) {
                                var clientAddHP = MathUtil.easyNumber(superClientItem.addHP).toString();
                                var serverAddHP = MathUtil.easyNumber(superSeverItem.damage.substr(1)).toString();
                                if (!checkEquip(clientAddHP, serverAddHP)) {
                                    result = false;
                                    console.error("第" + i + "步" + superClientItem.pos + "血量不同", clientAddHP, "    " , serverAddHP);
                                }
                            } else {
                                var clientBuffStr = superClientItem.buffs.sort().toString();
                                var serverBuffStr= superSeverItem.buff.sort().toString();
                                if (!checkEquip(clientBuffStr, serverBuffStr)) {
                                    result = false;
                                    console.error("第" + i + "步" + superClientItem.pos + "buff不同", clientBuffStr, "    " , serverBuffStr);
                                }

                                var clientHP = MathUtil.easyNumber(superClientItem.hp).toString();
                                var serverHP = MathUtil.easyNumber(superSeverItem.hp).toString();
                                if (!checkEquip(clientHP, serverHP)) {
                                    result = false;
                                    console.error("第" + i + "步" + superClientItem.pos + "血量不同", clientHP, "    " , serverHP);
                                }
                                var clientDamage = MathUtil.easyNumber(superClientItem.damage).toString();
                                var serverDamage = MathUtil.easyNumber(superSeverItem.damage).toString();
                                if (!checkEquip(clientDamage, serverDamage)) {
                                    result = false;
                                    console.error("第" + i + "步" + superClientItem.pos + "伤害不同", clientDamage, "    " , serverDamage);
                                }
                            }
                        }
                    }
                }
            }
        }
        console.groupEnd();
        return result;
    }

    function checkEquip(a:any, b:any) {
        if (+a === Number(a) && +b === Number(b)) {
            a = Math.max(0, a);
            b = Math.max(0, b);
            return Math.abs(a - b) <= 10;
        }
        return a.substr(0, 1) == b.substr(0, 1);
    }
}