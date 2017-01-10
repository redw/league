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
    // 攻击或伤害等的目标对象
    private targets:FightRole[] = null;
    // 攻击或伤害时使用的技能
    private curSkill:SkillConfig = null;
    // 角色的信息
    private roleData:{side:number,pos:number,id:number,config?:RoleConfig,maxHP?:string,curHP?:string} = null;
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
        egret.startTick(this.onTick, this);
    }

    private initRole() {
        let shadowBitmap = new egret.Bitmap(RES.getRes("role_shadow_png"));
        let shadowScaleSize = this.roleData.config.modle_height / 100;
        shadowBitmap.scaleX = shadowBitmap.scaleY  = shadowScaleSize;
        shadowBitmap.y = fight.ROLE_SHADOW_OFF * shadowScaleSize;
        shadowBitmap.x = shadowBitmap.width * -0.5 * shadowScaleSize;
        this.addChild(shadowBitmap);

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
        this.lifeBar.x = RoleHPBar.WIDTH * -0.5;
        this.lifeBar.y = -(this.roleData.config.modle_height) - RoleHPBar.HEIGHT - 2;
        this.addChild(this.lifeBar);
        this.updateHP(this.curHP);

        let point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;

        this.idle();
    }

    public fight(data:FightReportItem, delay:number){
        this.reportItem = data;
        let items = data.target;
        this.targets = [];
        for (let i = 0; i < items.length; i++) {
            let targetRole =  this.fightContainer.getRoleByStr(items[i].pos);
            this.targets.push(targetRole);
        }
        if (delay > 0) {
            egret.setTimeout(() => {
                this.showSkillEff();
            }, this, delay);
        } else {
            this.showSkillEff();
        }
    }

    private startJump() {
        let point = new egret.Point();
        if (this.curSkill.action_type == fight.ATTACK_ACTION_JUMP_AREA) {
            let offPoint:any = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
            point.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
            point.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
        } else {
            point = fight.getNearFightPoint(this, this.targets, this.curSkill);
        }
        let tween = egret.Tween.get(this);
        let frameCount = this.curSkill.damage_frame - this.curSkill.jump_frame;
        let frameRate = this.body.frameRate || 24;
        let time = frameCount / frameRate * 1000;
        this.fightContainer.showMoveDustEff(this);
        tween.to({x: point.x, y: point.y}, time);
    }

    private startDamage(index:number, total:number) {
        if (this.curSkill) {
            let actionType = this.curSkill.action_type;
            this.isTriggerDamage = true;
            if (actionType == fight.ATTACK_ACTION_AREA) {
                this.showAreaEff();
            } else if (actionType == fight.ATTACK_ACTION_MISSLE) {
                this.showBulletEff(index, total);
            } else if (actionType == fight.ATTACK_ACTION_TURN) {
                this.showTurnEff();
            } else if (actionType == fight.ATTACK_ACTION_BOMB) {
                this.showBombEff();
            } else {
                this.showHitEff(index, total);
            }
        }
    }

    // 显示技能效果
    private showSkillEff() {
        this.firedBulletCount = 0;
        this.firedHitMap = {};
        this.isPlayingSkillSound = false;

        let skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        let showInfo = (this.curSkill.skill_free_effect || "").split(",");
        let needMode = !!showInfo[1];
        let source = showInfo[0];
        let self = this;
        if (source) {
            let eff = new BaseMCEffect(source);
            eff.registerFrameBack(()=>{
                self.doAction();
            }, 0);
            eff.y = (this.roleData.config.modle_height) * -0.5;
            this.fightContainer.showFreeSkillEff(this, eff, needMode);
        } else {
            this.doAction();
        }
    }

    private updateTargets(){
        for (let i = 0; i < this.reportItem.target.length; i++) {
            let role = this.fightContainer.getRoleByStr(this.reportItem.target[i].pos);
            role.maxHP = this.reportItem.target[i].maxhp;
            role.updateHP(this.reportItem.target[i].hp, true);
        }
    }

    public updateHP(hp:string,forceDie:boolean=true){
        if (this.curHP) {
            if (!BigNum.equal(this.curHP, hp)) {
                this.curHP = hp;
                let ratio = +(BigNum.div(this.curHP, this.maxHP)) || 0;
                this.lifeBar.setProgress(ratio);
                this.dispatchEventWith("role_hp_change", true);
                if (forceDie) {
                    if (BigNum.greater(fight.DIE_HP, this.curHP)) {
                        // this.onRoleDie();
                    }
                }
            }
        }
    }

    private doAction(e:egret.Event=null){
        if (e && e.target) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.doAction, this);
        }
        fight.verifyActiveSkill(this.curSkill);

        // 如果被眩晕
        if (this.reportItem.vertigo) {
            fight.recordLog(`第${this.reportItem.index}步角色id${this.reportItem.id} 位置${this.reportItem.pos} 被眩晕`, fight.LOG_FIGHT_PLAY);
            this.triggerFrameMap = {};
            this.selfInjury();
        } else {
            let isAddHP = fight.isAddHPSkill(this.curSkill);
            // 如果是加血
            if (isAddHP) {
                fight.recordLog(`第${this.reportItem.index}步角色id${this.reportItem.id} 位置${this.reportItem.pos} 给目标加血`, fight.LOG_FIGHT_PLAY);
                this.addHP();
            } else {
                // 如果是攻击
                let action = this.curSkill.action_type;
                fight.recordLog(`第${this.reportItem.index}步角色id${this.reportItem.id} 位置${this.reportItem.pos} ${action}攻击目标`, fight.LOG_FIGHT_PLAY);
                this.fightContainer.bringRoleToFront(this, this.targets);
                // 如果是移动攻击
                if (fight.needMoveAttack(action)) {
                    this._waiting = false;
                    let targets = this.targets;
                    let point = fight.getNearFightPoint(this, targets, this.curSkill);
                    this.fightContainer.showMoveDustEff(this);
                    let tween = egret.Tween.get(this);
                    tween.to({x: point.x, y: point.y}, fight.MOVE_TIME);
                    tween.call(this.attack, this);
                } else {
                    this.attack();
                }
            }
        }
    }

    private addHP(){
        let len = this.targets.length;
        let resourceOk:boolean = false;
        if (this.curSkill.target_effect) {
            let dataRes:any = RES.getRes(this.curSkill.target_effect + "_json");
            let textureRes:any = RES.getRes(this.curSkill.target_effect + "_png");
            if (dataRes && textureRes) {
                resourceOk = true;
                let count = 0;
                for (let i = 0; i < len; i++) {
                    let targetEff = new MCEff(this.curSkill.target_effect);
                    targetEff.registerBack(0, (index)=>{
                        this.addHPEff(this.targets[index]);
                        count++;
                        if (count >= len) {
                            this.nextStep();
                        }
                    }, null, i);
                    this.targets[i].addChild(targetEff);
                }
            }
        }
        if (!resourceOk) {
            this.updateTargets();
            this.nextStep();
        }
    }

    private addHPEff(role:FightRole) {
        let result = false;
        for (let i = 0; i < this.reportItem.target.length; i++) {
            if (this.reportItem.target[i].pos == fight.getRolePosDes(role)) {
                result = true;
                let off = BigNum.sub(this.reportItem.target[i].hp, role.roleData.curHP);
                if (BigNum.greater(off, 0)){
                    this.fightContainer.flyTxt({str:MathUtil.easyNumber(off), x:role.x, y:role.y + role.roleData.config.modle_height * -1}, fight.FONT_ADD_HP);
                }
                role.updateHP(this.reportItem.target[i].hp);
                break;
            }
        }
        return result;
    }

    private showHitEff(index:number=1, total:number=1, role:FightRole = null){
        let len = this.targets.length;
        for (let i = 0; i < len; i++) {
            let target = this.targets[i];
            if (!role || target == role) {
                let hitInfo = this.reportItem.target[i];
                let damage = BigNum.mul(hitInfo.damage, 1 / total);
                let damageNum = MathUtil.easyNumber(damage);
                if (this.curSkill.target_effect_normal) {
                    let targetEff = new BaseMCEffect("hit_normal", null, true, this.side == FightSideEnum.LEFT_SIDE ? -1 : 1);
                    targetEff.y = (target.roleData.config.modle_height) * -0.5;
                    target.effContainer.addChild(targetEff);
                }
                if (this.curSkill.target_effect) {
                    let targetEff = new BaseMCEffect(this.curSkill.target_effect, null, true, this.side == FightSideEnum.LEFT_SIDE ? -1 : 1);
                    targetEff.y = (target.roleData.config.modle_height) * -0.5;
                    target.effContainer.addChild(targetEff);
                }
                if (hitInfo.dodge) {
                    this.fightContainer.flyTxt({str:"闪避", x:target.x, y:target.y + target.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                } else {
                    if (hitInfo.block) {
                        target.block();
                    } else {
                        target.hit();
                    }
                    fight.playSound(this.curSkill.target_cond);
                    if (parseFloat(damageNum) > 0) {
                        if (this.curSkill.damage_type == "physical") {
                            this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.roleData.config.modle_height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_PHYSICAL_DAMAGE);
                        } else {
                            this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.roleData.config.modle_height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_MAGICAL_DAMAGE);
                        }
                    } else {
                        if (hitInfo.invincible) {
                            this.fightContainer.flyTxt({str:"无敌", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                        } else if (hitInfo.isFreeMagicAtk) {
                            this.fightContainer.flyTxt({str:"魔免", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                        } else if (hitInfo.isFreePhysicalAtk) {
                            this.fightContainer.flyTxt({str:"物免", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
                        } else {
                            if (this.curSkill.damage_type == "physical") {
                                damage = BigNum.max(BigNum.div(this.reportItem.phyAtk, 1000), 1);
                                damageNum = MathUtil.easyNumber(damage);
                                this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.roleData.config.modle_height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_PHYSICAL_DAMAGE);
                            } else {
                                damage = BigNum.max(BigNum.div(this.reportItem.magAtk, 1000), 1);
                                damageNum = MathUtil.easyNumber(damage);
                                this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.roleData.config.modle_height * -1, scale:this.reportItem.cri ? 1.5 : 1}, fight.FONT_MAGICAL_DAMAGE);
                            }
                        }
                    }
                }
                target.maxHP = hitInfo.maxhp;
                if (index >= total) {
                    target.updateHP(hitInfo.hp);
                } else {
                    target.updateHP(BigNum.add(hitInfo.hp, BigNum.mul((total - index) / total, damage)));
                }
            }
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
                    fight.playSound(this.curSkill.scource_effect);
                    current++;
                    this.isPlayingDamage = current < total;
                    this.showHitEff(current, total);
                });
            }
            let offPoint:any = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
            damageEff.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
            damageEff.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            this.fightContainer.showAreaEff(damageEff, this);
        }
    }

    private showTurnEff(){
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            let damageEff = new BaseMCEffect(this.curSkill.scource_effect, null, false);
            let frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            let total = frameArr.length;
            let count = 0;
            for (let i = 0; i < total; i++) {
                damageEff.registerFrameBack(()=>{
                    fight.playSound(this.curSkill.scource_effect);
                    count++;
                    this.showHitEff(count, total);
                }, +frameArr[i]);
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
                    if (damageEff.parent)
                        damageEff.parent.removeChild(damageEff);
                    this.isPlayingDamage = false;
                }, this
            );
            this.fightContainer.showDamageEff(damageEff, this);
        }
    }

    private firedBulletCount = 0;
    private firedHitMap = {};
    private showBulletEff(index:number, total:number){
        if (this.checkDamageEff()) {
            let len = this.targets.length;
            let delay = 0;
            let self = this;
            let damageEffSource = this.curSkill.scource_effect;
            let damageEffSourceArr = (this.curSkill.scource_effect).split(",");
            let damageFrameArr = String(this.curSkill.damage_frame).split(",");
            let bulletCount = +damageEffSourceArr[1] || 1;
            self.isPlayingDamage = true;
            let totalCount = len * bulletCount;
            let count = 0;
            function attack(turnCountArr:number[]){
                for (let i = 0; i < len; i++) {
                    let target = self.targets[i];
                    let tox = target.x;
                    let toy = target.y - (target.roleData.config.modle_height * 0.5);
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
                    egret.Tween.get(damageEff).to({x:tox, y:toy}, fight.BULLET_RUN_TIME, fight.bulletEase).call(
                        ()=>{
                            damageEff.dispose();
                            self.firedHitMap[target.pos] = (self.firedHitMap[target.pos] || 0) + 1;
                            self.showHitEff(self.firedHitMap[target.pos], bulletCount * damageFrameArr.length, target);
                            self.firedBulletCount++;
                            self.isPlayingDamage = self.firedBulletCount < len * bulletCount * damageFrameArr.length;
                        }
                    );
                }
            }

            for (let i = 0; i < bulletCount; i++) {
                egret.setTimeout(attack, null, delay, []);
                delay += fight.BULLET_RUN_DELAY_TIME;
            }
        }
    }

    private showBombEff(){
        if (this.checkDamageEff()) {
            let total = this.targets.length;
            let current = 0;
            this.isPlayingDamage = true;
            let frame = +(this.curSkill.effect_damage_frame);
            for (let i = 0; i < total; i++) {
                let damageEff = new MCEff(this.curSkill.scource_effect);
                damageEff.registerBack(frame, ()=>{
                    fight.playSound(this.curSkill.scource_effect);
                    current++;
                    this.isPlayingDamage = current < total;
                    this.showHitEff(current, total);
                }, this);
                let target = this.targets[i];
                target.addEff(damageEff);
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
            this.triggerFrameMap = {};
            this.updateTargets();
            this.nextStep();
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
    }

    public block() {
        this._waiting = false;
        if (fight.playFrameLabel("block", this.body, 1, this.roleData.config.id)) {
            this.fightContainer.flyTxt({str:"格档", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, fight.FONT_SYSTEM);
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
            this._waiting = false;
            this.isPlayingAction = true;
            if (fight.playFrameLabel(this.curSkill.action, this.body, 1, this.roleData.config.resource)) {
                this.body.addEventListener(egret.Event.COMPLETE, this.attackComplete, this);
            } else {
                this.attackComplete();
            }
        } else {
            fight.recordLog(`第${this.reportItem.index}步${this.roleData.side + "_" + this.roleData.pos}攻击时技能为空`, fight.LOG_FIGHT_ERROR);
        }
    }

    private attackComplete() {
        this.isPlayingAction = false;
        this.fightContainer.bringRoleToSelfZPos(this, this.targets);
        this.body.removeEventListener(egret.Event.COMPLETE, this.attackComplete, this);
        if (!this.isTriggerDamage) {
            this.triggerFrameMap = {};
            this.showHitEff();
        }
        if (fight.needRetreat(this.curSkill.action_type)) {
            this.retreat();
        } else {
            this.selfInjury();
        }
    }

    private selfInjury(){
        if (this.updateHP(this.reportItem.hp)){
            this.dispatchEventWith("role_one_step_complete", true);
            this.idle();
        } else {
            this.idle();
        }
    }

    private retreat() {
        this._waiting = false;
        let tween = egret.Tween.get(this);
        let point = fight.getRoleInitPoint(this.roleData);
        tween.to({x: point.x, y: point.y}, fight.RETREAT_TIME);
        tween.call(() => {this.selfInjury()}, this);
    }

    private onTick() {
        let currentFrame = this.body.currentFrame;

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
            let oneStepComplete:boolean = this.waiting;
            for (let i = 0; i < this.targets.length; i++) {
                oneStepComplete = (oneStepComplete && (this.targets[i].waiting || !this.targets[i].parent));
            }
            if (oneStepComplete && !!this.triggerFrameMap &&  !this.isPlayingDamage && !this.isPlayingAction) {
                this.nextStep();
            }
        }

        // 处理角色死亡效果
        if (BigNum.greater(fight.DIE_HP, this.roleData.curHP) && this.parent && !this.isPlayingDie) {
            if (!this.roleData.config.dead_frame) {
                this.isPlayingDie = true;
                fight.recordLog(`角色${this.roleData.id}没有配死亡帧`, fight.LOG_FIGHT_WARN);
                egret.setTimeout(()=>{
                    this.onRoleDie();
                }, this, fight.DIE_DELAY_TIME);
            } else {
                // TODO 处理死亡帧
                // if (currentFrame >= this.roleData.config.dead_frame) {
                    this.isPlayingDie = true;
                    let dieEff = new RoleDieEff();
                    dieEff.scaleX = this.side == FightSideEnum.LEFT_SIDE ? -1 : 1;
                    dieEff.addEventListener(egret.Event.COMPLETE, this.onRoleDie, this);
                    this.addChild(dieEff);
                    this.idle();
                    this.body.stop();
                    egret.stopTick(this.onTick, this);
                // }
            }
        }

        if (this.curSkill && this.body.currentFrame == this.curSkill.scource_sound_frame && !this.isPlayingSkillSound) {
            this.isPlayingSkillSound = true;
            fight.playSound(this.curSkill.scource_sound);
        }
        return false;
    }

    private onRoleDie(e?:egret.Event) {
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.onRoleDie, this);
        }
        if (!this.reportItem || this.reportItem.id != this.roleData.id) {
            this.dispatchEventWith("role_die", true, this);
        }
        this.isPlayingDamage = false;
    }

    private nextStep(){
        fight.recordLog(`第${this.reportItem.index}步完成`, fight.LOG_FIGHT_PLAY);
        this.curSkill = null;
        this.reportItem = null;
        this.targets = null;
        this.triggerFrameMap = null;
        this.isTriggerDamage = false;
        this.dispatchEventWith("role_one_step_complete", true);
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
        this.curSkill = null;
        this.reportItem = null;
        this.isPlayingDie = false;
        this.isPlayingSkillSound = false;
        this.targets = [];
        this.fightContainer = null;
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