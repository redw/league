/**
 * 参与战斗的角色对象
 *
 * @author hh
 */
class FightRole extends egret.DisplayObjectContainer {
    private body:egret.MovieClip;
    private lifeBar:LifeBar;
    private triggerFrameMap:any;

    private curSkill:SkillConfig;
    private reportItem:FightReportItem;
    private targets:FightRole[];
    private fightContainer:FightContainer;

    private isTriggerDamage:boolean = false;
    private isPlayingDamage:boolean = false;
    private isPlayingAction:boolean = false;

    public roleData:FightRoleData;
    public waiting:boolean = true;
    public zIndex:number = 0;

    public constructor(fightContainer:FightContainer, roleData:FightRoleData) {
        super();
        this.active(fightContainer, roleData);
        this.initRole();
    }

    public active(fightContainer:FightContainer, roleData:FightRoleData){
        this.fightContainer = fightContainer;
        this.roleData = roleData;
        egret.startTick(this.onTick, this);
    }

    /**
     * 构建角色
     */
    private initRole() {
        let shadowBitmap = new egret.Bitmap(RES.getRes("role_shadow_png"));
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

        let point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;

        this.idle();
    }

    /**
     * 战斗
     * @param data
     * @param delay
     */
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
                this.doAction();
            }, this, delay);
        } else {
            this.doAction();
        }
    }

    /**
     * 执行角色行为
     */
    private doAction(){
        let skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        fight.verifyActiveSkill(this.curSkill);
        // 如果被眩晕
        if (this.reportItem.vertigo) {
            fight.recordLog(`第${this.reportItem.index}步角色${this.reportItem.pos} 被眩晕`, fight.LOG_FIGHT_STEP_START);
            this.triggerFrameMap = {};
            this.selfInjury();
        } else {
            let isAddHP = fight.isAddHPSkill(this.curSkill);
            // 如果是加血
            if (isAddHP) {
                fight.recordLog(`第${this.reportItem.index}步角色${this.reportItem.pos} 给目标加血`, fight.LOG_FIGHT_STEP_START);
                this.addHP();
            } else {
                // 如果是攻击
                let action = this.curSkill.action_type;
                fight.recordLog(`第${this.reportItem.index}步角色${this.reportItem.pos} ${action}攻击目标`, fight.LOG_FIGHT_STEP_START);
                if (fight.needRetreat(action)) {
                    this.fightContainer.bringRoleToFront(this, this.targets);
                }
                // 如果是移动攻击
                if (fight.needMoveAttack(action)) {
                    let targets = this.targets;
                    let point = fight.getNearFightPoint(this, targets);
                    let tween = egret.Tween.get(this);
                    tween.to({x: point.x, y: point.y}, fight.MOVE_TIME);
                    tween.call(this.attack, this);
                } else {
                    this.attack();
                }
            }
        }
    }

    // 加血
    private addHP(){
        let len = this.targets.length;
        let resourceOk:boolean = false;
        if (!!this.curSkill.target_effect) {
            let dataRes:any = RES.getRes(this.curSkill.target_effect + "_json");
            let textureRes:any = RES.getRes(this.curSkill.target_effect + "_png");
            if (dataRes && textureRes) {
                resourceOk = true;
                let count = 0;
                for (let i = 0; i < len; i++) {
                    let targetEff = new BaseMCEffect(this.curSkill.target_effect, i);
                    targetEff.back = (index)=>{
                        this.updateTarget(this.targets[index], true);
                        count++;
                        if (count >= len) {
                            this.nextStep();
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
    }

    private startDamage(ratio:number, updateHP:boolean) {
        if (this.curSkill) {
            this.isTriggerDamage = true;
            let actionType = this.curSkill.action_type;
            if (actionType == fight.ATTACK_ACTION_AREA) {
                this.showAreaEff();
            } else if (actionType == fight.ATTACK_ACTION_MISSLE) {
                this.showBulletEff();
            } else if (actionType == fight.ATTACK_ACTION_TURN) {
                this.showTurnEff();
            } else {
                this.showHitEff(ratio, updateHP);
            }
        } else {
            fight.recordLog(`第${this.reportItem.index}步startDamage时技能为空`, fight.LOG_FIGHT_ERROR);
        }
    }

    private showAreaEff(){
        if (this.checkDamageEff()) {
            this.isPlayingDamage = true;
            let damageEff = new BaseMCEffect(this.curSkill.scource_effect);
            let frameArr = String(this.curSkill.effect_damage_frame || "").split(",");
            let total = frameArr.length;
            let current = 0;
            for (let i = 0; i < total; i++) {
                damageEff.registerFrameBack(()=>{
                    fight.playSound(this.curSkill.scource_effect);
                    current++;
                    if (current >= total) {
                        this.isPlayingDamage = false;
                        this.showHitEff(1/ total);
                    } else {
                        this.showHitEff(1 / total, false);
                    }
                }, +frameArr[i]);
            }
            let offPoint:any = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
            damageEff.x = fight.AREA_POS[this.roleData.side - 1].x + (Number(offPoint[0]) || 0);
            damageEff.y = fight.AREA_POS[this.roleData.side - 1].y + (Number(offPoint[1]) || 0);
            damageEff.scaleX = this.roleData.side == FightSideEnum.LEFT_SIDE ? 1 : -1;
            this.fightContainer.showDamageEff(damageEff);
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
                    if (count >= total) {
                        this.showHitEff(1 / total);
                    } else {
                        this.showHitEff(1 / total, false);
                    }
                }, +frameArr[i]);
            }
            let offPoint:any = this.roleData.config.shoot_point || [0, 0];
            damageEff.x = this.x + (Number(offPoint.x) || 0);
            damageEff.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
            let targetPoint = new egret.Point();
            let outPoint = new egret.Point();
            if (this.roleData.side == FightSideEnum.LEFT_SIDE) {
                targetPoint.x = 360;
                targetPoint.y = 330;
                outPoint.x = 580;
                damageEff.scaleX= -1;
            } else {
                targetPoint.x = 120;
                targetPoint.y = 330;
                outPoint.x = -100;
                damageEff.scaleX = 1;
            }
            let angle = Math.atan2(targetPoint.y - damageEff.y, targetPoint.x - damageEff.x);
            damageEff.rotation = angle * 180 / Math.PI;
            outPoint.y = damageEff.y + (targetPoint.x - damageEff.x) * Math.tan(angle);
            egret.Tween.get(damageEff).to({x:outPoint.x, y:outPoint.y}, 500).call(
                ()=>{
                    this.isPlayingDamage = false;
                }, this
            );
            this.fightContainer.showDamageEff(damageEff);
        }
    }

    private showBulletEff(){
        if (this.checkDamageEff()) {
            let len = this.targets.length;
            let delay = 0;
            let self = this;
            let damageEffSourceArr = this.curSkill.scource_effect.split(",");
            let damageEffSource = damageEffSourceArr[0];
            let bulletCount = +damageEffSourceArr[1] || 1;
            self.isPlayingDamage = true;
            let totalCount = len * bulletCount;
            let turn = 0;
            let turnCountArr = [];
            for (let i = 0; i < bulletCount; i++) {
                turnCountArr[i] = 0;
            }
            function attack(round:number){
                let count = 0;
                for (let i = 0; i < len; i++) {
                    let target = self.targets[i];
                    let damageEff = new BaseMCEffect(damageEffSource, null, false);
                    let offPoint:any = self.roleData.config.shoot_point || [0, 0];
                    damageEff.x = self.x + (Number(offPoint.x) || 0);
                    damageEff.y = self.y - self.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
                    let tox = target.x;
                    let toy = target.y - (target.roleData.config.modle_height * 0.5);
                    egret.Tween.get(damageEff).to({x:tox, y:toy}, fight.BULLET_RUN_TIME).call(
                        ()=>{
                            damageEff.dispose();
                            turnCountArr[round]++;
                            count++;
                            self.showHitEff(1 / bulletCount, turnCountArr[round] >= len, target);
                            if (count >= totalCount) {
                                self.isPlayingDamage = false;
                            }
                        }
                    );
                    self.fightContainer.showDamageEff(damageEff);
                }
            }

            for (let i = 0; i < bulletCount; i++) {
                egret.setTimeout(attack, null, delay, turn++);
                delay += fight.BULLET_RUN_DELAY_TIME;
            }
        }
    }

    private checkDamageEff(){
        let result = true;
        if (!this.curSkill || !this.curSkill.scource_effect) {
            fight.recordLog(`技能${this.curSkill.id}资源source_effect没配置`, fight.LOG_FIGHT_WARN);
            result = false;
            this.updateTargets();
            this.nextStep();
        }
        return result;
    }

    /**
     * 显示受击效果
     */
    private showHitEff(ratio:number = 1, updateHP:boolean=true, role:FightRole = null){
        let len = this.targets.length;
        for (let i = 0; i < len; i++) {
            let target = this.targets[i];
            if (!role || target == role) {
                let hitInfo = this.reportItem.target[i];
                let damage = BigNum.mul(hitInfo.damage, ratio);
                let damageNum = MathUtil.easyNumber(damage);
                let isBlock = hitInfo.block;
                let isDodge = hitInfo.dodge;
                if (!!this.curSkill.target_effect) {
                    let targetEff = new BaseMCEffect(this.curSkill.target_effect);
                    targetEff.y = (target.roleData.config.modle_height) * -0.5;
                    target.addChild(targetEff);
                }
                if (isDodge) {
                    this.fightContainer.flyTxt({str:"闪避", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, FightFontEffEnum.SYSTEM);
                } else {
                    if (isBlock) {
                        target.block();
                    } else {
                        target.hit();
                    }
                    fight.playSound(this.curSkill.target_cond);
                    if (parseFloat(damageNum) > 0) {
                        if (this.curSkill.damage_type == "physical") {
                            this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.roleData.config.modle_height * -1, scale:this.reportItem.cri ? 1.5 : 1}, FightFontEffEnum.PHYSICAL_ATK);
                        } else {
                            this.fightContainer.flyTxt({str:damageNum, x:target.x, y:target.y + target.roleData.config.modle_height * -1, scale:this.reportItem.cri ? 1.5 : 1}, FightFontEffEnum.MAGIC_ATK);
                        }
                    } else {
                        if (hitInfo.invincible) {
                            this.fightContainer.flyTxt({str:"无敌", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, FightFontEffEnum.SYSTEM);
                        } else if (hitInfo.isFreeMagicAtk) {
                            this.fightContainer.flyTxt({str:"魔免", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, FightFontEffEnum.SYSTEM);
                        } else if (hitInfo.isFreePhysicalAtk) {
                            this.fightContainer.flyTxt({str:"物免", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, FightFontEffEnum.SYSTEM);
                        } else {
                            fight.recordLog(`第${this.reportItem.index}步角色${hitInfo.pos}受击伤害为${damageNum}`, fight.LOG_FIGHT_WARN);
                        }
                    }
                }
                if (updateHP) {
                    target.updateHP(hitInfo.hp);
                } else {
                    target.updateHP(BigNum.sub(target.roleData.curHP, damage));
                }
            }
        }
    }

    private startJump() {
        let target = this.targets[0];
        if (target) {
            let point = fight.getNearFightPoint(this, this.targets);
            let tween = egret.Tween.get(this);
            let frameCount = this.curSkill.damage_frame - this.curSkill.jump_frame;
            let frameRate = 24;
            let time = frameCount / frameRate * 1000;
            tween.to({x: point.x, y: point.y}, time);
        } else {
            fight.recordLog(`第${this.reportItem.index}步跳跃攻击时,目标不能为空,检测跳跃帧的配置`, fight.LOG_FIGHT_WARN);
        }
    }

    public idle() {
        this.waiting  = true;
        fight.playFrameLabel("idle", this.body, -1, this.roleData.config.id);
    }

    public get isIdle(){
        return this.waiting;
    }

    public hit() {
        this.waiting = false;
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
        this.waiting = false;
        if (fight.playFrameLabel("block", this.body, 1, this.roleData.config.id)) {
            this.fightContainer.flyTxt({str:"格档", x:this.x, y:this.y + this.roleData.config.modle_height * -1}, FightFontEffEnum.SYSTEM);
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
        if (this.curSkill) {
            this.waiting = false;
            this.isPlayingAction = true;
            this.fightContainer.bringRoleToSelfZPos(this, this.targets);
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
        if (this.updateHP(this.reportItem.hp, false)){
            this.dispatchEventWith("role_one_step_complete", true);
            this.idle();
            egret.setTimeout(()=>{
                this.dispatchEventWith("role_die", true, this);
            }, this, 1000);
        } else {
            this.idle();
        }
    }

    private retreat() {
        let tween = egret.Tween.get(this);
        let point = fight.getRoleInitPoint(this.roleData);
        tween.to({x: point.x, y: point.y}, fight.RETREAT_TIME);
        tween.call(() => {this.selfInjury()}, this);
    }

    /**
     * 更新目标数据
     */
    public updateTargets(){
        for (let i = 0; i < this.reportItem.target.length; i++) {
            let role = this.fightContainer.getRoleByStr(this.reportItem.target[i].pos);
            role.updateHP(this.reportItem.target[i].hp);
        }
    }

    private updateTarget(role:FightRole, isAddHPEff:boolean=false) {
        let result = false;
        for (let i = 0; i < this.reportItem.target.length; i++) {
            if (this.reportItem.target[i].pos == fight.getRolePosDes(role)) {
                result = true;
                if (isAddHPEff) {
                    let off = BigNum.sub(this.reportItem.target[i].hp, role.roleData.curHP);
                    if (BigNum.greater(off, 0)){
                        this.fightContainer.flyTxt({str:MathUtil.easyNumber(off), x:role.x, y:role.y + role.roleData.config.modle_height * -1}, FightFontEffEnum.ADD_HP);
                    }
                }
                role.updateHP(this.reportItem.target[i].hp);
                break;
            }
        }
        return result;
    }

    /**
     * 更新对象血量
     * @param hurt
     * @param needDispatcherEvent
     * @returns {boolean}
     */
    public updateHP(hurt:string, needDispatcherEvent:boolean=true){
        let die:boolean = false;
        this.roleData.curHP = hurt;
        this.roleData.curHP = BigNum.max(0, this.roleData.curHP);
        let ratio = +(BigNum.div(this.roleData.curHP, this.roleData.maxHP)) || 0;
        this.lifeBar.setRatio(ratio);
        if (BigNum.greaterOrEqual(0, this.roleData.curHP)) {
            fight.recordLog(`角色${fight.getRolePosDes(this)}死亡`, fight.LOG_FIGHT_ROLE_DIE);
            if (needDispatcherEvent) {
                egret.setTimeout(()=>{
                    this.dispatchEventWith("role_die", true, this);
                }, this, 1000);
            }
            die = true;
        }
        return die;
    }

    public onTick() {
        if (this.curSkill) {
            let currentFrame = this.body.currentFrame;
            let obj = FightRole.FRAME_EVENT_MAP;
            let frames = Object.keys(obj);
            for (let i = frames.length; i--;) {
                let funName = obj[frames[i]];
                let triggerFrameArr = String(this.curSkill[frames[i]] || "").split(",");
                triggerFrameArr = [triggerFrameArr[0]];
                let triggerCount = triggerFrameArr.length;
                for (let j = 0; j < triggerCount; j++) {
                    let triggerFrame = +triggerFrameArr[j];
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
            let oneStepComplete:boolean = this.isIdle;
            for (let i = 0; i < this.targets.length; i++) {
                oneStepComplete = (oneStepComplete && (this.targets[i].waiting || !this.targets[i].parent));
            }
            if (oneStepComplete && !!this.triggerFrameMap && !this.isPlayingDamage && !this.isPlayingAction) {
                this.nextStep();
            }
        }
        return false;
    }

    private nextStep(){
        fight.recordLog(`第${this.reportItem.index}步完成`, fight.LOG_FIGHT_STEP_START);
        this.curSkill = null;
        this.reportItem = null;
        this.targets = null;
        this.triggerFrameMap = null;
        this.isTriggerDamage = false;
        this.dispatchEventWith("role_one_step_complete", true);
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
        this.targets = [];
        this.fightContainer = null;
        egret.stopTick(this.onTick, this);
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.body.stop();
        FightRoleFactory.freeRole(this);
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
