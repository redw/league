/**
 * 战斗角色
 * @author hh
 */
class FightRole extends egret.DisplayObjectContainer {
    // 角色的zIndex,处理角色在角色容器中的顺序
    private _zIndex:number = 0;
    // 是否正在待机
    private _waiting:boolean = true;
    // 角色触发伤害帧信息
    private triggerFrameMap:any = null;
    // 目标对象
    private targets:{id:number, x:number, y:number, side:number, pos:number, height:number}[] = null;
    // 攻击或伤害时使用的技能
    private curSkill:SkillConfig = null;
    // 角色的信息
    private roleData:{side:number,pos:number,id:number,config?:RoleConfig,maxHP?:string,curHP?:string, level?:number} = null;
    // 战斗信息
    private reportItem:FightReportItem = null;
    // 是否触发过伤害帧
    private isTriggerDamage:boolean = false;
    // 是否正在播放行为(攻击,技能...)
    private isPlayingAction:boolean = false;
    // 是正在播放伤害效果
    private isPlayingDamage:boolean = false;
    // 正在播放死效果
    private isPlayingDie:boolean = false;
    // 正在播放技能音效
    private isPlayingSkillSound:boolean = false;
    // 血条
    private lifeBar:RoleHPBar = null;
    // 角色显示对象
    private body:egret.MovieClip = null;
    // 影子
    private shadowBitmap:egret.Bitmap;
    // 角色所在的容器
    private fightContainer:FightContainer = null;
    // 作用于身体脚下的buff容器
    private buffContainer0:egret.DisplayObjectContainer = null;
    // 作用于身体中间的buff容器
    private buffContainer1:egret.DisplayObjectContainer = null;
    // 作用于身体头部的buff容器
    private buffContainer2:egret.DisplayObjectContainer = null;
    // 除buff外的效果容器
    private effContainer:egret.DisplayObjectContainer = null;
    // buff效果map
    private buffEffMap:any = {};
    private buffIdArr:number[] = [];
    private oldBuffIdArr:number[] = [];
    private effTimer:number = -1;

    public constructor(fightContainer:FightContainer, roleData:{side:number,pos:number,id:number,config?:RoleConfig}) {
        super();
        this.active(fightContainer, roleData);
        this.initRole();
    }

    public active(fightContainer:FightContainer, roleData:{side:number,pos:number,id:number,config?:RoleConfig}) {
        this.fightContainer = fightContainer;
        this.roleData = roleData;
        if (this.roleData.config == null) {
            this.roleData.config = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
        }
        let point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;

        if (this.lifeBar) {
            this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2;
            this.lifeBar.active();
            // this.updateHP(this.curHP);
            this.body.scaleX = (this.roleData.side == FightSideEnum.RIGHT_SIDE) ? 1 : -1;
            this.buffContainer2.y = -this.roleData.config.modle_height;
            this.buffContainer1.y = -0.5 * this.roleData.config.modle_height;
            let shadowScaleSize = this.roleData.config.modle_height / 100;
            this.shadowBitmap.scaleX = this.shadowBitmap.scaleY  = shadowScaleSize;
            this.shadowBitmap.y = fight.ROLE_SHADOW_OFF * shadowScaleSize;
            this.shadowBitmap.x = this.shadowBitmap.width * -0.5 * shadowScaleSize;
        }
        egret.startTick(this.onTick, this);
    }

    private initRole() {
        this.shadowBitmap = new egret.Bitmap(RES.getRes("role_shadow_png"));
        let shadowScaleSize = this.roleData.config.modle_height / 100;
        this.shadowBitmap.scaleX = this.shadowBitmap.scaleY  = shadowScaleSize;
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
    }

