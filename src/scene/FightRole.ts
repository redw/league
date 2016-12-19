import FrameLabel = egret.FrameLabel;
/**
 * 战斗角色
 *
 * @author hh
 */
class FightRole extends egret.DisplayObjectContainer {
    private body:egret.MovieClip;
    private lifeBar:LifeBar;
    private fightContainer:FightContainer;
    private triggerFrameMap:any;

    private curSkill:SkillConfig;
    private reportItem:FightReportItem;
    private targets:FightRole[];

    public roleData:FightRoleData;

    private waiting:boolean = false;
    private isTriggerDamage:boolean = false;        // 是否触发过伤害帧
    private isPlayingDamage:boolean = false;        // 是否正在播放伤害特效

    public constructor(fightContainer:FightContainer, roleData:FightRoleData) {
        super();
        this.activeRole(fightContainer, roleData);
        this.initRole();
    }

    public activeRole(fightContainer:FightContainer, roleData:FightRoleData) {
        this.fightContainer = fightContainer;
        this.roleData = roleData;
        egret.startTick(this.onTick, this);
    }

    private initRole() {
        this.body = FightRole.createMovieClip(this.roleData.config.resource + "");
        this.addChild(this.body);

        this.lifeBar = new LifeBar(this.roleData.side === fight.SIDE_LEFT);
        this.lifeBar.x = -30;
        this.lifeBar.y = -(this.roleData.config.modle_height) - 10;
        this.addChild(this.lifeBar);
        this.updateHP(this.roleData.curHP);

        let point = fight.getRoleInitPoint(this.roleData);
        this.x = point.x;
        this.y = point.y;
        this.scaleX = (this.roleData.side == fight.SIDE_LEFT) ? -1 : 1;

        this.idle();
    }

    /**
     * 播放战斗报告
     *
     * @param data
     * @param delay
     */
    public playFight(data:FightReportItem, delay:number){
        try {
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
        } catch (e) {
            console.error(e);
            this.updateTargets();
            this.nextStep();
        }
    }

