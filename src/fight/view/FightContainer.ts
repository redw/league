/**
 * 战斗角色容器
 *
 * @author hh
 */
class FightContainer extends egret.DisplayObjectContainer {
    private meanWhileStep:number = 1;
    private leftRoles:FightRole[] = Array(fight.ROLE_UP_LIMIT);
    private rightRoles:FightRole[] = Array(fight.ROLE_UP_LIMIT);
    private roles:FightRole[][] = [this.leftRoles, this.rightRoles];
    private state:number = FightStateEnum.Wait;
    private type:number = FightTypeEnum.PVE;
    private level:number = -1;
    private steps:any[] = [];
    private fightSteps:any[] = [];
    private originalElements:{id:number, side:number, pos:number}[] = [];
    private dataGenerator:FightProcessGenerator;
    private autoFight:boolean = false;

    private warnEff:FightWarnEff;                   // 血量不足30时的警告效果
    private shakeScreenEff:ShakeScreenEff;          // 震屏效果
    private fontEffLayer:eui.Group;                 // 文字效果层
    private damageEffLayer:eui.Group;               // 伤害层
    private roleLayer:eui.Group;                    // 角色层
    private grayLayer:egret.Shape;                  // 灰色层
    private dustLayer:eui.Group;                    // 灰尘层
    private foregroundLayer:PVEForeground;          // 前景层
    private middleGroundLayer:PVEMiddleGround;      // 中景层
    private prospectLayer:PVEProspect;              // 远景层
    private transitionLayer:PVETransitionEff;       // 场景切换层
    private leftAreaCont:egret.DisplayObjectContainer;
    private rightAreaCont:egret.DisplayObjectContainer;

    private bunch:string = "a";
    public leftTotalLife:string = "1";      // 左方总生命
    public rightTotalLife:string = "1";     // 右方总生命
    public oldLifeRatio:number = 1;         // 生命进度条
    public result:number = 0;               // 战斗结果