    public fight(data:FightReportItem, delay:number){
        this.reportItem = data;
        let items = data.target;
        this.updateRoleHP(BigNum.add(data.hp, data.damage || 0), data.maxhp);
        this.addBuff(data);

        this.targets = [];
        for (let i = 0; i < items.length; i++) {
            let id = items[i].id;
            let side = +items[i].pos.substr(0, 1);
            let pos = +items[i].pos.substr(2, 1);
            let point:egret.Point = fight.getRoleInitPoint({side:side, pos:pos});
            let config:RoleConfig = Config.HeroData[id] || Config.EnemyData[id];
            this.targets.push({side:side, pos:pos, id:id, height:config.modle_height, x:point.x, y:point.y});
        }

        let skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        if (this.reportItem.vertigo) {
            this.triggerFrameMap = {};
            this.selfInjury();
        } else {
            if (this.targets.length == 0) {
                this.nextStep();
            } else {
                egret.setTimeout(this.showSkillEff, this, delay);
            }
        }
    }

    private showSkillEff() {
        this.firedHitMap = {};
        this.firedBulletCount = 0;
        this.isPlayingSkillSound = false;
        let showInfo = (this.curSkill.skill_free_effect || "").split(",");
        let needMode = !!showInfo[1];
        let source = showInfo[0];
        if (this.curSkill.skill_name) {
            this.fightContainer.showSkillFlyTxt(`skillname_${this.curSkill.skill_name}`);
        }
        if (source && source != "0") {
            let eff = new MCEff(source);
            eff.registerBack(0, this.doAction, this, null);
            eff.y = (this.roleData.config.modle_height) * -0.5;
            this.fightContainer.showFreeSkillEff(this, eff, needMode);
        } else {
            this.doAction();
        }
    }

    private doAction(){
        fight.verifyActiveSkill(this.curSkill);
        if (this.reportItem) {
            let action = this.curSkill.action_type;
            fight.recordLog(`第${this.reportItem.index}步角色id${this.reportItem.id} 位置${this.reportItem.pos} ${action}攻击目标`, fight.LOG_FIGHT_PLAY);
            // this.fightContainer.bringRoleToFront(this, this.targets);
            if (fight.needMoveAttack(action)) {
                this._waiting = false;
                let point = fight.getNearFightPoint(this, this.targets, this.curSkill);
                this.fightContainer.showMoveDustEff({x:this.x, y:this.y, side:this.roleData.side});
                let tween = egret.Tween.get(this);
                tween.to({x: point.x, y: point.y}, fight.MOVE_TIME);
                tween.call(this.attack, this);
            } else {
                this.attack();
            }
        } else {
            fight.recordLog(`战斗步骤提前跳过了`, fight.LOG_FIGHT_WARN);
        }
    }

    private startJump() {
        if (this.targets && this.targets.length > 0 && this.curSkill) {
            let point = new egret.Point();
            if (this.curSkill.action_type == fight.ATTACK_ACTION_JUMP_AREA) {
                let offPoint:any = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
                point.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
                point.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            } else {
                point = fight.getNearFightPoint(this, this.targets, this.curSkill);
            }
            let tween = egret.Tween.get(this);
            let frameCount = +this.curSkill.damage_frame - this.curSkill.jump_frame;
            let frameRate = this.body.frameRate || 24;
            let time = frameCount / frameRate * 1000;
            this.fightContainer.showMoveDustEff({x:this.x, y:this.y, side:this.roleData.side});
            tween.to({x: point.x, y: point.y}, time);
        } else {
            fight.recordLog("startJump时,targets没有目标", fight.LOG_FIGHT_WARN);
        }
    }

    private startDamage(index:number, total:number) {
        if (this.curSkill) {
            let actionType = this.curSkill.action_type;
            this.isTriggerDamage = true;
            if (actionType == fight.ATTACK_ACTION_AREA) {
                this.showAreaEff();
            } else if (actionType == fight.ATTACK_ACTION_MISSLE) {
                this.showBulletEff();
            } else if (actionType == fight.ATTACK_ACTION_TURN) {
                this.showTurnEff();
            } else if (actionType == fight.ATTACK_ACTION_BOMB) {
                this.showBombEff();
            } else {
                if (fight.isAddHPSkill(this.curSkill)) {
                    this.showAddHPEff();
                } else {
                    this.fightContainer.startShake(this.curSkill.shake_type);
                    this.showHitEff(index, total);
                }
            }
        } else {
            fight.recordLog(`伤害时技能不能为空`,fight.LOG_FIGHT_WARN);
        }
    }

