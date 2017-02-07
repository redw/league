/**
 * 战斗角色
 * @author hh
 */
var FightRole = (function (_super) {
    __extends(FightRole, _super);
    function FightRole(fightContainer, roleData) {
        _super.call(this);
        // 角色的zIndex,处理角色在角色容器中的顺序
        this._zIndex = 0;
        // 是否正在待机
        this._waiting = true;
        // 角色触发伤害帧信息
        this.triggerFrameMap = null;
        // 目标对象
        this.targets = null;
        // 攻击或伤害时使用的技能
        this.curSkill = null;
        // 角色的信息
        this.roleData = null;
        // 战斗信息
        this.reportItem = null;
        // 是否触发过伤害帧
        this.isTriggerDamage = false;
        // 是否正在播放行为(攻击,技能...)
        this.isPlayingAction = false;
        // 是正在播放伤害效果
        this.isPlayingDamage = false;
        // 正在播放死效果
        this.isPlayingDie = false;
        // 正在播放技能音效
        this.isPlayingSkillSound = false;
        // 血条
        this.lifeBar = null;
        // 角色显示对象
        this.body = null;
        // 角色所在的容器
        this.fightContainer = null;
        // 作用于身体脚下的buff容器
        this.buffContainer0 = null;
        // 作用于身体中间的buff容器
        this.buffContainer1 = null;
        // 作用于身体头部的buff容器
        this.buffContainer2 = null;
        // 除buff外的效果容器
        this.effContainer = null;
        // buff效果map
        this.buffEffMap = {};
        this.buffIdArr = [];
        this.oldBuffIdArr = [];
        this.effTimer = -1;
        this.firedHitMap = {};
        this.firedBulletCount = 0;
        this.active(fightContainer, roleData);
        this.initRole();
    }
    var d = __define,c=FightRole,p=c.prototype;
    p.active = function (fightContainer, roleData) {
        this.fightContainer = fightContainer;
        this.roleData = roleData;
        if (this.roleData.config == null) {
            this.roleData.config = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
        }
        var point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;
        if (this.lifeBar) {
            this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2;
            this.lifeBar.active();
            // this.updateHP(this.curHP);
            this.body.scaleX = (this.roleData.side == FightSideEnum.RIGHT_SIDE) ? 1 : -1;
            this.buffContainer2.y = -this.roleData.config.modle_height;
            this.buffContainer1.y = -0.5 * this.roleData.config.modle_height;
            var shadowScaleSize = this.roleData.config.modle_height / 100;
            this.shadowBitmap.scaleX = this.shadowBitmap.scaleY = shadowScaleSize;
            this.shadowBitmap.y = fight.ROLE_SHADOW_OFF * shadowScaleSize;
            this.shadowBitmap.x = this.shadowBitmap.width * -0.5 * shadowScaleSize;
        }
        egret.startTick(this.onTick, this);
    };
    p.initRole = function () {
        this.shadowBitmap = new egret.Bitmap(RES.getRes("role_shadow_png"));
        var shadowScaleSize = this.roleData.config.modle_height / 100;
        this.shadowBitmap.scaleX = this.shadowBitmap.scaleY = shadowScaleSize;
        this.shadowBitmap.y = fight.ROLE_SHADOW_OFF * shadowScaleSize;
        this.shadowBitmap.x = this.shadowBitmap.width * -0.5 * shadowScaleSize;
        this.addChild(this.shadowBitmap);
        this.buffContainer0 = new egret.DisplayObjectContainer();
        this.addChild(this.buffContainer0);
        this.body = FightRole.createMovieClip(this.roleData.config.resource + "");
        this.addChild(this.body);
        this.body.scaleX = (this.roleData.side == FightSideEnum.RIGHT_SIDE) ? 1 : -1;
        this.buffContainer1 = new egret.DisplayObjectContainer();
        this.buffContainer1.y = -0.5 * this.roleData.config.modle_height;
        this.addChild(this.buffContainer1);
        this.buffContainer2 = new egret.DisplayObjectContainer();
        this.buffContainer2.y = -this.roleData.config.modle_height;
        this.addChild(this.buffContainer2);
        this.effContainer = new egret.DisplayObjectContainer();
        this.addChild(this.effContainer);
        this.lifeBar = new RoleHPBar(this.roleData.side);
        this.addChild(this.lifeBar);
        this.lifeBar.x = RoleHPBar.WIDTH * -0.5;
        this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2;
        this.lifeBar.active();
        // this.updateHP(this.curHP);
        this.idle();
    };
    p.fight = function (data, delay) {
        this.reportItem = data;
        var items = data.target;
        this.updateRoleHP(BigNum.add(data.hp, data.damage || 0), data.maxhp);
        this.addBuff(data);
        this.targets = [];
        for (var i = 0; i < items.length; i++) {
            var id = items[i].id;
            var side = +items[i].pos.substr(0, 1);
            var pos = +items[i].pos.substr(2, 1);
            var point = fight.getRoleInitPoint({ side: side, pos: pos });
            var config = Config.HeroData[id] || Config.EnemyData[id];
            this.targets.push({ side: side, pos: pos, id: id, height: config.modle_height, x: point.x, y: point.y });
        }
        var skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        if (this.reportItem.vertigo) {
            this.triggerFrameMap = {};
            this.selfInjury();
        }
        else {
            if (this.targets.length == 0) {
                this.nextStep();
            }
            else {
                egret.setTimeout(this.showSkillEff, this, delay);
            }
        }
    };
    p.showSkillEff = function () {
        this.firedHitMap = {};
        this.firedBulletCount = 0;
        this.isPlayingSkillSound = false;
        var showInfo = (this.curSkill.skill_free_effect || "").split(",");
        var needMode = !!showInfo[1];
        var source = showInfo[0];
        if (this.curSkill.skill_name) {
            this.fightContainer.showSkillFlyTxt("skillname_" + this.curSkill.skill_name);
        }
        if (source && source != "0") {
            var eff = new MCEff(source);
            eff.registerBack(0, this.doAction, this, null);
            eff.y = (this.roleData.config.modle_height) * -0.5;
            this.fightContainer.showFreeSkillEff(this, eff, needMode);
        }
        else {
            this.doAction();
        }
    };
    p.doAction = function () {
        fight.verifyActiveSkill(this.curSkill);
        if (this.reportItem) {
            var action = this.curSkill.action_type;
            fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u89D2\u8272id" + this.reportItem.id + " \u4F4D\u7F6E" + this.reportItem.pos + " " + action + "\u653B\u51FB\u76EE\u6807", fight.LOG_FIGHT_PLAY);
            // this.fightContainer.bringRoleToFront(this, this.targets);
            if (fight.needMoveAttack(action)) {
                this._waiting = false;
                var point = fight.getNearFightPoint(this, this.targets, this.curSkill);
                this.fightContainer.showMoveDustEff({ x: this.x, y: this.y, side: this.roleData.side });
                var tween = egret.Tween.get(this);
                tween.to({ x: point.x, y: point.y }, fight.MOVE_TIME);
                tween.call(this.attack, this);
            }
            else {
                this.attack();
            }
        }
        else {
            fight.recordLog("\u6218\u6597\u6B65\u9AA4\u63D0\u524D\u8DF3\u8FC7\u4E86", fight.LOG_FIGHT_WARN);
        }
    };
    p.startJump = function () {
        if (this.targets && this.targets.length > 0 && this.curSkill) {
            var point = new egret.Point();
            if (this.curSkill.action_type == fight.ATTACK_ACTION_JUMP_AREA) {
                var offPoint = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
                point.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
                point.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            }
            else {
                point = fight.getNearFightPoint(this, this.targets, this.curSkill);
            }
            var tween = egret.Tween.get(this);
            var frameCount = +this.curSkill.damage_frame - this.curSkill.jump_frame;
            var frameRate = this.body.frameRate || 24;
            var time = frameCount / frameRate * 1000;
            this.fightContainer.showMoveDustEff({ x: this.x, y: this.y, side: this.roleData.side });
            tween.to({ x: point.x, y: point.y }, time);
        }
        else {
            fight.recordLog("startJump时,targets没有目标", fight.LOG_FIGHT_WARN);
        }
    };
    p.startDamage = function (index, total) {
        if (this.curSkill) {
            var actionType = this.curSkill.action_type;
            this.isTriggerDamage = true;
            if (actionType == fight.ATTACK_ACTION_AREA) {
                this.showAreaEff();
            }
            else if (actionType == fight.ATTACK_ACTION_MISSLE) {
                this.showBulletEff();
            }
            else if (actionType == fight.ATTACK_ACTION_TURN) {
                this.showTurnEff();
            }
            else if (actionType == fight.ATTACK_ACTION_BOMB) {
                this.showBombEff();
            }
            else {
                if (fight.isAddHPSkill(this.curSkill)) {
                    this.showAddHPEff();
                }
                else {
                    this.fightContainer.startShake(this.curSkill.shake_type);
                    this.showHitEff(index, total);
                }
            }
        }
        else {
            fight.recordLog("\u4F24\u5BB3\u65F6\u6280\u80FD\u4E0D\u80FD\u4E3A\u7A7A", fight.LOG_FIGHT_WARN);
        }
    };
    p.showAreaEff = function () {
        var _this = this;
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            var damageEff = new MCEff(this.curSkill.scource_effect);
            var frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            var total_1 = frameArr.length;
            var current_1 = 0;
            for (var i = 0; i < total_1; i++) {
                damageEff.registerBack(+frameArr[i], function () {
                    if (_this.curSkill) {
                        // fight.playSound(this.curSkill.scource_sound);
                        current_1++;
                        _this.isPlayingDamage = current_1 < total_1;
                        fight.recordLog("\u663E\u793Aarea\u6548\u679C" + current_1 + "-" + total_1, fight.LOG_FIGHT_INFO);
                        _this.fightContainer.startShake(_this.curSkill.shake_type);
                        _this.showHitEff(current_1, total_1);
                    }
                    else {
                        fight.recordLog("\u8FD0\u884CshowArea\u65F6curSkill\u4E3Anull", fight.LOG_FIGHT_WARN);
                    }
                }, this);
            }
            var offPoint = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
            damageEff.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
            damageEff.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            this.fightContainer.showAreaEff(damageEff, this);
        }
    };
    p.showBulletEff = function () {
        if (this.checkDamageEff()) {
            var len_1 = this.targets.length;
            var delay = 0;
            var self_1 = this;
            var damageEffSource_1 = this.curSkill.scource_effect;
            var damageEffSourceArr = (this.curSkill.scource_effect).split(",");
            var damageFrameArr_1 = String(this.curSkill.damage_frame).split(",");
            var bulletCount_1 = +damageEffSourceArr[1] || 1;
            this.isPlayingDamage = true;
            function attack() {
                var _loop_1 = function(i) {
                    var target = self_1.targets[i];
                    var fightRole = self_1.fightContainer.getRole(self_1.targets[i]);
                    var tox = target.x;
                    var toy = target.y - target.height * 0.5;
                    var offPoint = self_1.curSkill.shoot_point || [0, 0];
                    var scaleX = self_1.side == FightSideEnum.LEFT_SIDE ? -1 : 1;
                    var initX = self_1.x - scaleX * (Number(offPoint[0]) || 0);
                    var initY = self_1.y - self_1.roleData.config.modle_height * 0.5 + (Number(offPoint[1]) || 0);
                    var rotate = Math.atan2(toy - initY, tox - initX) * 180 / Math.PI + ((scaleX == 1) ? 180 : 0);
                    var damageEff = new BaseMCEffect(damageEffSource_1, null, false, scaleX);
                    damageEff.rotation = rotate;
                    self_1.fightContainer.showDamageEff(damageEff);
                    damageEff.x = initX;
                    damageEff.y = initY;
                    var time = self_1.curSkill.missle_time * 1000 * MathUtil.pointDistance(new egret.Point(tox, toy), new egret.Point(initX, initY)) / 100;
                    egret.Tween.get(damageEff).to({ x: tox, y: toy }, time, fight.bulletEase(time)).call(function () {
                        damageEff.dispose();
                        if (self_1.curSkill) {
                            self_1.firedHitMap[target.pos] = (self_1.firedHitMap[target.pos] || 0) + 1;
                            self_1.fightContainer.startShake(self_1.curSkill.shake_type);
                            self_1.showHitEff(self_1.firedHitMap[target.pos], bulletCount_1 * damageFrameArr_1.length, fightRole);
                            self_1.firedBulletCount++;
                            self_1.isPlayingDamage = self_1.firedBulletCount < len_1 * bulletCount_1 * damageFrameArr_1.length;
                            fight.recordLog("\u663E\u793A\u5B50\u5F39\u6548\u679C" + fight.getRolePosDes(target) + " " + self_1.firedBulletCount + "-" + len_1 * bulletCount_1 * damageFrameArr_1.length, fight.LOG_FIGHT_INFO);
                        }
                        else {
                            fight.recordLog("\u8FD0\u884CshowBullet\u65F6curSkill\u4E3Anull", fight.LOG_FIGHT_WARN);
                        }
                    });
                };
                for (var i = 0; i < len_1; i++) {
                    _loop_1(i);
                }
            }
            for (var i = 0; i < bulletCount_1; i++) {
                egret.setTimeout(attack, this, delay, []);
                delay += fight.BULLET_RUN_DELAY_TIME;
            }
        }
    };
    p.showTurnEff = function () {
        var _this = this;
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            var damageEff_1 = new MCEff(this.curSkill.scource_effect, false);
            var frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            var total_2 = frameArr.length;
            var current_2 = 0;
            for (var i = 0; i < total_2; i++) {
                damageEff_1.registerBack(+frameArr[i], function () {
                    if (_this.curSkill) {
                        // fight.playSound(this.curSkill.scource_sound);
                        current_2++;
                        _this.fightContainer.startShake(_this.curSkill.shake_type);
                        fight.recordLog("\u663E\u793Aturn\u6548\u679C" + current_2 + "-" + total_2, fight.LOG_FIGHT_INFO);
                        _this.showHitEff(current_2, total_2);
                    }
                    else {
                        fight.recordLog("\u8FD0\u884CshowTurn\u65F6curSkill\u4E3Anull", fight.LOG_FIGHT_WARN);
                    }
                }, this);
            }
            var offPoint = this.curSkill.shoot_point || [0, 0];
            damageEff_1.x = this.x + (Number(offPoint[0]) || 0);
            damageEff_1.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint[1]) || 0);
            var targetPoint = new egret.Point();
            var outPoint = new egret.Point();
            if (this.roleData.side == FightSideEnum.LEFT_SIDE) {
                targetPoint.x = 360;
                targetPoint.y = 330;
                outPoint.x = 580;
            }
            else {
                targetPoint.x = 120;
                targetPoint.y = 330;
                outPoint.x = -100;
            }
            var angle = Math.atan2(targetPoint.y - damageEff_1.y, targetPoint.x - damageEff_1.x);
            damageEff_1.rotation = angle * 180 / Math.PI;
            outPoint.y = damageEff_1.y + (targetPoint.x - damageEff_1.x) * Math.tan(angle);
            egret.Tween.get(damageEff_1).to({ x: outPoint.x, y: outPoint.y }, 500).call(function () {
                damageEff_1.dispose();
                _this.isPlayingDamage = false;
            }, this);
            this.fightContainer.showDamageEff(damageEff_1, this);
        }
    };
    p.showBombEff = function () {
        var _this = this;
        if (this.checkDamageEff()) {
            var total = this.targets.length;
            var frame = +(this.curSkill.effect_damage_frame);
            var _loop_2 = function(i) {
                var fightRole = this_1.fightContainer.getRole(this_1.targets[i]);
                if (fightRole) {
                    var damageEff = new MCEff(this_1.curSkill.scource_effect);
                    fightRole.isPlayingDamage = true;
                    damageEff.registerBack(frame, function () {
                        if (_this.curSkill) {
                            // fight.playSound(this.curSkill.scource_sound);
                            _this.fightContainer.startShake(_this.curSkill.shake_type);
                        }
                        fightRole.isPlayingDamage = false;
                        _this.showHitEff();
                    }, this_1);
                    fightRole.addEff(damageEff);
                }
            };
            var this_1 = this;
            for (var i = 0; i < total; i++) {
                _loop_2(i);
            }
        }
    };
    p.showAddHPEff = function () {
        var _this = this;
        if (this.curSkill) {
            var total_3 = this.targets.length;
            if (this.curSkill.target_effect) {
                var current_3 = 0;
                var _loop_3 = function(i) {
                    var target = this_2.targets[i];
                    var fightRole = this_2.fightContainer.getRole(target);
                    if (fightRole) {
                        fightRole.isPlayingDamage = true;
                        var eff = new MCEff(this_2.curSkill.target_effect);
                        eff.registerBack(0, function (index) {
                            var target = _this.targets[index];
                            var off = BigNum.sub(_this.reportItem.target[index].hp, fightRole.roleData.curHP);
                            if (BigNum.greater(off, 0)) {
                                _this.fightContainer.flyTxt({ str: MathUtil.easyNumber(off), x: target.x, y: target.y + target.height * -1 }, fight.FONT_ADD_HP);
                            }
                            fightRole.isPlayingDamage = false;
                            fightRole.updateRoleHP(_this.reportItem.target[i].hp, _this.reportItem.target[i].maxhp);
                            current_3++;
                            fight.recordLog("\u663E\u793A\u52A0\u8840\u6548\u679C" + current_3 + "-" + total_3, fight.LOG_FIGHT_INFO);
                        }, this_2, i);
                        fightRole.addChild(eff);
                    }
                };
                var this_2 = this;
                for (var i = 0; i < this.targets.length; i++) {
                    _loop_3(i);
                }
            }
            else {
                fight.recordLog(this.curSkill.id + "\u6CA1\u914D\u7F6Etarget_effect", fight.LOG_FIGHT_WARN);
            }
        }
        else {
            fight.recordLog("\u8FD0\u884CshowAddHP\u65F6curSkill\u4E3Anull", fight.LOG_FIGHT_WARN);
        }
    };
    p.showHitEff = function (index, total, role) {
        if (index === void 0) { index = 1; }
        if (total === void 0) { total = 1; }
        if (role === void 0) { role = null; }
        if (this.targets.length > 0) {
            fight.playSound(this.curSkill.target_sound);
        }
        for (var i = 0; i < this.targets.length; i++) {
            var target = this.targets[i];
            var fightRole = this.fightContainer.getRole(target);
            if (fightRole && (!role || fightRole == role)) {
                var hitInfo = this.reportItem.target[i];
                fightRole.addBuff(hitInfo, true);
                var damage = BigNum.mul(hitInfo.damage, 1 / total);
                var damageNum = MathUtil.easyNumber(damage);
                if (this.curSkill.target_effect_normal) {
                    var eff = new MCEff("hit_normal");
                    eff.y = target.y + (target.height) * -0.5;
                    eff.x = target.x;
                    this.fightContainer.showDamageEff(eff, fightRole);
                }
                if (this.curSkill.target_effect) {
                    var eff = new MCEff(this.curSkill.target_effect);
                    eff.y = target.y + (target.height) * -0.5;
                    eff.x = target.x;
                    this.fightContainer.showDamageEff(eff, fightRole);
                }
                if (hitInfo.dodge) {
                    this.fightContainer.flyTxt({ str: "闪避", x: target.x, y: target.y + target.height * -1 }, fight.FONT_SYSTEM);
                }
                else {
                    if (hitInfo.block) {
                        fightRole.block();
                    }
                    else {
                        fightRole.hit();
                    }
                    if (parseFloat(damageNum) > 0) {
                        if (this.curSkill.damage_type == "physical") {
                            this.fightContainer.flyTxt({ str: damageNum, x: target.x, y: target.y + target.height * -1, scale: this.reportItem.cri ? 1.5 : 1 }, fight.FONT_PHYSICAL_DAMAGE);
                        }
                        else {
                            this.fightContainer.flyTxt({ str: damageNum, x: target.x, y: target.y + target.height * -1, scale: this.reportItem.cri ? 1.5 : 1 }, fight.FONT_MAGICAL_DAMAGE);
                        }
                    }
                    else {
                        if (hitInfo.invincible) {
                            this.fightContainer.flyTxt({ str: "免伤", x: target.x, y: target.y + this.roleData.config.modle_height * -1 }, fight.FONT_SYSTEM);
                        }
                        else if (hitInfo.isFreeMagicAtk) {
                            this.fightContainer.flyTxt({ str: "魔免", x: target.x, y: target.y + this.roleData.config.modle_height * -1 }, fight.FONT_SYSTEM);
                        }
                        else if (hitInfo.isFreePhysicalAtk) {
                            this.fightContainer.flyTxt({ str: "物免", x: target.x, y: target.y + this.roleData.config.modle_height * -1 }, fight.FONT_SYSTEM);
                        }
                        else {
                            if (this.curSkill.damage_type == "physical") {
                                damage = BigNum.max(BigNum.div(this.reportItem.phyAtk, 1000), 1);
                                damageNum = MathUtil.easyNumber(damage);
                                this.fightContainer.flyTxt({ str: damageNum, x: target.x, y: target.y + target.height * -1, scale: this.reportItem.cri ? 1.5 : 1 }, fight.FONT_PHYSICAL_DAMAGE);
                            }
                            else {
                                damage = BigNum.max(BigNum.div(this.reportItem.magAtk, 1000), 1);
                                damageNum = MathUtil.easyNumber(damage);
                                this.fightContainer.flyTxt({ str: damageNum, x: target.x, y: target.y + target.height * -1, scale: this.reportItem.cri ? 1.5 : 1 }, fight.FONT_MAGICAL_DAMAGE);
                            }
                        }
                    }
                }
                if (index >= total) {
                    fightRole.updateRoleHP(hitInfo.hp, hitInfo.maxhp);
                }
                else {
                    fightRole.updateRoleHP(BigNum.add(hitInfo.hp, BigNum.mul((total - index) / total, damage)), hitInfo.maxhp);
                }
            }
        }
    };
    p.updateTargets = function () {
        if (this.reportItem) {
            var len = this.targets ? this.targets.length : 0;
            for (var i = 0; i < len; i++) {
                var role = this.fightContainer.getRole(this.targets[i]);
                var hitInfo = this.reportItem.target[i];
                if (role) {
                    role.updateRoleHP(hitInfo.hp, hitInfo.maxhp);
                }
            }
        }
    };
    p.updateRoleHP = function (cur, max) {
        this.maxHP = max;
        this.curHP = cur;
        this.lifeBar.update(this.curHP, this.maxHP);
        this.dispatchEventWith("role_hp_change", true);
    };
    /**
     * 角色升级效果
     */
    p.showUPLevelEff = function (value) {
        if (this.roleData.side == FightSideEnum.LEFT_SIDE) {
            if (value && value.level > this.roleData.level) {
                var eff = new MCEff("lvl_up");
                this.effContainer.addChild(eff);
            }
        }
    };
    p.addEff = function (dis, part, off) {
        if (part === void 0) { part = 1; }
        if (off === void 0) { off = null; }
        var position = new egret.Point(0, (0 - part) * this.roleData.config.modle_height * 0.5);
        if (off) {
            position.x += off.x;
            position.y += off.y;
        }
        dis.x = position.x;
        dis.y = position.y;
        this.addChild(dis);
    };
    p.checkDamageEff = function () {
        var result = true;
        if (!this.curSkill || !this.curSkill.scource_effect) {
            fight.recordLog("\u6280\u80FD" + this.curSkill.id + "\u8D44\u6E90source_effect\u6CA1\u914D\u7F6E", fight.LOG_FIGHT_WARN);
            result = false;
        }
        return result;
    };
    p.idle = function () {
        this._waiting = true;
        fight.playFrameLabel("idle", this.body, -1, this.roleData.config.id);
    };
    p.hit = function () {
        this._waiting = false;
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
        if (this.lifeBar.isCanRemove) {
            this.checkDie();
        }
    };
    p.block = function () {
        this._waiting = false;
        if (fight.playFrameLabel("block", this.body, 1, this.roleData.config.id)) {
            if (this.fightContainer) {
                this.fightContainer.flyTxt({ str: "格挡", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, fight.FONT_SYSTEM);
            }
            else {
                fight.recordLog("格挡时没有this.fightContainer", fight.LOG_FIGHT_WARN);
            }
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
        egret.Tween.removeTweens(this);
        if (this.curSkill) {
            this._waiting = false;
            this.isPlayingAction = true;
            if (fight.playFrameLabel(this.curSkill.action, this.body, 1, this.roleData.config.resource)) {
                this.body.addEventListener(egret.Event.COMPLETE, this.attackComplete, this);
            }
            else {
                this.attackComplete();
            }
        }
        else {
        }
    };
    p.attackComplete = function () {
        this.isPlayingAction = false;
        // this.fightContainer.bringRoleToSelfZPos(this, this.targets);
        this.body.removeEventListener(egret.Event.COMPLETE, this.attackComplete, this);
        if (this.triggerFrameMap) {
            if (this.curSkill.damage_frame) {
                var damageFrameArr = String(this.curSkill.damage_frame).split(",");
                var total = damageFrameArr.length;
                for (var i = 0; i < total; i++) {
                    var key = damageFrameArr[i];
                    if (!this.triggerFrameMap[key]) {
                        this.startDamage(i + 1, total);
                    }
                }
            }
        }
        if (!this.isTriggerDamage) {
            this.triggerFrameMap = {};
            this.isPlayingDamage = false;
            this.updateTargets();
            var len = this.targets.length;
            for (var i = 0; i < len; i++) {
                var fightRole = this.fightContainer.getRole(this.targets[i]);
                if (fightRole)
                    fightRole.hit();
            }
        }
        if (this.curSkill) {
            if (fight.needRetreat(this.curSkill.action_type)) {
                this.retreat();
            }
            else {
                this.selfInjury();
            }
        }
    };
    p.selfInjury = function () {
        if (this.reportItem) {
            if (BigNum.greater(this.reportItem.damage || 0, 0)) {
                this.updateRoleHP(this.reportItem.hp, this.reportItem.maxhp);
                this.hit();
            }
            else {
                this.updateRoleHP(this.reportItem.hp, this.reportItem.maxhp);
                this.idle();
            }
        }
        else {
            fight.recordLog("\u81EA\u6B8B\u65F6reportItem\u4E0D\u80FD\u4E3Anull", fight.LOG_FIGHT_WARN);
        }
    };
    p.retreat = function () {
        var _this = this;
        this._waiting = false;
        var tween = egret.Tween.get(this);
        var point = fight.getRoleInitPoint(this.roleData);
        tween.to({ x: point.x, y: point.y }, fight.RETREAT_TIME);
        tween.call(function () { _this.selfInjury(); }, this);
    };
    // 攻击翻倍
    p.doubleAtk = function () {
        this.fightContainer.flyTxt({ str: "攻击翻倍", x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, fight.FONT_SYSTEM);
    };
    // 恢复血量
    p.recoveryBlood = function () {
        var eff = new MCEff(fight.RES_PROP_WITH_3);
        eff.x = 0;
        eff.y = 0;
        this.fightContainer.showEff(this.effContainer, eff, this);
    };
    p.addBuff = function (item, force) {
        if (force === void 0) { force = false; }
        var isSelf = "target" in item;
        var canAdd = isSelf || force;
        if (canAdd) {
            this.buffIdArr = item.buff.filter(function (value) {
                if (value && Config.BuffData[value])
                    return Config.BuffData[value].id;
            });
            var buffArr = this.buffIdArr || [];
            var keys = Object.keys(this.buffEffMap);
            for (var i = 0; i < buffArr.length; i++) {
                var buffConfig = Config.BuffData[buffArr[i]];
                if (buffConfig) {
                    var type = buffConfig.effect + "";
                    if (keys.indexOf(type) < 0 && buffConfig.resource && fight.isMCResourceLoaded(buffConfig.resource) && !this.buffEffMap[type]) {
                        var eff = new MCEff(buffConfig.resource, false);
                        var container = this["buffContainer" + buffConfig.point];
                        container.addChild(eff);
                        this.buffEffMap[type] = eff;
                    }
                }
            }
            var nowBuffIdArr = this.buffIdArr.concat();
            for (var i = 0; i < this.oldBuffIdArr.length; i++) {
                if (this.oldBuffIdArr.indexOf(nowBuffIdArr[i]) >= 0) {
                    nowBuffIdArr.splice(i, 1);
                    i--;
                }
            }
            for (var i = 0; i < nowBuffIdArr.length; i++) {
                var buffConfig = Config.BuffData[nowBuffIdArr[i]];
                if (buffConfig && buffConfig.word && this.fightContainer) {
                    this.fightContainer.flyTxt({ str: buffConfig.word, x: this.x, y: this.y + this.roleData.config.modle_height * -1 }, fight.FONT_SYSTEM);
                }
            }
            this.oldBuffIdArr = this.buffIdArr.concat();
        }
    };
    p.checkBuff = function () {
        var keys = Object.keys(this.buffEffMap);
        var len = keys.length;
        for (var i = 0; i < len; i++) {
            var type = keys[i];
            var exist = false;
            for (var j = 0; j < this.buffIdArr.length; j++) {
                var buffConfig = Config.BuffData[this.buffIdArr[j]];
                if (buffConfig.effect == type) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                var eff = this.buffEffMap[type];
                if (eff) {
                    eff.dispose();
                }
                else {
                    fight.recordLog("buff可能出错了", fight.LOG_FIGHT_WARN);
                }
                delete this.buffEffMap[type];
                len--;
                i--;
            }
        }
    };
    p.onTick = function () {
        var currentFrame = this.body.currentFrame;
        this.checkBuff();
        if (this.body.movieClipData && !this._waiting && currentFrame > 0) {
            var point = new egret.Point();
            this.body.movieClipData.$getOffsetByFrame(currentFrame, point);
            var initPoint = new egret.Point();
            this.body.movieClipData.$getOffsetByFrame(1, initPoint);
            this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2 - initPoint.y + point.y;
        }
        else {
            this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2;
        }
        if (this.curSkill) {
            var obj = FightRole.FRAME_EVENT_MAP;
            var keys = Object.keys(obj);
            var frames_1 = [];
            var key = null;
            var index = -1;
            for (var i = 0; i < keys.length; i++) {
                var triggerFrameArr = String(this.curSkill[keys[i]] || "").split(",");
                frames_1 = frames_1.concat(triggerFrameArr);
                for (var j = 0; j < frames_1.length; j++) {
                    if (frames_1[j] == currentFrame) {
                        key = keys[i];
                        index = j;
                        break;
                    }
                }
                if (key) {
                    break;
                }
            }
            if (key) {
                var funName = obj[key];
                var arr = String(this.curSkill[key]).split(",");
                var totalTriggerCount = arr.length;
                if (this[funName]) {
                    if (!this.triggerFrameMap) {
                        this.triggerFrameMap = {};
                    }
                    if (!this.triggerFrameMap[currentFrame]) {
                        this.triggerFrameMap[currentFrame] = true;
                        this[funName](index, totalTriggerCount);
                    }
                }
            }
            if (this.targets && this.targets.length > 0) {
                var oneStepComplete = this.waiting;
                for (var i = 0; i < this.targets.length; i++) {
                    var fightRole = this.fightContainer.getRole(this.targets[i]);
                    oneStepComplete = (oneStepComplete && (!fightRole || (!fightRole.isPlayingDamage)));
                }
                if (oneStepComplete && !!this.triggerFrameMap && !this.isPlayingAction) {
                    if (!this.isPlayingDamage) {
                        this.nextStep();
                    }
                    else {
                    }
                }
            }
            else if (this.reportItem && this.reportItem.vertigo) {
                if (this.waiting) {
                    this.nextStep();
                }
            }
            else {
                this.nextStep();
            }
        }
        this.checkDie();
        if (this.curSkill && this.body.currentFrame == this.curSkill.scource_sound_frame && !this.isPlayingSkillSound) {
            this.isPlayingSkillSound = true;
            fight.playSound(this.curSkill.scource_sound);
        }
        return false;
    };
    p.checkDie = function () {
        if (BigNum.greater(fight.DIE_HP, this.roleData.curHP)) {
            if (this.parent && !this.isPlayingDie) {
                this.isPlayingDie = true;
                this.isPlayingDamage = false;
                this.waiting = false;
                var dieEff = new RoleDieEff();
                this.lifeBar.setProgress(0, true);
                dieEff.scaleX = this.side == FightSideEnum.RIGHT_SIDE ? -1 : 1;
                dieEff.x = this.x;
                dieEff.y = this.y;
                this.fightContainer.showDamageEff(dieEff);
                if (this.curSkill) {
                    this.waiting = true;
                    this.visible = false;
                }
                else {
                    this.dispatchEventWith("role_die", true, this);
                }
            }
        }
    };
    p.nextStep = function () {
        fight.recordLog("\u7B2C" + this.reportItem.index + "\u6B65\u5B8C\u6210", fight.LOG_FIGHT_INFO);
        this.updateRoleHP(this.reportItem.hp, this.reportItem.maxhp);
        if (this.effTimer > 0) {
            egret.clearTimeout(this.effTimer);
            this.effTimer = -1;
        }
        var round = this.reportItem.round;
        this.curSkill = null;
        this.reportItem = null;
        this.targets = [];
        this.triggerFrameMap = null;
        this.isTriggerDamage = false;
        this.isPlayingDie = false;
        this.dispatchEventWith("role_one_step_complete", true, round);
    };
    d(p, "curHP"
        ,function () {
            return this.roleData.curHP;
        }
        ,function (value) {
            this.roleData.curHP = value;
        }
    );
    d(p, "maxHP"
        ,function () {
            return this.roleData.maxHP;
        }
        ,function (value) {
            this.roleData.maxHP = value;
        }
    );
    d(p, "side"
        ,function () {
            return this.roleData.side;
        }
    );
    d(p, "pos"
        ,function () {
            return this.roleData.pos;
        }
    );
    d(p, "id"
        ,function () {
            return this.roleData.id;
        }
    );
    d(p, "zIndex"
        ,function () {
            return this._zIndex;
        }
        ,function (value) {
            this._zIndex = value;
        }
    );
    d(p, "waiting"
        ,function () {
            return this._waiting;
        }
        ,function (value) {
            this._waiting = value;
        }
    );
    p.reset = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.body.stop();
    };
    p.dispose = function () {
        if (this.effTimer > 0) {
            egret.clearTimeout(this.effTimer);
            this.effTimer = -1;
        }
        this.reportItem = null;
        this.isPlayingDie = false;
        this.isPlayingSkillSound = false;
        this.targets = [];
        this.fightContainer = null;
        while (this.effContainer.numChildren) {
            this.effContainer.removeChildAt(0);
        }
        this.lifeBar.reset();
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