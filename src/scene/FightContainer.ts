/**
 * 战斗角色容器
 *
 * @author hh
 */
class FightContainer extends egret.DisplayObjectContainer {

    private meanWhileStep:number = 1;
    private leftRoles:FightRole[] = Array(9);
    private rightRoles:FightRole[] = Array(9);
    private roles:FightRole[][] = [this.leftRoles, this.rightRoles];
    private state:number = FightStateEnum.Wait;
    private type:number = FightTypeEnum.PVE;
    private level:number = -1;
    private steps:any[] = [];
    private fightSteps:any[] = [];
    private elements:FightRoleData[] = [];
    private dataGenerator:FightProcessGenerator;
    private autoFight:boolean = false;

    private fontEffLayer:eui.Group;
    private damageEffLayer:eui.Group;
    private roleLayer:eui.Group;
    private foregroundLayer:PVEForeground;
    private middleGroundLayer:PVEMiddleGround;
    private prospectLayer:PVEProspect;

    public constructor(type:number = FightTypeEnum.PVE) {
        super();
        this.type = type;

        if (type == FightTypeEnum.PVE) {
            this.prospectLayer = new PVEProspect();
            this.addChild(this.prospectLayer);

            this.middleGroundLayer = new PVEMiddleGround();
            this.addChild(this.middleGroundLayer);
        }
        this.roleLayer = new eui.Group();
        this.addChild(this.roleLayer);

        this.damageEffLayer = new eui.Group();
        this.addChild(this.damageEffLayer);

        if (type == FightTypeEnum.PVE) {
            this.foregroundLayer = new PVEForeground();
            this.addChild(this.foregroundLayer);
        }

        this.fontEffLayer = new eui.Group();
        this.addChild(this.fontEffLayer);

        this.addEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.addEventListener("role_die", this.onRoleDie, this, true);
        this.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onRoleDataUpdate, this);
    }

    /**
     * 开始战斗
     * @param data  角色的数据
     * @param auto
     * @param level
     */
    public startFight(data:{id:number, pos:number, side:number}[], auto:boolean = false, level:number = 1) {
        this.autoFight = auto;

        this.elements = [];
        let arr = data.concat();
        for (let i = 0; i < arr.length; i++) {
            let roleData = new FightRoleData();
            roleData.parse(arr[i], arr[i].id);
            this.elements.push(roleData);
        }

        if (this.type == FightTypeEnum.PVE) {
            this.tweenRemoveRole(level - this.level);
            this.foregroundLayer.level = level;
            this.middleGroundLayer.level = level;
            this.prospectLayer.level = level;
        }

        this.level = level;
    }

    public addRoles(elements:FightRoleData[], withTween:boolean){
        let arr = elements;
        this.moveCount = 0;
        for (let i = 0; i < arr.length; i++) {
            let roleData = arr[i];
            let role = new FightRole(this, roleData);
            let side = roleData.side - 1;
            let pos = roleData.pos;
            this.roles[side][pos] = role;
            if (!!withTween) {
                let tox = role.x;
                if (roleData.side == FightSideEnum.LEFT_SIDE) {
                    role.x = fight.WIDTH * -0.5 + role.x;
                } else {
                    role.x = fight.WIDTH * 0.5 + role.x;
                }
                egret.Tween.get(role).to({x:tox}, 500).
                    call(()=>{this.roleMoveComplete();}, this);
            }
        }

        let orders = [0,3,6,1,4,7,2,5,8];
        let zIndex = 0;
        for (let i = 0; i < orders.length; i++) {
            let index = orders[i];
            if (this.roles[0][index]) {
                this.roles[0][index].zIndex = zIndex;
                this.roleLayer.addChild(this.roles[0][index]);
                zIndex++;
            }
            if (this.roles[1][index]) {
                this.roles[0][index].zIndex = zIndex;
                this.roleLayer.addChild(this.roles[1][index]);
                zIndex++;
            }
        }
        if (!withTween && this.autoFight){
            this.start();
        }
    }


    public start() {
        if (!this.elements || this.elements.length <= 0) {
            console.log("请添加元素后，再开始战斗");
            return;
        }
        if (this.state != FightStateEnum.Fight) {
            this.state = FightStateEnum.Fight;
            this.autoFight = false;
            this.dataGenerator = new FightProcessGenerator();
            this.dataGenerator.addSceneDataVec(this.elements.concat());
            this.fightSteps = this.dataGenerator.generateData();
            this.steps = this.fightSteps.concat();
            fight.recordLog(this.steps, fight.LOG_FIGHT_INFO);
            this.startStep();
        }
    }

    private moveCount:number = 0;
    private roleMoveComplete(){
        this.moveCount++;
        if (this.moveCount >= this.elements.length) {
            console.log(this.moveCount, this.elements.length, "...");
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
        this.fightSteps = this.dataGenerator.updateGenerateData();
        this.steps = this.fightSteps.concat();
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
            }, null, 10);
    }

    private onRoleDie(e:egret.Event) {
        let role:FightRole = e.data;
        this.roleDie(role);
    }

    public roleDie(role:FightRole) {
        let side = role.roleData.side - 1;
        let pos = role.roleData.pos;
        delete this.roles[side][pos];
        role.dispose();
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

    public end() {
        this.state = FightStateEnum.End;
        this.dispatchEventWith("fight_end", true);
    }

    /**
     * 得到总步数
     * @returns {number}
     */
    public getStepCount() {
        return this.steps.length;
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
        for (let i = 0; i < 9; i++) {
            result[i] = 0;
        }
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].isHero) {
                let pos = this.elements[i].pos;
                result[pos] = +(this.elements[i].id);
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
        roleArr = roleArr.filter((value) => {return (value.roleData.pos) % 3 == (role.roleData.pos % 3)});
        if (roleArr.length == 1) {
            roleArr = roleArr.concat(targetArr);
        }
        roleArr.sort((a, b)=>{return b.zIndex - a.zIndex});
        if (roleArr[0] != role) {
            this.roleLayer.swapChildren(roleArr[0], role);
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
        roleArr = roleArr.filter((value) => {return (value.roleData.pos) % 3 == (role.roleData.pos % 3)});
        if (roleArr.length == 1) {
            roleArr = roleArr.concat(targetArr);
        }
        roleArr.sort((a, b)=>{return b.zIndex - a.zIndex});
        if (roleArr[0] != role) {
            if (this.roleLayer.getChildIndex(roleArr[0]) < this.roleLayer.getChildIndex(role))
                this.roleLayer.swapChildren(roleArr[0], role);
        }
    }

    /**
     * 显示伤害效果
     * @param eff
     */
    public showDamageEff(eff:egret.DisplayObject) {
        this.damageEffLayer.addChild(eff);
    }

    /**
     * 显示飘字效果
     * @param content
     * @param type
     */
    public flyTxt(content:any, type:number=0){
        let fontEff;
        switch (type) {
            case FightFontEffEnum.PHYSICAL_ATK:
                fontEff = new FontPhysicalAtkEff();
                break;

            case FightFontEffEnum.MAGIC_ATK:
                fontEff = new FontMagicAtkEff();
                break;

            case FightFontEffEnum.ADD_HP:
                fontEff = new FontAddHPEff();
                break;

            case FightFontEffEnum.SYSTEM:
                fontEff = new FontSystemEff();
                break;

            case FightFontEffEnum.OTHER:
                fontEff = new FontOtherEff();
                break;
        }
        if (fontEff) {
            this.fontEffLayer.addChild(fontEff);
            fontEff.show(content);
        }
    }

    public tweenRemoveRole(off:number){
        if (off > 0 && this.level > 0) {
            var tween = egret.Tween.get(this.roleLayer);
            tween.to({x:this.roleLayer.x - PVEBackGround.WIDTH},
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
        if (this.level < 0 || this.type != FightTypeEnum.PVE) {
            this.addRoles(this.elements, false);
        } else {
            this.addRoles(this.elements, true);
        }

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

    public dispose() {
        this.reset();
        this.removeEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.removeEventListener("role_die", this.onRoleDie, this, true);
    }
}