    public constructor(type:number = FightTypeEnum.PVE) {
        super();
        this.type = type;

        if (type == FightTypeEnum.PVE) {
            this.prospectLayer = new PVEProspect();
            this.addChild(this.prospectLayer);

            this.middleGroundLayer = new PVEMiddleGround();
            this.addChild(this.middleGroundLayer);
        }

        this.dustLayer = new eui.Group();
        this.addChild(this.dustLayer);

        this.grayLayer = new egret.Shape();
        this.addChild(this.grayLayer);

        this.roleLayer = new eui.Group();
        this.addChild(this.roleLayer);

        this.damageEffLayer = new eui.Group();
        this.addChild(this.damageEffLayer);

        if (type == FightTypeEnum.PVE) {
            this.foregroundLayer = new PVEForeground();
            this.addChild(this.foregroundLayer);

            this.transitionLayer = new PVETransitionEff();
            this.addChild(this.transitionLayer);
        }

        this.fontEffLayer = new eui.Group();
        this.addChild(this.fontEffLayer);

        this.addEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.addEventListener("role_die", this.onRoleDie, this, true);
        this.addEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.addEventListener("fight_ready_complete", this.onReadyComplete, this, true);
        this.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onRoleDataUpdate, this);
    }

    /**
     * 战斗布署
     * @param data  角色的数据
     * @param auto  是否自己开战(只对pve有用)
     * @param level 场景等级(只对pve有用)
     */
    public fightDeployment(data:{id:number, pos:number, side:number}[], auto:boolean = false, level:number = 1) {
        this.shakeScreenEff && this.shakeScreenEff.stopShake();
        this.autoFight = auto;
        this.bunch = fight.randomSkillTriggerBunch();
        this.originalElements = data.concat();
        if (this.type == FightTypeEnum.PVE) {
            this.tweenRemoveRole(level - this.level);
            this.foregroundLayer.level = level;
            this.middleGroundLayer.level = level;
            this.prospectLayer.level = level;
            this.transitionLayer.level = level;
        } else {
            this.reset();
            this.tweenRemoveRoleComplete();
        }
        this.level = level;
    }

    private addRoles(elements:FightRoleVO[], withTween:boolean){
        let arr = elements;
        this.moveCount = 0;
        for (let i = 0; i < arr.length; i++) {
            let roleData = arr[i];
            let role = new FightRole(this, roleData);
            let side = roleData.side - 1;
            let pos = roleData.pos;
            this.roles[side][pos] = role;
            if (withTween) {
                let tox = role.x;
                if (roleData.side == FightSideEnum.LEFT_SIDE) {
                    role.x = fight.WIDTH * -0.5 + role.x;
                } else {
                    role.x = fight.WIDTH * 0.5 + role.x;
                }
                egret.Tween.get(role).to({x:tox}, fight.MIDDLE_GROUND_MOVE_TIME).
                call(()=>{this.roleMoveComplete();}, this);
            }
        }

        let orders = [0,3,6,1,4,7,2,5,8];
        let zIndex = 0;
        for (let i = 0; i < orders.length; i++) {
            let index = orders[i];
            if (index == 7) {
                this.leftAreaCont = new egret.DisplayObjectContainer();
                this.roleLayer.addChild(this.leftAreaCont);
            }
            if (this.roles[0][index]) {
                this.roles[0][index].zIndex = zIndex;
                this.roleLayer.addChild(this.roles[0][index]);
                zIndex++;
            }
            if (index == 7) {
                this.rightAreaCont = new egret.DisplayObjectContainer();
                this.roleLayer.addChild(this.rightAreaCont);
            }
            if (this.roles[1][index]) {
                this.roles[1][index].zIndex = zIndex;
                this.roleLayer.addChild(this.roles[1][index]);
                zIndex++;
            }
        }
        if (!withTween && this.autoFight){
            this.start();
        }
    }

    /**
     * 开始战斗
     * @param steps
     */
    public start(steps?:FightReportItem[]) {
        if (!this.originalElements || this.originalElements.length <= 0) {
            fight.recordLog("no role data,cannot start", fight.LOG_FIGHT_WARN);
        } else {
            if (this.state != FightStateEnum.Fight) {
                this.state = FightStateEnum.Fight;
                this.autoFight = false;
                if (steps) {
                    this.fightSteps = steps.concat();
                } else {
                    this.dataGenerator = new FightProcessGenerator();
                    let arr = this.originalElements;
                    let roleArr:FightRoleVO[] = fight.generateFightRoleVOArr(arr);
                    this.dataGenerator.addSceneDataVec(roleArr);
                    this.fightSteps = this.dataGenerator.generateData(this.bunch);
                    this.result = this.dataGenerator.result;
                    this.dispatchEventWith("fight_ready_complete", true, [this.dataGenerator.getLeftTotalLife(), this.dataGenerator.getRightTotalLife()]);
                }
                this.steps = this.fightSteps.concat();
                console.log("战斗过程", this.steps);
                this.startStep();
            }
        }
    }

    private moveCount:number = 0;
    private roleMoveComplete(){
        this.moveCount++;
        if (this.moveCount >= this.originalElements.length) {
            if (this.autoFight)
                this.start();
        }
    }

    private startStep() {
        if (this.fightSteps.length <= 0) {
            this.end();
        } else {
            let count = this.getPlayingCount();
            this.meanWhileStep = count;
            let delayTime = 0;
            while (count--) {
                let data = this.fightSteps.shift();
                this.doStep(data, delayTime);
                delayTime += fight.MEANWHILE_FIGHT_DELAY_TIME;
            }
        }
    }

    private onRoleDataUpdate() {
        if (this.type == FightTypeEnum.PVE) {
            this.fightSteps = this.dataGenerator.updateGenerateData();
            this.steps = this.fightSteps.concat();
        }
    }

    private doStep(data:FightReportItem, delay:number) {
        let startRole = this.getRoleByStr(data.pos);
        startRole.fight(data, delay);
    }

    private onOneStepComplete() {
        this.meanWhileStep--;
        if (this.meanWhileStep <= 0)
            egret.setTimeout(() => {
                this.startStep();
            }, null, fight.STEP_DELAY_TIME);
    }

    private onRoleDie(e:egret.Event) {
        let role:FightRole = e.data;
        this.roleDie(role);
    }

    public roleDie(role:FightRole) {
        let side = role.side - 1;
        let pos = role.pos;
        delete this.roles[side][pos];
        role.dispose();
        FightRoleFactory.freeRole(role);
    }

    public getRoleByStr(str:string) {
        let side = +str.substr(0, 1) - 1;
        let pos = +str.substr(2, 1);
        return this.roles[side][pos];
    }

    private getPlayingCount() {
        let result = 1;
        if (this.fightSteps.length > 1) {
            let firstPos = this.fightSteps[0].pos;
            let firstSide = firstPos.substr(0, 1);
            for (let i = 1; i < this.fightSteps.length; i++) {
                let curPos = this.fightSteps[i].pos;
                let curSide = curPos.substr(0, 1);
                if ((firstSide == curSide) && (firstPos != curPos)) {
                    result++;
                    firstPos = curPos;
                } else {
                    break;
                }
            }
        }
        return fight.CAN_MEANWHILE_FIGHT ? result : 1;
    }

    private end() {
        this.state = FightStateEnum.End;
        this.dispatchEventWith(ContextEvent.FIGHT_END, true);
    }


    /**
     * 得到触发的串
     * @returns {string}
     */
    public getTriggerChanceType(){
        return this.bunch;
    }

    /**
     * 得到step
     */
    public getSteps(){
        return this.steps.concat();
    }

    /**
     * 得到参加战斗的怪
     */
    public getMonsterArr(){
        let result = [];
        for (let i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            result[i] = 0;
        }
        for (let i = 0; i < this.originalElements.length; i++) {
            if (!fight.isHero(this.originalElements[i].id)) {
                let pos = this.originalElements[i].pos;
                result[pos] = +(this.originalElements[i].id);
            }
        }
        return result;
    }

    /**
     * 把行动的角色提到排最前面
     * @param role
     * @param targetArr
     */
    public bringRoleToFront(role:FightRole, targetArr:FightRole[]){
        let roleArr = [];
        let leftRoles = this.leftRoles.filter((value)=>{return !!value});
        let rightRoles = this.rightRoles.filter((value)=>{return !!value});
        roleArr = roleArr.concat(leftRoles, rightRoles);
        roleArr = roleArr.filter((value) => {return (value.pos) % 3 == (role.pos % 3)});
        roleArr.concat(targetArr);
        roleArr = roleArr.filter((value) => {return !!value.parent});
        roleArr.sort((a, b)=>{return b.zIndex - a.zIndex});
        for (let i = 0; i < roleArr.length - 1; i++) {
            if (roleArr[i].zIndex == roleArr[i + 1].zIndex) {
                roleArr.splice(i, 1);
                i--;
            }
        }
        if (roleArr[0] != role) {
            if (this.roleLayer.getChildIndex(role) < this.roleLayer.getChildIndex(roleArr[0])) {
                this.roleLayer.swapChildren(roleArr[0], role);
            }
        }
    }

    /**
     * 把行动的角色移动到正确的位置
     * @param role
     * @param targetArr
     */
    public bringRoleToSelfZPos(role:FightRole, targetArr:FightRole[]) {
        let roleArr = [];
        let leftRoles = this.leftRoles.filter((value)=>{return !!value});
        let rightRoles = this.rightRoles.filter((value)=>{return !!value});
        roleArr = roleArr.concat(leftRoles, rightRoles);
        roleArr = roleArr.filter((value) => {return (value.pos) % 3 == (role.pos % 3)});
        roleArr = roleArr.concat(targetArr);
        roleArr = roleArr.filter((value) => {return !!value.parent});
        roleArr.sort((a, b)=>{return b.zIndex - a.zIndex});
        for (let i = 0; i < roleArr.length - 1; i++) {
            if (roleArr[i].zIndex == roleArr[i + 1].zIndex) {
                roleArr.splice(i, 1);
                i--;
            }
        }
        if (roleArr[0] != role) {
            if (this.roleLayer.getChildIndex(roleArr[0]) < this.roleLayer.getChildIndex(role)) {
                this.roleLayer.swapChildren(roleArr[0], role);
            }
        }
    }

    public tweenRemoveRole(off:number){
        if (off > 0 && this.level > 0) {
            let tween = egret.Tween.get(this.roleLayer);
            tween.to({x:this.roleLayer.x - fight.WIDTH},
                fight.MIDDLE_GROUND_MOVE_TIME,
                egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).call(
                ()=>{
                    this.roleLayer.x = 0;
                    this.reset();
                    egret.setTimeout(()=>{this.tweenRemoveRoleComplete();}, this, 100)
                },
                this
            )
        } else {
            this.reset();
            this.tweenRemoveRoleComplete();
        }
    }

    private tweenRemoveRoleComplete(){
        let arr = this.originalElements;
        let roleArr:FightRoleVO[] = fight.generateFightRoleVOArr(arr);
        if (this.type != FightTypeEnum.PVE) {
            this.addRoles(roleArr, false);
        } else {
            this.addRoles(roleArr, true);
        }
    }

    public getCurTotalLife(side:number) {
        let curLife:string = "0";
        let roleArr = this.roles[side - 1];
        let len = roleArr ? roleArr.length : 0;
        for (let i = 0; i < len; i++) {
            let role = roleArr[i];
            if (role) {
                curLife = BigNum.add(curLife, role.curHP);
            }
        }
        return curLife;
    }

    public getTotalLife(side:number) {
        let totalLife:string = "0";
        let roleArr = this.roles[side - 1];
        let len = roleArr ? roleArr.length : 0;
        for (let i = 0; i < len; i++) {
            let role = roleArr[i];
            if (role) {
                totalLife = BigNum.add(totalLife, role.maxHP);
            }
        }
        return totalLife;
    }

    /**
     * 开始抖动
     * @param 抖动幅度
     */
    public startShake(range:number){
        if (this.type == FightTypeEnum.PVE) {
            if (!this.shakeScreenEff) {
                this.shakeScreenEff = new ShakeScreenEff(this);
            }
            this.shakeScreenEff.startShake(range);
        }
    }

    /**
     * 显示灰尘效果
     * @param value
     */
    public showMoveDustEff(value:{x:number,y:number, side:number}){
        let eff = new MoveDustEff();
        eff.x = value.x;
        eff.y = value.y;
        this.showEff(this.dustLayer, eff, value);
    }

    public showFreeSkillEff(parent:egret.DisplayObjectContainer, eff:egret.DisplayObject){
        this.grayLayer.graphics.clear();
        this.grayLayer.graphics.beginFill(0x0, 0.4);
        this.grayLayer.graphics.drawRect(0,0,this.stage.width, this.stage.height);
        egret.setTimeout(()=>{this.grayLayer.graphics.clear();
        }, this, 1000);
        parent.addChild(eff);

    }

    public showAreaEff(eff:egret.DisplayObject, value:{side:number}){
        let scaleX = (value.side == FightSideEnum.LEFT_SIDE ? -1 : 1);
        eff.scaleX = scaleX;
        if (value.side == FightSideEnum.LEFT_SIDE) {
            this.leftAreaCont.addChild(eff);
        } else {
            this.rightAreaCont.addChild(eff);
        }
    }

    /**
     * 显示伤害效果
     * @param eff
     * @param value
     */
    public showDamageEff(eff:egret.DisplayObject, value?:any) {
        this.showEff(this.damageEffLayer, eff, value);
    }

    /**
     * 显示效果
     * @param parent
     * @param eff
     * @param value
     */
    public showEff(parent:egret.DisplayObjectContainer, eff:egret.DisplayObject, value?:any){
        if (parent && eff) {
            if (value) {
                if (typeof value == "number") {
                    eff.scaleX = value;
                } else {
                    eff.scaleX = value.side == FightSideEnum.RIGHT_SIDE ? -1 : 1;
                }
            }
            parent.addChild(eff);
        }
    }

    /**
     * 显示飘字效果
     * @param content
     * @param type
     */
    public flyTxt(content:any, fntname:string){
        let fontEff = new FontEff(fntname);
        fontEff.x = content.x || 0;
        fontEff.y = content.y || 0;
        fontEff.show(content);
        this.showEff(this.fontEffLayer, fontEff);
    }

    public reset() {
        this.fightSteps = [];
        for (let i = 0; i < this.leftRoles.length; i++) {
            if (this.leftRoles[i]) {
                this.leftRoles[i].dispose();
                delete this.leftRoles[i];
            }
        }
        for (let i = 0; i < this.rightRoles.length; i++) {
            if (this.rightRoles[i]) {
                this.rightRoles[i].dispose();
                delete this.rightRoles[i];
            }
        }
    }

    private onRoleHPChange(){
        let curTotalLife = this.getCurTotalLife(FightSideEnum.LEFT_SIDE);
        let ratio:number = +BigNum.div(curTotalLife, this.leftTotalLife);
        if (ratio <= 0.3 && this.oldLifeRatio < ratio) {
            if (!this.warnEff) {
                this.warnEff = new FightWarnEff(this);
            }
            this.warnEff.show();
        } else {
            if (this.warnEff) {
                this.warnEff.hide();
            }
        }
        this.oldLifeRatio = ratio;
    }

    private onReadyComplete(e:egret.Event) {
        this.leftTotalLife = e.data[0] || "1";
        this.rightTotalLife = e.data[1] || "1";
    }

    public dispose() {
        this.reset();
        this.removeEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onRoleDataUpdate, this);
        this.removeEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.removeEventListener("role_die", this.onRoleDie, this, true);
        this.removeEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.removeEventListener("fight_ready_complete", this.onReadyComplete, this, true);
    }
}
