/**
 * 参与战斗的角色对象
 *
 * @author hh
 */
var FightRole = (function (_super) {
    __extends(FightRole, _super);
    function FightRole(fightContainer, roleData) {
        _super.call(this);
        this.isTriggerDamage = false;
        this.isPlayingDamage = false;
        this.waiting = true;
        this.zIndex = 0;
        this.fightContainer = fightContainer;
        this.roleData = roleData;
        egret.startTick(this.onTick, this);
        this.initRole();
    }
    var d = __define,c=FightRole,p=c.prototype;
    /**
     * 构建角色
     */
    p.initRole = function () {
        var shadowBitmap = new egret.Bitmap(RES.getRes("role_shadow_png"));
        shadowBitmap.y = -20;
        shadowBitmap.x = shadowBitmap.width * -0.5;
        this.addChild(shadowBitmap);
        this.body = FightRole.createMovieClip(this.roleData.config.resource + "");
        this.addChild(this.body);
        this.body.scaleX = (this.roleData.side == FightSideEnum.RIGHT_SIDE) ? 1 : -1;
        this.lifeBar = new LifeBar(this.roleData.isHero);
        this.lifeBar.x = -30;
        this.lifeBar.y = -(this.roleData.config.modle_height) - 10;
        this.addChild(this.lifeBar);
        this.updateHP(this.roleData.curHP);
        var point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;
        this.idle();
    };
    /**
     * 战斗
     * @param data
     * @param delay
     */
    p.fight = function (data, delay) {
        var _this = this;
        this.reportItem = data;
        var items = data.target;
        this.targets = [];
        for (var i = 0; i < items.length; i++) {
            var targetRole = this.fightContainer.getRoleByStr(items[i].pos);
            this.targets.push(targetRole);
        }
        if (delay > 0) {
            egret.setTimeout(function () {
                _this.doAction();
            }, this, delay);
        }
        else {
            this.doAction();
        }
    };
    /**
     * 执行角色行为
     */
    p.doAction = function () {
        var skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        fight.verifyActiveSkill(this.curSkill);
        // 如果被眩晕
        if (this.reportItem.vertigo) {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + this.reportItem.pos + " \u88AB\u7729\u6655", fight.LOG_FIGHT_STEP_START);
            this.triggerFrameMap = {};
            this.selfInjury();
        }
        else {
            var isAddHP = fight.isAddHPSkill(this.curSkill);
            // 如果是加血
            if (isAddHP) {
                fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + this.reportItem.pos + " \u7ED9\u76EE\u6807\u52A0\u8840", fight.LOG_FIGHT_STEP_START);
                this.addHP();
            }
            else {
                // 如果是攻击
                var action = this.curSkill.action_type;
                fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + this.reportItem.pos + " " + action + "\u653B\u51FB\u76EE\u6807", fight.LOG_FIGHT_STEP_START);
                if (fight.needRetreat(action)) {
                    this.fightContainer.bringRoleToFront(this, this.targets);
                }
                // 如果是移动攻击
                if (fight.needMoveAttack(action)) {
                    var targets = this.targets;
                    var point = fight.getNearFightPoint(this, targets);
                    var tween = egret.Tween.get(this);
                    tween.to({ x: point.x, y: point.y }, fight.MOVE_TIME);
                    tween.call(this.attack, this);
                }
                else {
                    this.attack();
                }
            }
        }
    };
    // 加血
    p.addHP = function () {
        var _this = this;
        var len = this.targets.length;
        var resourceOk = false;
        if (!!this.curSkill.target_effect) {
            var dataRes = RES.getRes(this.curSkill.target_effect + "_json");
            var textureRes = RES.getRes(this.curSkill.target_effect + "_png");
            if (dataRes && textureRes) {
                resourceOk = true;
                var count_1 = 0;
                for (var i = 0; i < len; i++) {
                    var targetEff = new BaseMCEffect(this.curSkill.target_effect, i);
                    targetEff.back = function (index) {
                        _this.updateTarget(_this.targets[index], true);
                        count_1++;
                        if (count_1 >= len) {
                            _this.nextStep();
                        }
                    };
                    this.targets[i].addChild(targetEff);
                }
            }
        }
        if (!resourceOk) {
            this.updateTargets();
            this.nextStep();
        }
    };
    p.startDamage = function (ratio, updateHP) {
        if (this.curSkill) {
            this.isTriggerDamage = true;
            var actionType = this.curSkill.action_type;
            if (actionType == fight.ATTACK_ACTION_AREA) {
                this.showAreaEff();
            }
            else if (actionType == fight.ATTACK_ACTION_MISSLE) {
                this.showBulletEff();
            }
            else if (actionType == fight.ATTACK_ACTION_TURN) {
                this.showTurnEff();
            }
            else {
                this.showHitEff(ratio, updateHP);
            }
        }
        else {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65startDamage\u65F6\u6280\u80FD\u4E3A\u7A7A", fight.LOG_FIGHT_ERROR);
        }
    };
    p.showAreaEff = function () {
        var _this = this;
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            var damageEff = new BaseMCEffect(this.curSkill.scource_effect);
            var frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            var total_1 = frameArr.length;
            var current_1 = 0;
            for (var i = 0; i < total_1; i++) {
                damageEff.registerFrameBack(function () {
                    fight.playSound(_this.curSkill.scource_effect);
                    current_1++;
                    if (current_1 >= total_1) {
                        _this.isPlayingDamage = false;
                        _this.showHitEff(1 / total_1);
                    }
                    else {
                        _this.showHitEff(1 / total_1, false);
                    }
                }, +frameArr[i]);
            }
            var offPoint = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
            damageEff.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
            damageEff.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            damageEff.scaleX = this.roleData.side == FightSideEnum.LEFT_SIDE ? 1 : -1;
            this.fightContainer.showDamageEff(damageEff);
        }
    };
    p.showTurnEff = function () {
        var _this = this;
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            var damageEff = new BaseMCEffect(this.curSkill.scource_effect, null, false);
            var frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            var total_2 = frameArr.length;
            var count_2 = 0;
            for (var i = 0; i < total_2; i++) {
                damageEff.registerFrameBack(function () {
                    fight.playSound(_this.curSkill.scource_effect);
                    count_2++;
                    if (count_2 >= total_2) {
                        _this.showHitEff(1 / total_2);
                    }
                    else {
                        _this.showHitEff(1 / total_2, false);
                    }
                }, +frameArr[i]);
            }
            var offPoint = this.roleData.config.shoot_point || [0, 0];
            damageEff.x = this.x + (Number(offPoint.x) || 0);
            damageEff.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
            var targetPoint = new egret.Point();
            var outPoint = new egret.Point();
            if (this.roleData.side == FightSideEnum.LEFT_SIDE) {
                targetPoint.x = 360;
                targetPoint.y = 330;
                outPoint.x = 580;
                damageEff.scaleX = -1;
            }
            else {
                targetPoint.x = 120;
                targetPoint.y = 330;
                outPoint.x = -100;
                damageEff.scaleX = 1;
            }
            var angle = Math.atan2(targetPoint.y - damageEff.y, targetPoint.x - damageEff.x);
            damageEff.rotation = angle * 180 / Math.PI;
            outPoint.y = damageEff.y + (targetPoint.x - damageEff.x) * Math.tan(angle);
            egret.Tween.get(damageEff).to({ x: outPoint.x, y: outPoint.y }, 500).call(function () {
                _this.isPlayingDamage = false;
            }, this);
            this.fightContainer.showDamageEff(damageEff);
        }
    };
    p.showBulletEff = function () {
        if (this.checkDamageEff()) {
            var len_1 = this.targets.length;
            var delay = 0;
            var self_1 = this;
            var damageEffSourceArr = this.curSkill.scource_effect.split(",");
            var damageEffSource_1 = damageEffSourceArr[0];
            var bulletCount_1 = +damageEffSourceArr[1] || 1;
            self_1.isPlayingDamage = true;
            var totalCount_1 = len_1 * bulletCount_1;
            var turn = 0;
            var turnCountArr_1 = [];
            for (var i = 0; i < bulletCount_1; i++) {
                turnCountArr_1[i] = 0;
            }
            function attack(round) {
                var count = 0;
                var _loop_1 = function(i) {
                    var target = self_1.targets[i];
                    var damageEff = new BaseMCEffect(damageEffSource_1, null, false);
                    var offPoint = self_1.roleData.config.shoot_point || [0, 0];
                    damageEff.x = self_1.x + (Number(offPoint.x) || 0);
                    damageEff.y = self_1.y - self_1.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
                    var tox = target.x;
                    var toy = target.y - (target.roleData.config.modle_height * 0.5);
                    egret.Tween.get(damageEff).to({ x: tox, y: toy }, fight.BULLET_RUN_TIME).call(function () {
                        damageEff.dispose();
                        turnCountArr_1[round]++;
                        count++;
                        self_1.showHitEff(1 / bulletCount_1, turnCountArr_1[round] >= len_1, target);
                        if (count >= totalCount_1) {
                            self_1.isPlayingDamage = false;
                        }
                    });
                    self_1.fightContainer.showDamageEff(damageEff);
                };
                for (var i = 0; i < len_1; i++) {
                    _loop_1(i);
                }
            }
            for (var i = 0; i < bulletCount_1; i++) {
                egret.setTimeout(attack, null, delay, turn++);
                delay += fight.BULLET_RUN_DELAY_TIME;
            }
        }
    };
    p.checkDamageEff = function () {
        var result = true;
        if (!this.curSkill || !this.curSkill.scource_effect) {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u8D44\u6E90source_effect\u6CA1\u914D\u7F6E", fight.LOG_FIGHT_WARN);
            result = false;
            this.triggerFrameMap = {};
            this.updateTargets();
            this.nextStep();
        }
        return result;
    };
    /**
     * 显示受击效果
     */
    p.showHitEff = function (ratio, updateHP, role) {
        if (ratio === void 0) { ratio = 1; }
        if (updateHP === void 0) { updateHP = true; }
        if (role === void 0) { role = null; }
        var len = this.targets.length;
        for (var i = 0; i < len; i++) {
            var target = this.targets[i];
            if (!role || target == role) {
                var hitInfo = this.reportItem.target[i];
                var damage = BigNum.mul(hitInfo.damage, ratio);
                var damageNum = MathUtil.easyNumber(damage);
                var isBlock = hitInfo.block;
                var isDodge = hitInfo.dodge;
                if (!!this.curSkill.target_effect) {
                    var targetEff = new BaseMCEffect(this.curSkill.target_effect);
                    targetEff.y = (target.roleData.config.modle_height) * -0.5;
                    target.addChild(targetEff);
                }
                if (isDodge) {
                    this.fightContainer.flyTxt({ str: "闪避", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, FightFontEffEnum.SYSTEM);
                }
                else {
                    if (isBlock) {
                        target.block();
                    }
                    else {
                        target.hit();
                    }
                    fight.playSound(this.curSkill.target_cond);
                    if (parseFloat(damageNum) > 0) {
                        if (this.curSkill.damage_type == "physical") {
                            this.fightContainer.flyTxt({ str: damageNum, x: target.x, y: target.y + target.roleData.config.modle_height * -1, scale: this.reportItem.cri ? 1.5 : 1 }, FightFontEffEnum.PHYSICAL_ATK);
                        }
                        else {
                            this.fightContainer.flyTxt({ str: damageNum, x: target.x, y: target.y + target.roleData.config.modle_height * -1, scale: this.reportItem.cri ? 1.5 : 1 }, FightFontEffEnum.MAGIC_ATK);
                        }
                    }
                    else {
                        if (hitInfo.invincible) {
                            this.fightContainer.flyTxt({ str: "无敌", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, FightFontEffEnum.SYSTEM);
                        }
                        else if (hitInfo.isFreeMagicAtk) {
                            this.fightContainer.flyTxt({ str: "魔免", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, FightFontEffEnum.SYSTEM);
                        }
                        else if (hitInfo.isFreePhysicalAtk) {
                            this.fightContainer.flyTxt({ str: "物免", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, FightFontEffEnum.SYSTEM);
                        }
                        else {
                            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + hitInfo.pos + "\u53D7\u51FB\u4F24\u5BB3\u4E3A" + damageNum, fight.LOG_FIGHT_WARN);
                        }
                    }
                }
                if (updateHP) {
                    target.updateHP(hitInfo.hp);
                }
                else {
                    target.updateHP(BigNum.sub(target.roleData.curHP, damage));
                }
            }
        }
    };
    p.startJump = function () {
        var target = this.targets[0];
        if (target) {
            var point = fight.getNearFightPoint(this, this.targets);
            var tween = egret.Tween.get(this);
            var frameCount = this.curSkill.damage_frame - this.curSkill.jump_frame;
            var frameRate = 24;
            var time = frameCount / frameRate * 1000;
            tween.to({ x: point.x, y: point.y }, time);
        }
        else {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u8DF3\u8DC3\u653B\u51FB\u65F6,\u76EE\u6807\u4E0D\u80FD\u4E3A\u7A7A,\u68C0\u6D4B\u8DF3\u8DC3\u5E27\u7684\u914D\u7F6E", fight.LOG_FIGHT_WARN);
        }
    };
    p.idle = function () {
        this.waiting = true;
        fight.playFrameLabel("idle", this.body, -1, this.roleData.config.id);
    };
    d(p, "isIdle"
        ,function () {
            return this.waiting;
        }
    );
    p.hit = function () {
        this.waiting = false;
        if (fight.playFrameLabel("attacked", this.body, 1, this.roleData.config.id)) {
            this.body.addEventListener(egret.Event.COMPLETE, this.hitComplete, this);
        }
        else {
            this.hitComplete();
        }
    };
    p.hitComplete = function () {
        this.body.removeEventListener(egret.Event.COMPLETE, this.hitComplete, this);
        this.idle();
    };
    p.block = function () {
        this.waiting = false;
        if (fight.playFrameLabel("block", this.body, 1, this.roleData.config.id)) {
            this.fightContainer.flyTxt({ str: "格档", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, FightFontEffEnum.SYSTEM);
            this.body.addEventListener(egret.Event.COMPLETE, this.blockComplete, this);
        }
        else {
            this.blockComplete();
        }
    };
    p.blockComplete = function () {
        this.body.removeEventListener(egret.Event.COMPLETE, this.blockComplete, this);
        this.idle();
    };
    p.attack = function () {
        if (this.curSkill) {
            this.waiting = false;
            this.fightContainer.bringRoleToSelfZPos(this, this.targets);
            if (fight.playFrameLabel(this.curSkill.action, this.body, 1, this.roleData.config.resource)) {
                this.body.addEventListener(egret.Event.COMPLETE, this.attackComplete, this);
            }
            else {
                this.attackComplete();
            }
        }
        else {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65" + (this.roleData.side + "_" + this.roleData.pos) + "\u653B\u51FB\u65F6\u6280\u80FD\u4E3A\u7A7A", fight.LOG_FIGHT_ERROR);
        }
    };
    p.attackComplete = function () {
        this.body.removeEventListener(egret.Event.COMPLETE, this.attackComplete, this);
        if (!this.isTriggerDamage) {
            this.triggerFrameMap = {};
            this.showHitEff();
        }
        if (fight.needRetreat(this.curSkill.action_type)) {
            this.retreat();
        }
        else {
            this.selfInjury();
        }
    };
    p.selfInjury = function () {
        var _this = this;
        if (this.updateHP(this.reportItem.hp, false)) {
            this.dispatchEventWith("role_one_step_complete", true);
            this.idle();
            egret.setTimeout(function () {
                _this.dispatchEventWith("role_die", true, _this);
            }, this, 1000);
        }
        else {
            this.idle();
        }
    };
    p.retreat = function () {
        var _this = this;
        var tween = egret.Tween.get(this);
        var point = fight.getRoleInitPoint(this.roleData);
        tween.to({ x: point.x, y: point.y }, fight.RETREAT_TIME);
        tween.call(function () { _this.selfInjury(); }, this);
    };
    /**
     * 更新目标数据
     */
    p.updateTargets = function () {
        for (var i = 0; i < this.reportItem.target.length; i++) {
            var role = this.fightContainer.getRoleByStr(this.reportItem.target[i].pos);
            role.updateHP(this.reportItem.target[i].hp);
        }
    };
    p.updateTarget = function (role, isAddHPEff) {
        if (isAddHPEff === void 0) { isAddHPEff = false; }
        var result = false;
        for (var i = 0; i < this.reportItem.target.length; i++) {
            if (this.reportItem.target[i].pos == fight.getRolePosDes(role)) {
                result = true;
                if (isAddHPEff) {
                    var off = BigNum.sub(this.reportItem.target[i].hp, role.roleData.curHP);
                    if (BigNum.greater(off, 0)) {
                        this.fightContainer.flyTxt({ str: MathUtil.easyNumber(off), x: role.x, y: role.y + role.roleData.config.modle_height * -1 }, FightFontEffEnum.ADD_HP);
                    }
                }
                role.updateHP(this.reportItem.target[i].hp);
                break;
            }
        }
        return result;
    };
    /**
     * 更新对象血量
     * @param hurt
     * @param needDispatcherEvent
     * @returns {boolean}
     */
    p.updateHP = function (hurt, needDispatcherEvent) {
        var _this = this;
        if (needDispatcherEvent === void 0) { needDispatcherEvent = true; }
        var die = false;
        this.roleData.curHP = hurt;
        this.roleData.curHP = BigNum.max(0, this.roleData.curHP);
        var ratio = +(BigNum.div(this.roleData.curHP, this.roleData.maxHP)) || 0;
        this.lifeBar.setRatio(ratio);
        if (BigNum.greaterOrEqual(0, this.roleData.curHP)) {
            fight.recordLog("\u89D2\u8272" + fight.getRolePosDes(this) + "\u6B7B\u4EA1", fight.LOG_FIGHT_ROLE_DIE);
            if (needDispatcherEvent) {
                egret.setTimeout(function () {
                    _this.dispatchEventWith("role_die", true, _this);
                }, this, 1000);
            }
            die = true;
        }
        return die;
    };
    p.onTick = function () {
        if (this.curSkill) {
            var currentFrame = this.body.currentFrame;
            var obj = FightRole.FRAME_EVENT_MAP;
            var frames_1 = Object.keys(obj);
            for (var i = frames_1.length; i--;) {
                var funName = obj[frames_1[i]];
                var triggerFrameArr = String(this.curSkill[frames_1[i]] || "").split(",");
                var triggerCount = triggerFrameArr.length;
                for (var j = 0; j < triggerCount; j++) {
                    var triggerFrame = +triggerFrameArr[j];
                    if (currentFrame == triggerFrame) {
                        if (this[funName]) {
                            if (!this.triggerFrameMap) {
                                this.triggerFrameMap = {};
                            }
                            if (!this.triggerFrameMap[triggerFrame]) {
                                this.triggerFrameMap[triggerFrame] = true;
                                this[funName](1 / triggerCount, j + 1 >= triggerCount);
                                break;
                            }
                        }
                    }
                }
            }
            var oneStepComplete = this.isIdle;
            for (var i = 0; i < this.targets.length; i++) {
                oneStepComplete = (oneStepComplete && (this.targets[i].waiting || !this.targets[i].parent));
            }
            if (oneStepComplete && !!this.triggerFrameMap && !this.isPlayingDamage) {
                this.nextStep();
            }
        }
        return false;
    };
    p.nextStep = function () {
        fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u5B8C\u6210", fight.LOG_FIGHT_STEP_START);
        this.curSkill = null;
        this.reportItem = null;
        this.targets = null;
        this.triggerFrameMap = null;
        this.isTriggerDamage = false;
        this.dispatchEventWith("role_one_step_complete", true);
    };
    p.reset = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.body.stop();
    };
    p.dispose = function () {
        this.curSkill = null;
        this.reportItem = null;
        this.targets = [];
        this.fightContainer = null;
        egret.stopTick(this.onTick, this);
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.body.stop();
    };
    FightRole.createMovieClip = function (name) {
        if (FightRole.inst == null) {
            FightRole.inst = new egret.MovieClipDataFactory();
        }
        var dataRes = RES.getRes(name + "_json");
        var textureRes = RES.getRes(name + "_png");
        FightRole.inst.mcDataSet = dataRes;
        FightRole.inst.texture = textureRes;
        return new egret.MovieClip(FightRole.inst.generateMovieClipData(name));
    };
    FightRole.FRAME_EVENT_MAP = {
        "jump_frame": "startJump",
        "damage_frame": "startDamage"
    };
    return FightRole;
}(egret.DisplayObjectContainer));
egret.registerClass(FightRole,'FightRole');
//# sourceMappingURL=FightRole.js.map