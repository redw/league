/**
 * Created by Administrator on 2016/11/30.
 */
var fight;
(function (fight) {
    // 左边角色
    fight.SIDE_LEFT = 1;
    // 右边角色
    fight.SIDE_RIGHT = 2;
    // 同时出战的时间间隔
    fight.MEANWHILE_FIGHT_DELAY_TIME = 200;
    // 能否同时出战
    fight.CAN_MEANWHILE_FIGHT = false;
    // 回退的时间间隔
    fight.RETREAT_TIME = 150;
    // 移动的时间
    fight.MOVE_TIME = 150;
    // 移动攻击时,距离目标点的位置
    fight.MOVE_ATTACK_OFF = 100;
    fight.LOG_FIGHT_INFO = 1;
    fight.LOG_FIGHT_STEP_START = 5;
    fight.LOG_FIGHT_ROLE_DIE = 10;
    fight.LOG_FIGHT_STEP_END = 15;
    fight.LOG_FIGHT_WARN = 50;
    fight.LOG_FIGHT_ERROR = 100;
    var POS_MAP = [
        [
            new egret.Point(160, 200), new egret.Point(160, 280), new egret.Point(160, 380),
            new egret.Point(110, 240), new egret.Point(110, 280), new egret.Point(110, 340),
            new egret.Point(60, 200), new egret.Point(60, 280), new egret.Point(60, 380),
        ],
        [
            new egret.Point(320, 200), new egret.Point(320, 280), new egret.Point(350, 380),
            new egret.Point(370, 240), new egret.Point(370, 280), new egret.Point(370, 340),
            new egret.Point(420, 200), new egret.Point(420, 280), new egret.Point(420, 380),
        ]
    ];
    /**
     * 得到角色的描述信息
     * @param role RoleData或FightRole
     * @returns {string}
     */
    function getRolePosDes(role) {
        var result = "";
        var arr = [];
        if (role.length >= 1) {
            arr = role.concat();
        }
        else {
            arr = [role];
        }
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            if (arr[i].roleData)
                result += (arr[i].roleData.side + "_" + arr[i].roleData.pos);
            else
                result += (arr[i].side + "_" + arr[i].pos);
            if (i < len - 1)
                result += ",";
        }
        return result;
    }
    fight.getRolePosDes = getRolePosDes;
    /**
     * 选取目标通用规则
     * @param value 排或列
     * @returns {[number,number,number]}
     */
    function getCommonOrders(value) {
        if (value == 1) {
            return [1, 0, 2];
        }
        else if (value == 2) {
            return [2, 1, 0];
        }
        else {
            return [0, 1, 2];
        }
    }
    fight.getCommonOrders = getCommonOrders;
    /**
     * 是否是英雄
     * @param roleId
     * @returns {boolean}
     */
    function isHero(roleId) {
        return roleId < 200;
    }
    fight.isHero = isHero;
    /**
     * 是否是boss
     * @param roleId
     * @returns {boolean}
     */
    function isBoss(roleId) {
        var result = false;
        if (!isHero(roleId)) {
            result = Config.EnemyData[roleId].boss;
        }
        return result;
    }
    fight.isBoss = isBoss;
    /**
     * 得到近战攻击玩家时的攻击位置
     * @param role
     * @returns {Point}
     */
    function getNearFightPoint(role) {
        var point = getRoleInitPoint(role);
        if (role.side == fight.SIDE_LEFT) {
            point.x += fight.MOVE_ATTACK_OFF;
        }
        else {
            point.x -= fight.MOVE_ATTACK_OFF;
        }
        return point;
    }
    fight.getNearFightPoint = getNearFightPoint;
    /**
     * 得到角色出生位置
     * @param role  角色数据
     * @returns {Point}
     */
    function getRoleInitPoint(role) {
        var side = role.side - 1;
        var pos = role.pos;
        return POS_MAP[side][pos].clone();
    }
    fight.getRoleInitPoint = getRoleInitPoint;
    /**
     * 记录日志
     * @param content
     * @param level
     */
    function recordLog(content, level) {
        if (level === void 0) { level = 0; }
        if (level >= fight.LOG_FIGHT_ERROR) {
            egret.error(content);
        }
        else if (level >= fight.LOG_FIGHT_WARN) {
            egret.warn(content);
        }
        else {
            egret.log(content);
        }
    }
    fight.recordLog = recordLog;
    /**
     * 需要移动攻击
     * @param action
     */
    function needMoveAttack(action) {
        return action == "normal_attack" || action == "jump_attack" || action == "row_attack";
    }
    fight.needMoveAttack = needMoveAttack;
    /**
     * 播放mc的帧标签
     * @param label
     * @param mc
     * @param count
     * @param id
     * @returns {boolean}   成功播放,返回true,否则返回false
     */
    function playFrameLabel(label, mc, count, id) {
        if (count === void 0) { count = 1; }
        if (id === void 0) { id = 0; }
        var result = false;
        if (mc && mc["frameLabels"] && mc["frameLabels"].indexOf(label)) {
            result = true;
            try {
                mc.gotoAndPlay(label, count);
            }
            catch (e) {
                result = false;
                recordLog("\u64AD\u653E\u8D44\u6E90" + id + "\u5E27" + label + "\u9519\u8BEF", fight.LOG_FIGHT_WARN);
            }
        }
        else {
            recordLog("\u8D44\u6E90" + id + " \u4E0D\u5B58\u5728\u5728\u5E27\u6807\u7B7E", fight.LOG_FIGHT_WARN);
        }
        return result;
    }
    fight.playFrameLabel = playFrameLabel;
    /**
     * 添加战斗伤害效果
     * @param parent
     * @param text
     * @param off
     */
    function addHurtText(parent, text, off) {
        if (off === void 0) { off = { x: 0, y: 0 }; }
        var container = parent;
        var txtHp = new egret.TextField;
        txtHp.textAlign = egret.HorizontalAlign.CENTER;
        txtHp.verticalAlign = egret.VerticalAlign.MIDDLE;
        txtHp.textColor = 0xFA725D;
        txtHp.fontFamily = Global.SYS_FONT;
        txtHp.size = 16;
        txtHp.bold = true;
        txtHp.stroke = 2;
        txtHp.strokeColor = 0x672B23;
        txtHp.text = text;
        txtHp.x = container.scaleX < 0 ? off.x - 10 : off.x + 10;
        txtHp.y = off.y;
        txtHp.scaleX = container.scaleX;
        container.addChild(txtHp);
        egret.Tween.get(txtHp).to({ y: off.y - 20, x: container.scaleX < 0 ? off.x - 20 : off.x + 20 }, 300, egret.Ease.bounceOut).wait(200).to({ scaleX: 0.5, scaleY: 0.5, alpha: 0 }, 300).call(function () {
            egret.Tween.removeTweens(txtHp);
            DisplayUtil.removeFromParent(txtHp);
        }, txtHp);
    }
    fight.addHurtText = addHurtText;
})(fight || (fight = {}));
