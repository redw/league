/**
 * 参与战斗的角色对象
 *
 * @author hh
 */
var FightRole = (function (_super) {
    __extends(FightRole, _super);
    function FightRole(fightContainer, roleData) {
        _super.call(this);
        this.waiting = false;
        this.isTriggerDamage = false; // 是否触发过伤害帧
        this.isPlayingDamage = false; // 是否正在播放伤害特效
        this.activeRole(fightContainer, roleData);
        this.initRole();
    }
    var d = __define,c=FightRole,p=c.prototype;
    p.activeRole = function (fightContainer, roleData) {
        this.fightContainer = fightContainer;
        this.roleData = roleData;
        egret.startTick(this.onTick, this);
    };
    p.initRole = function () {
        this.body = FightRole.createMovieClip(this.roleData.config.resource + "");
        this.addChild(this.body);
        this.lifeBar = new LifeBar(this.roleData.side === fight.SIDE_LEFT);
        this.lifeBar.x = -30;
        this.lifeBar.y = -(this.roleData.config.modle_height) - 10;
        this.addChild(this.lifeBar);
        this.updateHP(this.roleData.curHP);
        var point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;
        this.scaleX = (this.roleData.side == fight.SIDE_LEFT) ? -1 : 1;
        this.idle();
    };
    /**
     * 播放战斗报告
     *
     * @param data
     * @param delay
     */
    p.playFight = function (data, delay) {
        var _this = this;
        try {
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
        }
        catch (e) {
            console.error(e);
            this.updateTargets();
            this.nextStep();
        }
    };
    p.doAction = function () {
        var skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        // 如果被眩晕
        if (this.reportItem.vertigo) {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + this.reportItem.pos + " \u88AB\u7729\u6655", fight.LOG_FIGHT_STEP_START);
            this.triggerFrameMap = {};
            this.selfInjury();
        }
        else {
            var isAddHP = (this.curSkill.target_group == "friend");
            // 如果是加血
            if (isAddHP) {
                fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + this.reportItem.pos + " \u7ED9\u76EE\u6807\u52A0\u8840", fight.LOG_FIGHT_STEP_START);
                this.addHP();
            }
            else {
                // 如果是攻击
                var action = this.curSkill.action_type;
                fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + this.reportItem.pos + " " + action + "\u653B\u51FB\u76EE\u6807", fight.LOG_FIGHT_STEP_START);
                // 如果是移动攻击
                if (fight.needMoveAttack(action)) {
                    var targets = this.targets;
                    var point = fight.getNearFightPoint(targets[0].roleData);
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
    p.addHP = function () {
        var _this = this;
        var len = this.targets.length;
        if (!!this.curSkill.target_effect) {
            var count_1 = 0;
            for (var i = 0; i < len; i++) {
                var targetEff = new BaseMCEffect(this.curSkill.target_effect, i);
                targetEff.back = function (index) {
                    _this.updateTargetHP(_this.targets[index]);
                    count_1++;
                    if (count_1 >= len) {
                        _this.nextStep();
                    }
                };
                this.targets[i].addChild(targetEff);
            }
        }
        else {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u7684target_effect\u4E3A\u975E\u6CD5", fight.LOG_FIGHT_WARN);
            for (var i = 0; i < len; i++) {
                this.updateTargetHP(this.targets[i]);
            }
            this.nextStep();
        }
    };
    p.startDamage = function () {
        if (this.curSkill) {
            this.isTriggerDamage = true;
            var actionType = this.curSkill.action_type;
            if (actionType == "area") {
                this.showAreaEff();
            }
            else if (actionType == "missle") {
                this.showBulletEff();
            }
            else if (actionType == "turn") {
                this.showTurnEff();
            }
            else {
                this.showHitEff();
            }
        }
        else {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65startDamage\u65F6\u6280\u80FD\u4E3A\u7A7A", fight.LOG_FIGHT_ERROR);
        }
    };
    p.showAreaEff = function () {
        var _this = this;
        if (!this.curSkill.scource_effect) {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u8D44\u6E90scource_effect\u6CA1\u914D\u7F6E", fight.LOG_FIGHT_WARN);
            return;
        }
        this.isPlayingDamage = true;
        var damageEff = new BaseMCEffect(this.curSkill.scource_effect);
        var frame = Number(this.curSkill.effect_damage_frame);
        if (!frame) {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u7684\u4F24\u5BB3\u5E27\u914D\u7F6E\u6709\u8BEF", fight.LOG_FIGHT_WARN);
        }
        damageEff.registerFrameBack(function () {
            !_this.curSkill.scource_effect || SoundManager.inst.playEffect(URLConfig.getSoundURL(_this.curSkill.scource_effect));
            _this.isPlayingDamage = false;
            _this.showHitEff();
        }, frame);
        var offPoint = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
        if (this.roleData.side == fight.SIDE_LEFT) {
            damageEff.x = 360 + (Number(offPoint[0]) || 0);
            damageEff.y = 200 + (Number(offPoint[1]) || 0);
        }
        else {
            damageEff.x = 120 + (Number(offPoint[0]) || 0);
            damageEff.y = 200 + (Number(offPoint[1]) || 0);
        }
        this.fightContainer.addChild(damageEff);
    };
    p.showTurnEff = function () {
        var _this = this;
        if (!this.curSkill.scource_effect) {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u8D44\u6E90scource_effect\u6CA1\u914D\u7F6E", fight.LOG_FIGHT_WARN);
            return;
        }
        this.isPlayingDamage = true;
        var damageEff = new BaseMCEffect(this.curSkill.scource_effect, null, false);
        var frame = Number(this.curSkill.effect_damage_frame);
        if (!frame) {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u7684\u4F24\u5BB3\u5E27\u914D\u7F6E\u6709\u8BEF", fight.LOG_FIGHT_WARN);
        }
        damageEff.registerFrameBack(function () {
            !_this.curSkill.scource_effect || SoundManager.inst.playEffect(URLConfig.getSoundURL(_this.curSkill.scource_effect));
            _this.isPlayingDamage = false;
            _this.showHitEff();
            if (shape) {
                shape.parent.removeChild(shape);
            }
        }, frame);
        var offPoint = this.roleData.config.shoot_point || [0, 0];
        damageEff.x = this.x + (Number(offPoint.x) || 0);
        damageEff.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
        var targetPoint = new egret.Point();
        var outPoint = new egret.Point();
        if (this.roleData.side == fight.SIDE_LEFT) {
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
        var shape = new egret.Shape();
        shape.graphics.beginFill(0xf00);
        shape.graphics.drawCircle(0, 0, 10);
        shape.x = targetPoint.x;
        shape.y = targetPoint.y;
        this.fightContainer.addChild(shape);
        var angle = Math.atan2(targetPoint.y - damageEff.y, targetPoint.x - damageEff.x);
        outPoint.y = damageEff.y + (targetPoint.x - damageEff.x) * Math.tan(angle);
        // egret.Tween.get(damageEff).to({x:outPoint.x, y:outPoint.y}, 500).call(
        //     ()=>{
        //         this.showHitEff();
        //     }
        // );
        this.fightContainer.addChild(damageEff);
    };
    p.showBulletEff = function () {
        var _this = this;
        var len = this.targets.length;
        var _loop_1 = function(i) {
            var target = this_1.targets[i];
            var damageEff = new BaseMCEffect(this_1.curSkill.scource_effect, null, false);
            var offPoint = this_1.roleData.config.shoot_point || [0, 0];
            damageEff.x = this_1.x + (Number(offPoint.x) || 0);
            damageEff.y = this_1.y - this_1.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
            var tox = target.x;
            var toy = target.y - (target.roleData.config.modle_height * 0.5);
            egret.Tween.get(damageEff).to({ x: tox, y: toy }, 200).call(function () {
                damageEff.dispose();
                _this.showHitEff();
            });
            this_1.fightContainer.addChild(damageEff);
        };
        var this_1 = this;
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
    };
    p.showHitEff = function () {
        var len = this.targets.length;
        fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u5C55\u793A\u53D7\u51FB\u6548\u679C");
        for (var i = 0; i < len; i++) {
            var target = this.targets[i];
            var hitInfo = this.reportItem.target[i];
            var hurt = MathUtil.easyNumber(hitInfo.damage);
            var isBlock = hitInfo.block;
            var isDodge = hitInfo.dodge;
            if (!!this.curSkill.target_effect) {
                var targetEff = new BaseMCEffect(this.curSkill.target_effect);
                targetEff.y = (target.roleData.config.modle_height) * -0.5;
                target.addChild(targetEff);
            }
            if (isDodge) {
                target.flyFont("闪避");
            }
            else {
                if (isBlock) {
                    target.block();
                }
                else {
                    target.hit();
                }
                !!this.curSkill.target_sound || SoundManager.inst.playEffect(URLConfig.getSoundURL(this.curSkill.target_sound));
                if (parseFloat(hurt) > 0) {
                    fight.addHurtText(target, hurt, { y: -60, x: -10 });
                }
                else {
                    if (hitInfo.invincible) {
                        target.flyFont("无敌");
                    }
                    else if (hitInfo.isFreeMagicAtk) {
                        target.flyFont("魔免");
                    }
                    else if (hitInfo.isFreePhysicalAtk) {
                        target.flyFont("物免");
                    }
                    else {
                        fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272" + hitInfo.pos + "\u53D7\u51FB\u4F24\u5BB3\u4E3A" + hurt, 50);
                    }
                }
            }
            target.updateHP(hitInfo.hp);
        }
    };
    p.flyFont = function (content) {
        var hurtEff = new HurtFontEff();
        hurtEff.y = -50;
        hurtEff.scaleX = this.scaleX;
        this.addChild(hurtEff);
        hurtEff.show(content);
    };
    p.startJump = function () {
        var target = this.targets[0];
        if (target) {
            var point = fight.getNearFightPoint(target.roleData);
            var tween = egret.Tween.get(this);
            var frameCount = this.curSkill.damage_frame - this.curSkill.jump_frame;
            var frameRate = 24;
            var time = frameCount / frameRate * 1000;
            tween.to({ x: point.x, y: point.y }, time);
        }
        else {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u8DF3\u8DC3\u653B\u51FB\u65F6,\u76EE\u6807\u4E0D\u80FD\u4E3A\u7A7A,\u68C0\u6D4B\u8DF3\u8DC3\u5E27\u7684\u914D\u7F6E", 100);
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
            this.flyFont("格档");
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
            if (fight.playFrameLabel(this.curSkill.action, this.body, 1, this.roleData.config.resource)) {
                this.body.addEventListener(egret.Event.COMPLETE, this.attackComplete, this);
            }
            else {
                this.attackComplete();
            }
        }
        else {
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65" + (this.roleData.side + "_" + this.roleData.pos) + "\u653B\u51FB\u51FA\u9519", 100);
        }
    };
    p.attackComplete = function () {
        this.body.removeEventListener(egret.Event.COMPLETE, this.attackComplete, this);
        // 攻击完成后,一定要触发伤害
        this.triggerFrameMap = {};
        if (!this.isTriggerDamage) {
            this.showHitEff();
        }
        if (fight.needMoveAttack(this.curSkill.action_type)) {
            this.retreat();
        }
        else {
            this.selfInjury();
        }
    };
    p.selfInjury = function () {
        if (this.updateHP(this.reportItem.hp, false)) {
            this.dispatchEventWith("role_one_step_complete", true);
            this.dispatchEventWith("role_die", true, this);
        }
        else {
            this.idle();
        }
    };
    p.retreat = function () {
        var _this = this;
        var tween = egret.Tween.get(this);
        var point = fight.getRoleInitPoint(this.roleData);
        tween.to({ x: point.x, y: point.y }, fight.RETREAT_TIME).call(this.idle, this);
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
    /**
     * 更新对象血量
     * @param hurt
     * @param needDispatcherEvent
     * @returns {boolean}
     */
    p.updateHP = function (hurt, needDispatcherEvent) {
        if (needDispatcherEvent === void 0) { needDispatcherEvent = true; }
        var die = false;
        this.roleData.curHP = hurt;
        this.roleData.curHP = BigNum.max(0, this.roleData.curHP);
        var ratio = +(BigNum.div(this.roleData.curHP, this.roleData.maxHP)) || 0;
        this.lifeBar.setRatio(ratio);
        if (BigNum.greaterOrEqual(0, this.roleData.curHP)) {
            fight.recordLog("\u89D2\u8272" + fight.getRolePosDes(this) + "\u6B7B\u4EA1", fight.LOG_FIGHT_ROLE_DIE);
            this.curSkill && (!!this.curSkill.dead_sound || SoundManager.inst.playEffect(URLConfig.getSoundURL(this.curSkill.dead_sound)));
            if (needDispatcherEvent) {
                this.dispatchEventWith("role_die", true, this);
            }
            die = true;
        }
        return die;
    };
    p.updateTargetHP = function (role) {
        var result = false;
        for (var i = 0; i < this.reportItem.target.length; i++) {
            if (this.reportItem.target[i].pos == fight.getRolePosDes(role)) {
                result = true;
                role.updateHP(this.reportItem.target[i].hp);
                break;
            }
        }
    };
    p.onTick = function () {
        if (this.curSkill) {
            var currentFrame = this.body.currentFrame;
            var obj = FightRole.FRAME_EVENT_MAP;
            var frames_1 = Object.keys(obj);
            for (var i = frames_1.length; i--;) {
                var triggerFrame = this.curSkill[frames_1[i]];
                if (currentFrame == triggerFrame) {
                    var funName = obj[frames_1[i]];
                    if (this[funName]) {
                        if (!this.triggerFrameMap) {
                            this.triggerFrameMap = {};
                        }
                        if (!this.triggerFrameMap[frames_1[i]]) {
                            this.triggerFrameMap[frames_1[i]] = true;
                            this[funName]();
                            break;
                        }
                    }
                    else {
                        console.error(frames_1[i] + "没有对应的触发函数");
                    }
                }
            }
            var oneStepComplete = this.isIdle;
            for (var i = 0; i < this.targets.length; i++) {
                oneStepComplete = (oneStepComplete && (this.targets[i].isIdle || !this.targets[i].parent));
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
        // TODO 待优化
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