    private showAreaEff(){
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            let damageEff = new MCEff(this.curSkill.scource_effect);
            let frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            let total = frameArr.length;
            let current = 0;
            for (let i = 0; i < total; i++) {
                damageEff.registerBack(+frameArr[i], ()=>{
                    if (this.curSkill) {
                        // fight.playSound(this.curSkill.scource_sound);
                        current++;
                        this.isPlayingDamage = current < total;
                        fight.recordLog(`显示area效果${current}-${total}`, fight.LOG_FIGHT_INFO);
                        this.fightContainer.startShake(this.curSkill.shake_type);
                        this.showHitEff(current, total);
                    } else {
                        fight.recordLog(`运行showArea时curSkill为null`, fight.LOG_FIGHT_WARN);
                    }
                }, this);
            }
            let offPoint:any = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
            damageEff.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
            damageEff.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            this.fightContainer.showAreaEff(damageEff, this);
        }
    }

    private firedHitMap:any = {};
    private firedBulletCount = 0;
    private showBulletEff(){
        if (this.checkDamageEff()) {
            let len = this.targets.length;
            let delay = 0;
            let self = this;
            let damageEffSource = this.curSkill.scource_effect;
            let damageEffSourceArr = (this.curSkill.scource_effect).split(",");
            let damageFrameArr = String(this.curSkill.damage_frame).split(",");
            let bulletCount = +damageEffSourceArr[1] || 1;
            this.isPlayingDamage = true;
            function attack(){
                for (let i = 0; i < len; i++) {
                    let target = self.targets[i];
                    let fightRole = self.fightContainer.getRole(self.targets[i]);
                    let tox = target.x;
                    let toy = target.y - target.height* 0.5;
                    let offPoint:any = self.curSkill.shoot_point || [0, 0];
                    let scaleX = self.side == FightSideEnum.LEFT_SIDE ? -1 : 1;
                    let initX = self.x - scaleX * (Number(offPoint[0]) || 0);
                    let initY = self.y - self.roleData.config.modle_height * 0.5 + (Number(offPoint[1]) || 0);
                    let rotate = Math.atan2(toy - initY, tox - initX) * 180 / Math.PI + ((scaleX == 1) ? 180 : 0);
                    let damageEff = new BaseMCEffect(damageEffSource, null, false, scaleX);
                    damageEff.rotation = rotate;
                    self.fightContainer.showDamageEff(damageEff);
                    damageEff.x = initX;
                    damageEff.y = initY;
                    let time = self.curSkill.missle_time * 1000 * MathUtil.pointDistance(new egret.Point(tox, toy), new egret.Point(initX,initY)) / 100;
                    egret.Tween.get(damageEff).to({x:tox, y:toy}, time, fight.bulletEase(time)).call(
                        ()=>{
                            damageEff.dispose();
                            if (self.curSkill) {
                                self.firedHitMap[target.pos] = (self.firedHitMap[target.pos] || 0) + 1;
                                self.fightContainer.startShake(self.curSkill.shake_type);
                                self.showHitEff(self.firedHitMap[target.pos], bulletCount * damageFrameArr.length, fightRole);
                                self.firedBulletCount++;
                                self.isPlayingDamage = self.firedBulletCount < len * bulletCount * damageFrameArr.length;
                                fight.recordLog(`显示子弹效果${fight.getRolePosDes(target)} ${self.firedBulletCount}-${len * bulletCount * damageFrameArr.length}`, fight.LOG_FIGHT_INFO);
                            } else {
                                fight.recordLog(`运行showBullet时curSkill为null`, fight.LOG_FIGHT_WARN);
                            }
                        }
                    );
                }
            }
            for (let i = 0; i < bulletCount; i++) {
                egret.setTimeout(attack, this, delay, []);
                delay += fight.BULLET_RUN_DELAY_TIME;
            }
        }
    }

    private showTurnEff(){
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            let damageEff = new MCEff(this.curSkill.scource_effect, false);
            let frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            let total = frameArr.length;
            let current = 0;
            for (let i = 0; i < total; i++) {
                damageEff.registerBack(+frameArr[i], ()=>{
                    if (this.curSkill) {
                        // fight.playSound(this.curSkill.scource_sound);
                        current++;
                        this.fightContainer.startShake(this.curSkill.shake_type);
                        fight.recordLog(`显示turn效果${current}-${total}`, fight.LOG_FIGHT_INFO);
                        this.showHitEff(current, total);
                    } else {
                        fight.recordLog(`运行showTurn时curSkill为null`, fight.LOG_FIGHT_WARN);
                    }

                }, this);
            }
            let offPoint:any = this.curSkill.shoot_point || [0, 0];
            damageEff.x = this.x + (Number(offPoint[0]) || 0);
            damageEff.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint[1]) || 0);
            let targetPoint = new egret.Point();
            let outPoint = new egret.Point();
            if (this.roleData.side == FightSideEnum.LEFT_SIDE) {
                targetPoint.x = 360;
                targetPoint.y = 330;
                outPoint.x = 580;
            } else {
                targetPoint.x = 120;
                targetPoint.y = 330;
                outPoint.x = -100;
            }
            let angle = Math.atan2(targetPoint.y - damageEff.y, targetPoint.x - damageEff.x);
            damageEff.rotation = angle * 180 / Math.PI;
            outPoint.y = damageEff.y + (targetPoint.x - damageEff.x) * Math.tan(angle);
            egret.Tween.get(damageEff).to({x:outPoint.x, y:outPoint.y}, 500).call(
                ()=>{
                    damageEff.dispose();
                    this.isPlayingDamage = false;
                }, this
            );
            this.fightContainer.showDamageEff(damageEff, this);
        }
    }

    private showBombEff(){
        if (this.checkDamageEff()) {
            let total = this.targets.length;
            let frame = +(this.curSkill.effect_damage_frame);
            for (let i = 0; i < total; i++) {
                let fightRole:FightRole = this.fightContainer.getRole(this.targets[i]);
                if (fightRole) {
                    let damageEff = new MCEff(this.curSkill.scource_effect);
                    fightRole.isPlayingDamage = true;
                    damageEff.registerBack(frame, ()=>{
                        if (this.curSkill){
                            // fight.playSound(this.curSkill.scource_sound);
                            this.fightContainer.startShake(this.curSkill.shake_type);
                        }
                        fightRole.isPlayingDamage = false;
                        this.showHitEff();
                    },  this);
                    fightRole.addEff(damageEff);
                }
            }
        }
    }

    private showAddHPEff(){
        if (this.curSkill) {
            let total = this.targets.length;
            if (this.curSkill.target_effect) {
                let current = 0;
                for (let i = 0; i < this.targets.length; i++) {
                    let target = this.targets[i];
                    let fightRole = this.fightContainer.getRole(target);
                    if (fightRole) {
                        fightRole.isPlayingDamage = true;
                        let eff = new MCEff(this.curSkill.target_effect);
                        eff.registerBack(0, (index)=>{
                            let target = this.targets[index];
                            let off = BigNum.sub(this.reportItem.target[index].hp, fightRole.roleData.curHP);
                            if (BigNum.greater(off, 0)){
                                this.fightContainer.flyTxt({str:MathUtil.easyNumber(off), x:target.x, y:target.y + target.height * -1}, fight.FONT_ADD_HP);
                            }
                            fightRole.isPlayingDamage = false;
                            fightRole.updateRoleHP(this.reportItem.target[i].hp, this.reportItem.target[i].maxhp);
                            current++;
                            fight.recordLog(`显示加血效果${current}-${total}`, fight.LOG_FIGHT_INFO);
                        }, this, i);
                        fightRole.addChild(eff);
                    }
                }
            } else {
                fight.recordLog(`${this.curSkill.id}没配置target_effect`, fight.LOG_FIGHT_WARN);
            }
        } else {
            fight.recordLog(`运行showAddHP时curSkill为null`, fight.LOG_FIGHT_WARN);
        }
    }

    private showHitEff(index:number=1, total:number=1, role:FightRole = null){
        if (this.targets.length > 0) {
            fight.playSound(this.curSkill.target_sound);
        }
        for (let i = 0; i < this.targets.length; i++) {
            let target = this.targets[i];
            let fightRole = this.fightContainer.getRole(target);
            if (fightRole && (!role || fightRole == role)) {
                let hitInfo = this.reportItem.target[i];
                fightRole.addBuff(hitInfo, true);
                let damage = BigNum.mul(hitInfo.damage, 1 / total);
                let damageNum = MathUtil.easyNumber(damage);
                if (this.curSkill.target_effect_normal) {
                    let eff = new MCEff("hit_normal");
                    eff.y = target.y + (target.height) * -0.5;
                    eff.x = target.x;
                    this.fightContainer.showDamageEff(eff, fightRole);
                }
                if (this.curSkill.target_effect) {
                    let eff = new MCEff(this.curSkill.target_effect);
                    eff.y = target.y + (target.height) * -0.5;
                    eff.x = target.x;
                    this.fightContainer.showDamageEff(eff, fightRole);
                }
                if (hitInfo.dodge) {
                    this.fightContainer.flyTxt({str:"闪避", x:target.x, y:target.y + target.height * -1}, fight.FONT_SYSTEM);
                } else {
                    if (hitInfo.block) {
                        fightRole.block();
                    } else {
                        fightRole.hit();
                    }
                    if (parseFloat(damageNum) > 0) {
                        if (this.curSkill.damage_type == "physical") {
                            this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_PHYSICAL_DAMAGE);
                        } else {
                            this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_MAGICAL_DAMAGE);
                        }
                    } else {
                        if (hitInfo.invincible) {
                            this.fightContainer.flyTxt({str:"免伤", x:target.x, y:target.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                        } else if (hitInfo.isFreeMagicAtk) {
                            this.fightContainer.flyTxt({str:"魔免", x:target.x, y:target.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                        } else if (hitInfo.isFreePhysicalAtk) {
                            this.fightContainer.flyTxt({str:"物免", x:target.x, y:target.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                        } else {
                            if (this.curSkill.damage_type == "physical") {
                                damage = BigNum.max(BigNum.div(this.reportItem.phyAtk, 1000), 1);
                                damageNum = MathUtil.easyNumber(damage);
                                this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_PHYSICAL_DAMAGE);
                            } else {
                                damage = BigNum.max(BigNum.div(this.reportItem.magAtk, 1000), 1);
                                damageNum = MathUtil.easyNumber(damage);
                                this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_MAGICAL_DAMAGE);
                            }
                        }
                    }
                }
                if (index >= total) {
                    fightRole.updateRoleHP(hitInfo.hp, hitInfo.maxhp);
                } else {
                    fightRole.updateRoleHP(BigNum.add(hitInfo.hp, BigNum.mul((total - index) / total, damage)), hitInfo.maxhp);
                }
            }
        }
    }

    private updateTargets(){
        if (this.reportItem) {
            let len = this.targets ? this.targets.length : 0;
            for (let i = 0; i < len; i++) {
                let role = this.fightContainer.getRole(this.targets[i]);
                let hitInfo = this.reportItem.target[i];
                if (role) {
                    role.updateRoleHP(hitInfo.hp, hitInfo.maxhp);
                }
            }
        }
    }

    public updateRoleHP(cur:string, max:string) {
        this.maxHP = max;
        this.curHP = cur;
        this.lifeBar.update(this.curHP, this.maxHP);
        this.dispatchEventWith("role_hp_change", true);
    }

    /**
     * 角色升级效果
     */
    public showUPLevelEff(value:{id:number, level:number}){
        if (this.roleData.side == FightSideEnum.LEFT_SIDE) {
            if (value && value.level > this.roleData.level) {
                let eff = new MCEff("lvl_up");
                this.effContainer.addChild(eff);
            }
        }
    }

    public addEff(dis:egret.DisplayObject, part:number=1, off:egret.Point = null) {
        let position = new egret.Point(0, (0 - part) *  this.roleData.config.modle_height * 0.5);
        if (off) {
            position.x += off.x;
            position.y += off.y;
        }
        dis.x = position.x;
        dis.y = position.y;
        this.addChild(dis);
    }

    private checkDamageEff(){
        let result = true;
        if (!this.curSkill || !this.curSkill.scource_effect) {
            fight.recordLog(`技能${this.curSkill.id}资源source_effect没配置`, fight.LOG_FIGHT_WARN);
            result = false;
        }
        return result;
    }

    public idle() {
        this._waiting = true;
        fight.playFrameLabel("idle", this.body, -1, this.roleData.config.id);
    }

    public hit() {
        this._waiting = false;
        if (fight.playFrameLabel("attacked", this.body, 1, this.roleData.config.id)) {
            this.body.addEventListener(egret.Event.COMPLETE, this.hitComplete, this);
        } else {
            this.hitComplete();
        }
    }

    private hitComplete() {
        this.body.removeEventListener(egret.Event.COMPLETE, this.hitComplete, this);
        this.idle();
        if (this.lifeBar.isCanRemove) {
            this.checkDie();
        }
    }

    public block() {
        this._waiting = false;
        if (fight.playFrameLabel("block", this.body, 1, this.roleData.config.id)) {
            if (this.fightContainer){
                this.fightContainer.flyTxt({str:"格挡", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
            }
            else {
                fight.recordLog("格挡时没有this.fightContainer", fight.LOG_FIGHT_WARN);
            }
            this.body.addEventListener(egret.Event.COMPLETE, this.blockComplete, this);
        } else {
            this.blockComplete();
        }
    }

    private blockComplete() {
        this.body.removeEventListener(egret.Event.COMPLETE, this.blockComplete, this);
        this.idle();
    }

    private attack() {
        egret.Tween.removeTweens(this);
        if (this.curSkill) {
            this._waiting = false;
            this.isPlayingAction = true;
            if (fight.playFrameLabel(this.curSkill.action, this.body, 1, this.roleData.config.resource)) {
                this.body.addEventListener(egret.Event.COMPLETE, this.attackComplete, this);
            } else {
                this.attackComplete();
            }
        } else {

        }
    }

    private attackComplete() {
        this.isPlayingAction = false;
        // this.fightContainer.bringRoleToSelfZPos(this, this.targets);
        this.body.removeEventListener(egret.Event.COMPLETE, this.attackComplete, this);
        if (this.triggerFrameMap) {
            if (this.curSkill.damage_frame) {
                let damageFrameArr = String(this.curSkill.damage_frame).split(",");
                let total = damageFrameArr.length;
                for (let i = 0; i < total; i++) {
                    let key = damageFrameArr[i];
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
            let len = this.targets.length;
            for (let i = 0; i < len; i++) {
                let fightRole:FightRole = this.fightContainer.getRole(this.targets[i]);
                if (fightRole)
                    fightRole.hit();
            }
        }
        if (this.curSkill) {
            if (fight.needRetreat(this.curSkill.action_type)) {
                this.retreat();
            } else {
                this.selfInjury();
            }
        }
    }

    private selfInjury(){
        if (this.reportItem) {
            if (BigNum.greater(this.reportItem.damage || 0, 0)) {
                this.updateRoleHP(this.reportItem.hp, this.reportItem.maxhp);
                this.hit();
            } else {
                this.updateRoleHP(this.reportItem.hp, this.reportItem.maxhp);
                this.idle();
            }
        } else {
            fight.recordLog(`自残时reportItem不能为null`,fight.LOG_FIGHT_WARN);
        }
    }

    private retreat() {
        this._waiting = false;
        let tween = egret.Tween.get(this);
        let point = fight.getRoleInitPoint(this.roleData);
        tween.to({x: point.x, y: point.y}, fight.RETREAT_TIME);
        tween.call(() => {this.selfInjury()}, this);
    }

    // 攻击翻倍
    public doubleAtk(){
        this.fightContainer.flyTxt({str:"攻击翻倍", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
    }

    // 恢复血量
    public  recoveryBlood(){
        let eff = new MCEff(fight.RES_PROP_WITH_3);
        eff.x = 0;
        eff.y = 0;
        this.fightContainer.showEff(this.effContainer, eff, this);
    }

    public addBuff(item:FightReportItem|FightReportTargetItem, force:boolean=false){
        let isSelf = "target" in item;
        let canAdd = isSelf || force;
        if (canAdd) {
            this.buffIdArr = item.buff.filter((value)=>{
                if (value && Config.BuffData[value])
                    return Config.BuffData[value].id;
            });
            let buffArr = this.buffIdArr || [];
            let keys = Object.keys(this.buffEffMap);
            for (let i = 0; i < buffArr.length; i++) {
                let buffConfig = Config.BuffData[buffArr[i]];
                if (buffConfig) {
                    let type = buffConfig.effect + "";
                    if (keys.indexOf(type) < 0 && buffConfig.resource && fight.isMCResourceLoaded(buffConfig.resource) && !this.buffEffMap[type]) {
                        let eff = new MCEff(buffConfig.resource, false);
                        let container = this["buffContainer" + buffConfig.point];
                        container.addChild(eff);
                        this.buffEffMap[type] = eff;
                    }
                }
            }

            let nowBuffIdArr = this.buffIdArr.concat();
            for (let i = 0; i < this.oldBuffIdArr.length; i++) {
                if (this.oldBuffIdArr.indexOf(nowBuffIdArr[i]) >= 0) {
                    nowBuffIdArr.splice(i, 1);
                    i--;
                }
            }
            for (let i = 0; i < nowBuffIdArr.length; i++) {
                let buffConfig:BuffConfig = Config.BuffData[nowBuffIdArr[i]];
                if (buffConfig && buffConfig.word && this.fightContainer) {
                    this.fightContainer.flyTxt({str:buffConfig.word, x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM)
                }
            }
            this.oldBuffIdArr = this.buffIdArr.concat()
        }
    }

    private checkBuff(){
        let keys = Object.keys(this.buffEffMap);
        let len = keys.length;
        for (let i = 0; i < len; i++) {
            let type = keys[i];

            let exist = false;
            for (let j = 0; j < this.buffIdArr.length; j++) {
                let buffConfig = Config.BuffData[this.buffIdArr[j]];
                if (buffConfig.effect == type) {
                    exist = true;
                    break;
                }
            }
            if (!exist) {
                let eff:MCEff = this.buffEffMap[type];
                if (eff) {
                    eff.dispose();
                } else {
                    fight.recordLog("buff可能出错了",fight.LOG_FIGHT_WARN);
                }
                delete this.buffEffMap[type];
                len--;
                i--;
            }
        }
    }

    private onTick() {
        let currentFrame = this.body.currentFrame;
        this.checkBuff();

        if (this.body.movieClipData && !this._waiting && currentFrame > 0) {
            let point = new egret.Point();
            this.body.movieClipData.$getOffsetByFrame(currentFrame, point);
            let initPoint = new egret.Point();
            this.body.movieClipData.$getOffsetByFrame(1, initPoint);
            this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2 - initPoint.y + point.y;
        } else {
            this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2;
        }

        if (this.curSkill) {
            let obj = FightRole.FRAME_EVENT_MAP;
            let keys = Object.keys(obj);
            let frames =  [];
            let key:string = null;
            let index:number = -1;
            for (let i = 0; i < keys.length; i++) {
                let triggerFrameArr = String(this.curSkill[keys[i]] || "").split(",");
                frames = frames.concat(triggerFrameArr);
                for (let j = 0; j < frames.length; j++) {
                    if (frames[j] == currentFrame) {
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
                let funName = obj[key];
                let arr = String(this.curSkill[key]).split(",");
                let totalTriggerCount = arr.length;
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
                let oneStepComplete:boolean = this.waiting;
                for (let i = 0; i < this.targets.length; i++) {
                    let fightRole = this.fightContainer.getRole(this.targets[i]);
                    oneStepComplete = (oneStepComplete && (!fightRole || (!fightRole.isPlayingDamage)));
                }
                if (oneStepComplete && !!this.triggerFrameMap && !this.isPlayingAction) {
                    if (!this.isPlayingDamage) {
                        this.nextStep();
                    } else {
                        // if (this.effTimer < 0) {
                        //     this.effTimer = egret.setTimeout(this.nextStep, this, 3000);
                        // }
                    }
                }
            } else if (this.reportItem && this.reportItem.vertigo) {
                if (this.waiting) {
                    this.nextStep();
                }
            }
            else{
                this.nextStep();
            }
        }
        this.checkDie();

        if (this.curSkill && this.body.currentFrame == this.curSkill.scource_sound_frame && !this.isPlayingSkillSound) {
            this.isPlayingSkillSound = true;
            fight.playSound(this.curSkill.scource_sound);
        }
        return false;
    }

    private checkDie(){
        if (BigNum.greater(fight.DIE_HP, this.roleData.curHP)) {
            if (this.parent && !this.isPlayingDie) {
                this.isPlayingDie = true;
                this.isPlayingDamage = false;
                this.waiting = false;
                let dieEff = new RoleDieEff();
                this.lifeBar.setProgress(0, true);
                dieEff.scaleX = this.side == FightSideEnum.RIGHT_SIDE ? -1 : 1;
                dieEff.x = this.x;
                dieEff.y = this.y;
                this.fightContainer.showDamageEff(dieEff);
                if (this.curSkill) {
                    this.waiting = true;
                    this.visible = false;
                } else {
                    this.dispatchEventWith("role_die", true, this);
                }
            }
        }
    }

    private nextStep(){
        fight.recordLog(`第${this.reportItem.index}步完成`,fight.LOG_FIGHT_INFO);
        this.updateRoleHP(this.reportItem.hp, this.reportItem.maxhp);
        if (this.effTimer > 0) {
            egret.clearTimeout(this.effTimer);
            this.effTimer = -1;
        }
        let round = this.reportItem.round;
        this.curSkill = null;
        this.reportItem = null;
        this.targets = [];
        this.triggerFrameMap = null;
        this.isTriggerDamage = false;
        this.isPlayingDie = false;
        this.dispatchEventWith("role_one_step_complete", true, round);
    }

    public get curHP(){
        return this.roleData.curHP;
    }

    public set curHP(value:string) {
        this.roleData.curHP = value;
    }

    public get maxHP(){
        return this.roleData.maxHP;
    }

    public set maxHP(value:string) {
        this.roleData.maxHP = value;
    }

    public get side(){
        return this.roleData.side;
    }

    public get pos(){
        return this.roleData.pos;
    }

    public get id(){
        return this.roleData.id;
    }

    public get zIndex(){
        return this._zIndex;
    }

    public set zIndex(value:number) {
        this._zIndex = value;
    }

    public get waiting(){
        return this._waiting
    }

    public set waiting(value:boolean){
        this._waiting = value;
    }

    public reset() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.body.stop();
    }

    public dispose() {
        if (this.effTimer > 0) {
            egret.clearTimeout(this.effTimer);
            this.effTimer = -1;
        }
        this.reportItem = null;
        this.isPlayingDie = false;
        this.isPlayingSkillSound = false;
        this.targets = [];
        this.fightContainer = null;
        while (this.effContainer.numChildren){
            this.effContainer.removeChildAt(0);
        }
        this.lifeBar.reset();
        egret.stopTick(this.onTick, this);
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.body.stop();
    }

    private static FRAME_EVENT_MAP:any = {
        "jump_frame": "startJump",
        "damage_frame": "startDamage"
    };

    private static inst:egret.MovieClipDataFactory;
    public static createMovieClip(name:string):egret.MovieClip {
        if (FightRole.inst == null) {
            FightRole.inst = new egret.MovieClipDataFactory();
        }
        let dataRes:any = RES.getRes(name + "_json");
        let textureRes:any = RES.getRes(name + "_png");
        FightRole.inst.mcDataSet = dataRes;
        FightRole.inst.texture = textureRes;
        return new egret.MovieClip(FightRole.inst.generateMovieClipData(name));
    }
}