    private doAction(){
        let skillId = this.reportItem.skillId;
        this.curSkill = Config.SkillData[skillId];
        // 如果被眩晕
        if (this.reportItem.vertigo) {
            fight.recordLog(`第${this.reportItem.index}步角色${this.reportItem.pos} 被眩晕`, fight.LOG_FIGHT_STEP_START);
            this.triggerFrameMap = {};
            this.selfInjury();
        } else {
            let isAddHP = (this.curSkill.target_group == "friend");
            // 如果是加血
            if (isAddHP) {
                fight.recordLog(`第${this.reportItem.index}步角色${this.reportItem.pos} 给目标加血`, fight.LOG_FIGHT_STEP_START);
                this.addHP();
            } else {
                // 如果是攻击
                let action = this.curSkill.action_type;
                fight.recordLog(`第${this.reportItem.index}步角色${this.reportItem.pos} ${action}攻击目标`, fight.LOG_FIGHT_STEP_START);
                // 如果是移动攻击
                if (fight.needMoveAttack(action)) {
                    let targets = this.targets;
                    let point = fight.getNearFightPoint(targets[0].roleData);
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
        if (!!this.curSkill.target_effect) {
            let count = 0;
            for (let i = 0; i < len; i++) {
                let targetEff = new BaseMCEffect(this.curSkill.target_effect, i);
                targetEff.back = (index)=>{
                    this.updateTargetHP(this.targets[index]);
                    count++;
                    if (count >= len) {
                        this.nextStep();
                    }
                };
                this.targets[i].addChild(targetEff);
            }
        } else{
            fight.recordLog(`技能${this.curSkill.id}的target_effect为非法`, fight.LOG_FIGHT_WARN);
            this.updateTargets();
            this.nextStep();
        }
    }

    private startDamage() {
        if (this.curSkill) {
            this.isTriggerDamage = true;
            let actionType = this.curSkill.action_type;
            if (actionType == "area") {
                this.showAreaEff();
            } else if (actionType == "missle") {
                this.showBulletEff();
            } else if (actionType == "turn") {
                this.showTurnEff();
            } else {
                this.showHitEff();
            }
        } else {
            fight.recordLog(`第${this.reportItem.index}步startDamage时技能为空`, fight.LOG_FIGHT_ERROR);
        }
    }

    private showAreaEff(){
        if (!this.curSkill.scource_effect) {
            fight.recordLog(`技能${this.curSkill.id}资源scource_effect没配置`, fight.LOG_FIGHT_WARN);
            return;
        }
        this.isPlayingDamage = true;
        let damageEff = new BaseMCEffect(this.curSkill.scource_effect);
        let frame = Number(this.curSkill.effect_damage_frame);
        if (!frame){
            fight.recordLog(`技能${this.curSkill.id}的伤害帧配置有误`, fight.LOG_FIGHT_WARN);
        }
        damageEff.registerFrameBack(()=>{
            !this.curSkill.scource_effect || SoundManager.inst.playEffect(URLConfig.getSoundURL(this.curSkill.scource_effect));
            this.isPlayingDamage = false;
            this.showHitEff();
        }, frame);

        let offPoint:any = (!!this.curSkill.area_effect_point) ? this.curSkill.area_effect_point.split(",") : [0, 0];
        if (this.roleData.side == fight.SIDE_LEFT) {
            damageEff.x = 360 + (Number(offPoint[0]) || 0);
            damageEff.y = 200 + (Number(offPoint[1]) || 0);
        } else {
            damageEff.x = 120 + (Number(offPoint[0]) || 0);
            damageEff.y = 200 + (Number(offPoint[1]) || 0);
        }
        this.fightContainer.addChild(damageEff);
    }

    private showTurnEff(){
        if (!this.curSkill.scource_effect) {
            fight.recordLog(`技能${this.curSkill.id}资源scource_effect没配置`, fight.LOG_FIGHT_WARN);
            this.updateTargets();
            this.nextStep();
            return;
        }
        this.isPlayingDamage = true;
        let damageEff = new BaseMCEffect(this.curSkill.scource_effect, null, false);
        let frame = Number(this.curSkill.effect_damage_frame);
        if (!frame){
            fight.recordLog(`技能${this.curSkill.id}的伤害帧配置有误`, fight.LOG_FIGHT_WARN);
        }
        damageEff.registerFrameBack(()=>{
            !this.curSkill.scource_effect || SoundManager.inst.playEffect(URLConfig.getSoundURL(this.curSkill.scource_effect));
            this.isPlayingDamage = false;
            this.showHitEff();
            if (shape) {
                shape.parent.removeChild(shape);
            }
        }, frame);
        let offPoint:any = this.roleData.config.shoot_point || [0, 0];
        damageEff.x = this.x + (Number(offPoint.x) || 0);
        damageEff.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
        let targetPoint = new egret.Point();
        let outPoint = new egret.Point();
        if (this.roleData.side == fight.SIDE_LEFT) {
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

        var shape:egret.Shape = new egret.Shape();
        shape.graphics.beginFill(0xf00);
        shape.graphics.drawCircle(0, 0, 10);
        shape.x = targetPoint.x;
        shape.y = targetPoint.y;
        this.fightContainer.addChild(shape);

        let angle = Math.atan2(targetPoint.y - damageEff.y, targetPoint.x - damageEff.x);
        outPoint.y = damageEff.y + (targetPoint.x - damageEff.x) * Math.tan(angle);
        // egret.Tween.get(damageEff).to({x:outPoint.x, y:outPoint.y}, 500).call(
        //     ()=>{
        //         this.showHitEff();
        //     }
        // );
        this.fightContainer.addChild(damageEff);
    }

    private showBulletEff(){
        const len = this.targets.length;
        for (let i = 0; i < len; i++) {
            let target = this.targets[i];
            let damageEff = new BaseMCEffect(this.curSkill.scource_effect, null, false);
            let offPoint:any = this.roleData.config.shoot_point || [0, 0];
            damageEff.x = this.x + (Number(offPoint.x) || 0);
            damageEff.y = this.y - this.roleData.config.modle_height * 0.5 + (Number(offPoint.y) || 0);
            let tox = target.x;
            let toy = target.y - (target.roleData.config.modle_height * 0.5);
            egret.Tween.get(damageEff).to({x:tox, y:toy}, 200).call(
                ()=>{
                    damageEff.dispose();
                    this.showHitEff();
                }
            );
            this.fightContainer.addChild(damageEff);
        }
    }

    private showHitEff(){
        let len = this.targets.length;
        fight.recordLog(`第${this.reportItem.index}步展示受击效果`);
        for (let i = 0; i < len; i++) {
            let target = this.targets[i];
            let hitInfo = this.reportItem.target[i];
            let hurt = MathUtil.easyNumber(hitInfo.damage);
            let isBlock = hitInfo.block;
            let isDodge = hitInfo.dodge;
            if (!!this.curSkill.target_effect) {
                let targetEff = new BaseMCEffect(this.curSkill.target_effect);
                targetEff.y = (target.roleData.config.modle_height) * -0.5;
                target.addChild(targetEff);
            }
            if (isDodge) {
                target.flyFont("闪避");
            } else {
                if (isBlock) {
                    target.block();
                } else {
                    target.hit();
                }
                !!this.curSkill.target_sound || SoundManager.inst.playEffect(URLConfig.getSoundURL(this.curSkill.target_sound));
                if (parseFloat(hurt) > 0) {
                    fight.addHurtText(target, hurt, {y:-60, x:-10});
                } else {
                    if (hitInfo.invincible) {
                        target.flyFont("无敌");
                    } else if (hitInfo.isFreeMagicAtk) {
                        target.flyFont("魔免");
                    } else if (hitInfo.isFreePhysicalAtk) {
                        target.flyFont("物免");
                    } else {
                        fight.recordLog(`第${this.reportItem.index}步角色${hitInfo.pos}受击伤害为${hurt}`, 50);
                    }
                }
            }
            target.updateHP(hitInfo.hp);
        }
    }

    public flyFont(content:string) {
        let hurtEff = new HurtFontEff();
        hurtEff.y = -50;
        hurtEff.scaleX = this.scaleX;
        this.addChild(hurtEff);
        hurtEff.show(content);
    }

    private startJump() {
        let target = this.targets[0];
        if (target) {
            let point = fight.getNearFightPoint(target.roleData);
            let tween = egret.Tween.get(this);
            let frameCount = this.curSkill.damage_frame - this.curSkill.jump_frame;
            let frameRate = 24;
            let time = frameCount / frameRate * 1000;
            tween.to({x: point.x, y: point.y}, time);
        } else {
            fight.recordLog(`第${this.reportItem.index}步跳跃攻击时,目标不能为空,检测跳跃帧的配置`, 100);
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
            this.flyFont("格档");
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
            if (fight.playFrameLabel(this.curSkill.action, this.body, 1, this.roleData.config.resource)) {
                this.verifyDamageFrame();
                this.body.addEventListener(egret.Event.COMPLETE, this.attackComplete, this);
            } else {
                this.attackComplete();
            }
        } else {
            fight.recordLog(`第${this.reportItem.index}步${this.roleData.side + "_" + this.roleData.pos}攻击出错`,fight.LOG_FIGHT_ERROR);
        }
    }

    private verifyDamageFrame(){
        if (!this.curSkill && this.body) {
            let frameLabel:FrameLabel = this.body["getFrameLabelByName"](this.curSkill.action);
            let damageFrame = this.curSkill.damage_frame;
            if (!damageFrame) {
                fight.recordLog(`角色${this.roleData.config.id} ${this.curSkill.action}没有配伤害帧`, fight.LOG_FIGHT_WARN);
            } else {
                if (damageFrame < frameLabel.frame || damageFrame > frameLabel.end) {
                    fight.recordLog(`角色${this.roleData.config.id} ${this.curSkill.action}伤害帧配置错误`, fight.LOG_FIGHT_WARN);
                }
            }
        }
    }

    private attackComplete() {
        this.body.removeEventListener(egret.Event.COMPLETE, this.attackComplete, this);
       
        // 攻击完成后,一定要触发伤害
        this.triggerFrameMap = {};
        if (!this.isTriggerDamage) {
            this.showHitEff();
        }

        if (fight.needMoveAttack(this.curSkill.action_type)) {
            this.retreat();
        } else {
            this.selfInjury();
        }
    }

    private selfInjury(){
        if (this.updateHP(this.reportItem.hp, false)){
            this.dispatchEventWith("role_one_step_complete", true);
            this.dispatchEventWith("role_die", true, this);
        } else {
            this.idle();
        }
    }

    private retreat() {
        let tween = egret.Tween.get(this);
        let point = fight.getRoleInitPoint(this.roleData);
        tween.to({x: point.x, y: point.y}, fight.RETREAT_TIME).call(this.idle, this);
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
            this.curSkill && (!!this.curSkill.dead_sound || SoundManager.inst.playEffect(URLConfig.getSoundURL(this.curSkill.dead_sound)));
            if (needDispatcherEvent) {
                this.dispatchEventWith("role_die", true, this);
            }
            die = true;
        }
        return die;
    }

    private updateTargetHP(role:FightRole) {
        let result = false;
        for (let i = 0; i < this.reportItem.target.length; i++) {
            if (this.reportItem.target[i].pos == fight.getRolePosDes(role)) {
                result = true;
                role.updateHP(this.reportItem.target[i].hp);
                break;
            }
        }
    }

    public onTick() {
        if (this.curSkill) {
            let currentFrame = this.body.currentFrame;
            let obj = FightRole.FRAME_EVENT_MAP;
            let frames = Object.keys(obj);
            for (let i = frames.length; i--;) {
                let triggerFrame = this.curSkill[frames[i]];
                if (currentFrame == triggerFrame) {
                    let funName = obj[frames[i]];
                    if (this[funName]) {
                        if (!this.triggerFrameMap) {
                            this.triggerFrameMap = {};
                        }
                        if (!this.triggerFrameMap[frames[i]]) {
                            this.triggerFrameMap[frames[i]] = true;
                            this[funName]();
                            break;
                        }
                    } else {
                        console.error(frames[i] + "没有对应的触发函数");
                    }
                }
            }
            let oneStepComplete:boolean = this.isIdle;
            for (let i = 0; i < this.targets.length; i++) {
                oneStepComplete = (oneStepComplete && (this.targets[i].isIdle || !this.targets[i].parent));
            }
            if (oneStepComplete && !!this.triggerFrameMap &&  !this.isPlayingDamage) {
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
    }

    private static FRAME_EVENT_MAP:any = {
        "jump_frame": "startJump",
        "damage_frame": "startDamage"
    };

    private static inst:egret.MovieClipDataFactory;
    public static createMovieClip(name:string):egret.MovieClip {
        // TODO 待优化
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

