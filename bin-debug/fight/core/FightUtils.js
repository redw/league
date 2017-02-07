/**
 * 战斗里的一些工具方法
 * Created by hh on 2016/11/30.
 */
var fight;
(function (fight) {
    var curSoundPath = "";
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
     * 验证主动技能
     * @param value
     */
    function verifyActiveSkill(value) {
        if (value) {
            if (value.type == "passive") {
                recordLog("\u6280\u80FD" + value.id + "\u5E94\u8BE5\u662F\u4E3B\u52A8\u914D\u7F6E", fight.LOG_FIGHT_WARN);
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
                    recordLog("\u6280\u80FD" + value.id + "\u7684" + value.action_type + "\u653B\u51FB\u4F24\u5BB3\u5E27\u914D\u7F6E\u9519\u8BEF", fight.LOG_FIGHT_WARN);
                }
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
     * 是否是加血技能
     */
    function isAddHPSkill(value) {
        return value && value.damage < 0;
    }
    fight.isAddHPSkill = isAddHPSkill;
    /**
     * 得到近战攻击玩家时的攻击位置
     * @param role
     * @param targets
     * @param skill
     * @returns {Point}
     */
    function getNearFightPoint(role, targets, skill) {
        var point = new egret.Point();
        var offPoint = (skill && skill.move_position) || [0, 0];
        if (skill.action_type == fight.ATTACK_ACTION_ROW) {
            point = getRoleInitPoint({ side: 3 - role.side, pos: targets[0].pos % 3 });
        }
        else {
            var curRole = targets[0];
            var minValue = Math.abs(role.pos - curRole.pos);
            for (var i = 1; i < targets.length; i++) {
                var curValue = Math.abs(role.pos - targets[i].pos);
                if (curValue < minValue) {
                    curRole = targets[i];
                }
            }
            point = getRoleInitPoint(curRole);
        }
        if (role.side == FightSideEnum.RIGHT_SIDE) {
            point.x += (fight.MOVE_ATTACK_OFF + (+offPoint[0]));
        }
        else {
            point.x -= (fight.MOVE_ATTACK_OFF + (+offPoint[0]));
        }
        point.y += (+offPoint[1]);
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
        // if (Global.DEBUG) {
        //     if (level >= LOG_FIGHT_ERROR) {
        //         console.error(content);
        //     } else if (level >= LOG_FIGHT_WARN) {
        //         console.warn(content);
        //     } else {
        //         console.log(content);
        //     }
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
            action == fight.ATTACK_ACTION_ROW ||
            action == fight.ATTACK_ACTION_JUMP_AREA;
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
                recordLog("\u8D44\u6E90" + id + "\u5E27" + label + "\u9519\u8BEF", fight.LOG_FIGHT_WARN);
            }
        }
        else {
            recordLog("\u8D44\u6E90" + id + " \u4E0D\u5B58\u5728\u5E27\u6807\u7B7E" + label, fight.LOG_FIGHT_WARN);
        }
        return result;
    }
    fight.playFrameLabel = playFrameLabel;
    /**
     * 随机技能触发串
     * @returns {string|string|string|string|string}
     */
    function randomSkillTriggerBunch() {
        var bunch = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
        var index = Math.floor(Math.random() * bunch.length);
        return fight.TEST_BUNCH || bunch[index];
    }
    fight.randomSkillTriggerBunch = randomSkillTriggerBunch;
    /**
     * 显示伤害,飘字等效果
     * @param parent
     * @param content
     * @param fntname
     */
    function showTxt(parent, content, fntname) {
        var fontEff = new FontEff(fntname);
        parent.addChild(fontEff);
        fontEff.show(content);
    }
    fight.showTxt = showTxt;
    function playSound(url, isMusicEff) {
        if (isMusicEff === void 0) { isMusicEff = true; }
        if (url) {
            try {
                if (isMusicEff) {
                    // egret.setTimeout(()=>{
                    // SoundManager.inst.effectSwitch = !UserProxy.inst.soundOpen;
                    SoundManager.inst.playEffect(URLConfig.getSoundURL(url));
                }
                else {
                    if (curSoundPath != url) {
                        SoundManager.inst.stopMusic();
                        // SoundManager.inst.musicSwitch = !UserProxy.inst.musicOpen;
                        egret.setTimeout(function () {
                            SoundManager.inst.playMusic(URLConfig.getSoundURL(url));
                        }, this, 0);
                        curSoundPath = url;
                    }
                }
            }
            catch (e) {
                recordLog("\u64AD\u653E{url}\u58F0\u97F3\u51FA\u9519", fight.LOG_FIGHT_WARN);
            }
        }
    }
    fight.playSound = playSound;
    /**
     * 生成战斗角色数据
     * @param obj   角色数据
     * @param pos   角色位置
     * @param side  角色所有边
     * @returns {FightRoleVO[]}
     */
    function generatePVPFightHeroVOArr(obj, pos, side) {
        var result = [];
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var fightRoleVO = new FightRoleVO();
            var key = keys[i];
            if (!obj[key].id) {
                obj[key].id = +key;
            }
            fightRoleVO.parse(obj[key]);
            fightRoleVO.side = side;
            fightRoleVO.pos = 0;
            var heroVO = new HeroVO(obj[key]);
            fightRoleVO.copyProp(heroVO);
            for (var j = 0; !!pos && j < pos.length; j++) {
                if (fightRoleVO.id == pos[j]) {
                    fightRoleVO.pos = j;
                    break;
                }
            }
            result.push(fightRoleVO);
        }
        return result;
    }
    fight.generatePVPFightHeroVOArr = generatePVPFightHeroVOArr;
    /**
     * 生成战斗角色数据数组
     * @returns {FightRoleVO[]}
     */
    function generateFightRoleVOArr(value) {
        var result = [];
        var keys = Object.keys(value);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var fightRoleVO = generateFightRoleVO(value[key]);
            result.push(fightRoleVO);
        }
        return result;
    }
    fight.generateFightRoleVOArr = generateFightRoleVOArr;
    /**
     * 生成战斗角色数据
     * @returns {FightRoleVO}
     */
    function generateFightRoleVO(value) {
        var result = new FightRoleVO(value);
        if (fight.isHero(value.id)) {
            var heroVO = new HeroVO(value);
            result.copyProp(heroVO);
        }
        else {
            var monsterVO = new MonsterVO(value);
            result.copyProp(monsterVO);
        }
        return result;
    }
    fight.generateFightRoleVO = generateFightRoleVO;
    /**
     * 子弹缓冲方法
     * @param ratio tween的0到1的进度
     * @returns {number}
     */
    function bulletEase(time) {
        return function (ratio) {
            var duration = time;
            var x = ratio;
            var t = ratio * duration;
            var b = 0;
            var c = 1;
            var d = duration;
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        };
    }
    fight.bulletEase = bulletEase;
    /**
     * 检查战斗是否结束
     * @param arr
     * @returns {boolean}
     */
    function checkFightEnd(arr) {
        var len = arr.length;
        var isEnd = true;
        var side = 0;
        for (var i = 0; i < len; i++) {
            if (i == 0) {
                side = arr[0].side;
            }
            else {
                if (side != arr[i].side) {
                    isEnd = false;
                    break;
                }
            }
        }
        return isEnd;
    }
    fight.checkFightEnd = checkFightEnd;
    function generateMonsterInfo(monsterArr) {
        var result = [];
        for (var i = 0; i < monsterArr.length; i++) {
            var obj = {};
            obj.id = monsterArr[i].id;
            obj.pos = monsterArr[i].pos;
            obj.side = monsterArr[i].side;
            obj.level = this.level;
            result.push(obj);
        }
        return result;
    }
    fight.generateMonsterInfo = generateMonsterInfo;
    function generateHeroInfo(heroArr) {
        var result = [];
        for (var i = 0; i < heroArr.length; i++) {
            var obj = {};
            obj.id = heroArr[i].id;
            obj.pos = heroArr[i].pos;
            obj.side = heroArr[i].side;
            var heroVO = UserProxy.inst.heroData.getHeroData(obj.id);
            obj.level = heroVO ? heroVO.level : 0;
            obj.starLevel = heroVO ? heroVO.starLevel : 1;
            obj.strengthenLevel = heroVO ? heroVO.strengthenLevel : 0;
            obj.starPiece = heroVO ? heroVO.starPiece : 0;
            result.push(obj);
        }
        return result;
    }
    fight.generateHeroInfo = generateHeroInfo;
})(fight || (fight = {}));
//# sourceMappingURL=FightUtils.js.map