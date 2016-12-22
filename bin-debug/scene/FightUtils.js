/**
 * Created by Administrator on 2016/11/30.
 */
var fight;
(function (fight) {
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
     * 验证主动配置
     * @param value
     */
    function verifyActiveSkill(value) {
        if (value.type == "passive") {
            recordLog("\u6280\u80FD" + value.id + "\u4E3B\u52A8\u4E0E\u88AB\u52A8\u6280\u80FD\u914D\u7F6E\u9519\u8BEF", fight.LOG_FIGHT_WARN);
        }
        if (!value.trigger_chance || value.trigger_chance > 1) {
            recordLog("\u6280\u80FD" + value.id + "\u7684\u4E32\u914D\u7F6E\u9519\u8BEF", fight.LOG_FIGHT_WARN);
        }
        if (!value.repeat || value.repeat > 5) {
            recordLog("\u6280\u80FD" + value.id + "\u7684repeat\u914D\u7F6E\u9519\u8BEF", fight.LOG_FIGHT_WARN);
        }
        if (!value.damage_frame) {
            recordLog("\u6280\u80FD" + value.id + "\u6CA1\u6709\u914D\u4F24\u5BB3\u5E27", fight.LOG_FIGHT_WARN);
        }
        if (value.action_type == fight.ATTACK_ACTION_JUMP && !value.jump_frame) {
            recordLog("\u6280\u80FD" + value.id + "\u7684\u8DF3\u8DC3\u653B\u51FB\u6CA1\u6709\u914D\u8DF3\u8DC3\u5E27", fight.LOG_FIGHT_WARN);
        }
        if (value.action_type == fight.ATTACK_ACTION_AREA || value.action_type == fight.ATTACK_ACTION_TURN) {
            if (!value.effect_damage_frame) {
                recordLog("\u6280\u80FD" + value.id + "\u7684" + value.action_type + "\u653B\u51FB\u6CA1\u6709\u914D\u6548\u679C\u4F24\u5BB3\u5E27", fight.LOG_FIGHT_WARN);
            }
        }
    }
    fight.verifyActiveSkill = verifyActiveSkill;
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
     * 是否是加血技能
     */
    function isAddHPSkill(value) {
        return value && value.target_group == "friend";
    }
    fight.isAddHPSkill = isAddHPSkill;
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
     * @param targets
     * @returns {Point}
     */
    function getNearFightPoint(role, targets) {
        var curRole = targets[0];
        var minValue = Math.abs(role.roleData.pos - curRole.roleData.pos);
        for (var i = 1; i < targets.length; i++) {
            var curValue = Math.abs(role.roleData.pos - curRole.roleData.pos);
            if (curValue < minValue) {
                curRole = targets[i];
            }
        }
        var point = getRoleInitPoint(curRole.roleData);
        if (role.roleData.side == FightSideEnum.RIGHT_SIDE) {
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
        return fight.POS_MAP[side][pos].clone();
    }
    fight.getRoleInitPoint = getRoleInitPoint;
    /**
     * 记录日志
     * @param content
     * @param level
     */
    function recordLog(content, level) {
        if (level === void 0) { level = 0; }
        // if (level >= LOG_FIGHT_ERROR) {
        //     egret.error(content);
        // } else if (level >= LOG_FIGHT_WARN) {
        //     egret.warn(content);
        // } else {
        //     egret.log(content);
        // }
    }
    fight.recordLog = recordLog;
    /**
     * 需要移动攻击
     * @param action
     */
    function needMoveAttack(action) {
        return action == fight.ATTACK_ACTION_NORMAL ||
            action == fight.ATTACK_ACTION_ROW;
    }
    fight.needMoveAttack = needMoveAttack;
    /**
     * 需要回退
     * @param action
     * @returns {boolean}
     */
    function needRetreat(action) {
        return action == fight.ATTACK_ACTION_NORMAL ||
            action == fight.ATTACK_ACTION_JUMP ||
            action == fight.ATTACK_ACTION_ROW;
    }
    fight.needRetreat = needRetreat;
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
     * 显示伤害,飘字等效果
     * @param parent
     * @param content
     * @param type
     */
    function showTxt(parent, content, type) {
        if (type === void 0) { type = 0; }
        var fontEff;
        switch (type) {
            case FightFontEffEnum.PHYSICAL_ATK:
                fontEff = new FontPhysicalAtkEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;
            case FightFontEffEnum.MAGIC_ATK:
                fontEff = new FontMagicAtkEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;
            case FightFontEffEnum.ADD_HP:
                fontEff = new FontAddHPEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;
            case FightFontEffEnum.SYSTEM:
                fontEff = new FontSystemEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;
            case FightFontEffEnum.OTHER:
                fontEff = new FontOtherEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;
        }
    }
    fight.showTxt = showTxt;
    function playSound(url) {
        if (url) {
            try {
                SoundManager.inst.playEffect(URLConfig.getSoundURL(url));
            }
            catch (e) {
                recordLog("\u64AD\u653E{url}\u58F0\u97F3\u51FA\u9519", fight.LOG_FIGHT_WARN);
            }
        }
    }
    fight.playSound = playSound;
    /**
     * 生成角色
     */
    function createRole() {
        // var factory = new egret.MovieClipDataFactory()
        // let dataRes:any = RES.getRes(name + "_json");
        // let textureRes:any = RES.getRes(name + "_png");
        // factory.mcDataSet = dataRes;
        // factory.texture = textureRes;
        // return new egret.MovieClip(factory.generateMovieClipData(name));
    }
    fight.createRole = createRole;
})(fight || (fight = {}));
//# sourceMappingURL=FightUtils.js.map