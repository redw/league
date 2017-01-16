/**
 * 战斗角色容器
 * @author hh
 */
class FightContainer extends egret.DisplayObjectContainer {
    private bunch:string = "a";                                                 // 串
    public result:number = 0;                                                   // 战斗结果
    private level:number = -1;                                                  // 战斗配置id(pvp战斗无视)
    private steps:any[] = [];                                                   // 战斗步骤(副本)
    private autoFight:boolean = false;                                          // 是否自动战斗
    private type:number = FightTypeEnum.PVE;                                    // 战斗类型
    private dataGenerator:FightProcessGenerator;                                // 战斗过程生成器(如果需前端算)

    private state:number = FightStateEnum.Wait;                                 // 战斗状态
    public oldLifeRatio:number = 1;                                             // 生命进度条
    private isHeroDataUpdate:boolean = false;                                   // 英雄数据是否变化
    private initRoleCount:number = 0;                                           // 初始角色数量
    private meanWhileStep:number = 1;                                           // 同时可出战的步数
    public leftTotalLife:string = "1";                                          // 左方总生命
    public rightTotalLife:string = "1";                                         // 右方总生命
    private fightSteps:any[] = [];                                              // 战斗步骤
    public props:number[] = [];                                                 // 道具

    private warnEff:FightWarnEff;                                               // 血量不足20%时的警告效果
    private shakeScreenEff:ShakeScreenEff;                                      // 震屏效果
    private fontEffLayer:eui.Group;                                             // 文字效果层
    private damageEffLayer:eui.Group;                                           // 伤害层
    private roleLayer:eui.Group;                                                // 角色层
    private grayLayer:egret.Shape;                                              // 灰色层
    private dustLayer:eui.Group;                                                // 灰尘层
    private foregroundLayer:PVEForeground;                                      // 前景层
    private middleGroundLayer:PVEMiddleGround;                                  // 中景层
    private prospectLayer:PVEProspect;                                          // 远景层
    private transitionLayer:PVETransitionEff;                                   // 场景切换层
    private leftAreaCont:egret.DisplayObjectContainer;                          // 左侧area效果层
    private rightAreaCont:egret.DisplayObjectContainer;                         // 右侧area效果层
    private palmEff:BuddhaPalmEff;                                              // 如来神掌
    private dropProps:DropItem[];                                               // 掉落的道具数组

    private originalElements:{id:number, side:number, pos:number}[] = [];
    private leftRoles:FightRole[] = Array(fight.ROLE_UP_LIMIT);
    private rightRoles:FightRole[] = Array(fight.ROLE_UP_LIMIT);
    private roles:FightRole[][] = [this.leftRoles, this.rightRoles];

    public constructor(type:number = FightTypeEnum.PVE) {
        super();
        this.type = type;
        let hasTween = (type == FightTypeEnum.PVE);

        if (type == FightTypeEnum.PVE) {
            this.dropProps = [];
            for (let i = 0; i < fight.DROP_POS.length; i++) {
                let dropItem = new DropItem();
                dropItem.x = fight.DROP_POS[i].x;
                dropItem.y = fight.DROP_POS[i].y;
                this.dropProps.push(dropItem);
            }
        }

        if (type == FightTypeEnum.PVE || type == FightTypeEnum.BOSS) {
            this.prospectLayer = new PVEProspect(hasTween);
            this.addChild(this.prospectLayer);

            this.middleGroundLayer = new PVEMiddleGround(hasTween);
            this.addChild(this.middleGroundLayer);
        }

        this.grayLayer = new egret.Shape();
        this.addChild(this.grayLayer);

        this.dustLayer = new eui.Group();
        this.addChild(this.dustLayer);

        this.roleLayer = new eui.Group();
        this.addChild(this.roleLayer);

        this.damageEffLayer = new eui.Group();
        this.addChild(this.damageEffLayer);

        if (type == FightTypeEnum.PVE || type == FightTypeEnum.BOSS) {
            this.foregroundLayer = new PVEForeground(hasTween);
            this.addChild(this.foregroundLayer);

            this.transitionLayer = new PVETransitionEff({x:fight.WIDTH, y:fight.HEIGHT});
            this.addChild(this.transitionLayer);
        }

        this.fontEffLayer = new eui.Group();
        this.addChild(this.fontEffLayer);

        this.addEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.addEventListener("role_die", this.onRoleDie, this, true);
        this.addEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.addEventListener("fight_ready_complete", this.onReadyComplete, this, true);
        EventManager.inst.addEventListener("use_prop_eff", this.onUseProp, this);
        EventManager.inst.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onHeroDataUpdate, this);
    }

    private onHeroDataUpdate(e:egret.Event) {
        this.isHeroDataUpdate = true;
    }

    /**
     * 布署角色
     * @param data  角色的数据
     * @param auto  是否自动开战(只对pve有用)
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
            if (this.level < 0 || Config.StageData[this.level].map != Config.StageData[level].map) {
                this.transitionLayer.level = level;
            }
        } else if (this.type == FightTypeEnum.PVP) {
            this.reset();
            this.bornRoles();
        } else if (this.type == FightTypeEnum.BOSS) {
            this.reset();
            this.foregroundLayer.level = level;
            this.middleGroundLayer.level = level;
            this.prospectLayer.level = level;
            this.tweenRemoveRoleComplete();
        }
        this.level = level;
    }

    /**
     * 添加角色
     * @param elements
     * @param withTween
     */
    private addRoles(elements:FightRoleVO[], withTween:boolean){
        let arr = elements;
        this.moveCount = 0;
        for (let i = 0; i < arr.length; i++) {
            let roleData = arr[i];
            let role = FightRoleFactory.createRole(this, roleData);
            this.initRoleCount++;
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
                call(()=>{
                    egret.Tween.removeTweens(role);
                    this.roleMoveComplete();}, this);
            }
        }
        let orders = fight.ROLE_Z_INDEX_ARR;
        let zIndex = 0;
        for (let i = 0; i < orders.length; i++) {
            let index = orders[i];
            if (index == fight.ADD_AREA_IN_INDEX) {
                this.leftAreaCont = new egret.DisplayObjectContainer();
                this.roleLayer.addChild(this.leftAreaCont);
            }
            if (this.roles[0][index]) {
                this.roles[0][index].zIndex = zIndex;
                this.roleLayer.addChild(this.roles[0][index]);
                zIndex++;
            }

            let dropIndex = fight.ADD_DROP_IN_INDEX.indexOf(index);
            if (dropIndex > -1) {
                this.roleLayer.addChild(this.dropProps[dropIndex]);
            }

            if (index == fight.ADD_AREA_IN_INDEX) {
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

                let hasDrop = false;
                for (let i = 0; i < this.dropProps.length; i++) {
                    if (this.dropProps[i].dropId > 0) {
                        hasDrop = true;
                        break;
                    }
                }
                if (!hasDrop) {
                    let drops = UserProxy.inst.fightData.generateDrop();
                    for (let i = 0; i < drops.length; i++) {
                        if (this.dropProps[i]) {
                            this.dropProps[i].dropId = drops[i];
                        }
                    }
                }

                this.dispatchEventWith("fight_start", true);
                this.autoFight = false;
                if (steps) {
                    for (let i = 0; i < steps.length; i++) {
                        steps[i].index = i;
                    }
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

                console.groupCollapsed("-----------------------战斗信息---------------");
                let hero = Array(fight.ROLE_UP_LIMIT);
                let monsterIds = Array(fight.ROLE_UP_LIMIT);
                for (let i = 0; i < this.originalElements.length; i++) {
                    if (this.originalElements[i]) {
                        if (this.originalElements[i].side == 1) {
                            hero[this.originalElements[i].pos] = this.originalElements[i].id;
                        }
                        if (this.originalElements[i].side == 2) {
                            monsterIds[this.originalElements[i].pos] = this.originalElements[i].id;
                        }
                    }
                }
                console.log("英雄id:", hero);
                console.log("串:", this.bunch);
                console.log("怪物id:", monsterIds);
                console.log("步骤:", this.steps);
                console.groupEnd();

                if (this.type != FightTypeEnum.PVP) {
                    this.startStep();
                }
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
            this.addEventListener(egret.Event.ENTER_FRAME, this.checkFightEnd, this);
        } else {
            if (this.isHeroDataUpdate && this.type == FightTypeEnum.PVE) {
                this.fightSteps = this.dataGenerator.updateGenerateData();
                this.steps = this.fightSteps.concat();
                this.isHeroDataUpdate = false;
            }
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

    private doStep(data:FightReportItem, delay:number) {
        let startRole = this.getRoleByStr(data.pos);
        startRole.fight(data, delay);
    }

    private onOneStepComplete() {
        if (this.palmEff) {
            this.palmEff.free();
        } else {
            this.meanWhileStep--;
            if (this.meanWhileStep <= 0)
                egret.setTimeout(() => {
                    this.startStep();
                }, null, fight.STEP_DELAY_TIME);
        }
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

    /**
     * 检测战斗结束
     */
    private checkFightEnd(){
        let canEnd:boolean = true;
        if (this.leftAreaCont && this.leftAreaCont.numChildren > 0) {
            canEnd = false;
        }
        if (this.rightAreaCont && this.rightAreaCont.numChildren > 0) {
            canEnd = false;
        }
        if (this.damageEffLayer && this.damageEffLayer.numElements > 0) {
            canEnd = false;
        }
        for (let i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            if (this.roles[0][i] && BigNum.greater(fight.DIE_HP, this.roles[0][i].curHP)) {
                canEnd = false;
                break;
            }
            if (this.roles[1][i] && BigNum.greater(fight.DIE_HP, this.roles[1][i].curHP)) {
                canEnd = false;
                break;
            }
        }
        if (canEnd) {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.checkFightEnd, this);
            this.state = FightStateEnum.End;
            egret.setTimeout(()=>{
                this.dispatchEventWith(ContextEvent.FIGHT_END, true);
            }, this, 200);
        }
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
        roleArr = roleArr.filter((value) => {return (!!value && !!value.parent)});
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
        roleArr = roleArr.filter((value) => {return (!!value && !!value.parent)});
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

    private tweenRemoveRole(off:number){
        if (off > 0 && this.level > 0) {
            let tween = egret.Tween.get(this.roleLayer);
            tween.to({x:this.roleLayer.x - fight.WIDTH},
                fight.MIDDLE_GROUND_MOVE_TIME,
                egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).call(
                ()=>{
                    this.roleLayer.x = 0;
                    this.reset();
                    egret.setTimeout(()=>{this.tweenRemoveRoleComplete();}, this, fight.MIDDLE_GROUND_MOVE_TIME)
                },
                this
            )
        } else {
            this.reset();
            this.tweenRemoveRoleComplete();
        }
    }

    private bornRoles(){
        let arr = this.originalElements;
        let roleArr:FightRoleVO[] = fight.generateFightRoleVOArr(arr);
        let self = this;
        for (let i = 0; i < roleArr.length; i++) {
            if (roleArr[i]) {
                egret.setTimeout((index)=>{
                    let eff = new MCEff("role_born");
                    this.bornRole(roleArr[index]);
                    eff.x = fight.getRoleInitPoint(roleArr[index]).x;
                    eff.y = fight.getRoleInitPoint(roleArr[index]).y;
                    this.roleLayer.addChild(eff);
                }, this, i * 200, i);
            }
        }
    }

    private bornRole(roleData:FightRoleVO){
        let role = new FightRole(this, roleData);
        let side = roleData.side - 1;
        let pos = roleData.pos;
        this.roles[side][pos] = role;
        this.roleLayer.addChild(role);
        let sideRoles = this.roles[side].concat();

        let zIndexArr = fight.ROLE_Z_INDEX_ARR;
        role["z__index"] = zIndexArr[pos];
        sideRoles.sort((a, b)=>{return a["z__index"] - b["z__index"]});
        sideRoles = sideRoles.filter((value)=>{return !!value});
        for (let i = 0; i < sideRoles.length; i++) {
            if (sideRoles[i].parent) {
                sideRoles[i].parent.removeChild(sideRoles[i]);
            }
            this.roleLayer.addChild(sideRoles[i]);
            sideRoles[i].idle();
        }
        this.initRoleCount++;
        if (this.initRoleCount >= this.originalElements.length) {
            egret.setTimeout(this.startStep, this, 200);
        }
    }

    // 目前只有pve有跟着场景移除角色
    private tweenRemoveRoleComplete(e:egret.Event=null){
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.tweenRemoveRole, this);
        }
        let arr = this.originalElements;
        let roleArr:FightRoleVO[] = fight.generateFightRoleVOArr(arr);

        if (this.autoFight) {
            this.addRoles(roleArr, true);
        } else {
            if (this.level % 10 ==  0) {
                let eff = new BossIncomingEff();
                this.autoFight = true;
                eff.addEventListener(egret.Event.COMPLETE, this.tweenRemoveRole, this);
                this.damageEffLayer.addChild(eff);
            } else if (Config.StageData[this.level - 1] && Config.StageData[this.level].map != Config.StageData[this.level - 1].map){
                let eff = new NewChapterEff();
                this.autoFight = true;
                eff.addEventListener(egret.Event.COMPLETE, this.tweenRemoveRole, this);
                this.damageEffLayer.addChild(eff);
            } else {
                this.autoFight = true;
                this.addRoles(roleArr, true);
            }
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
        if (this.type != FightTypeEnum.PVP && range > 0) {
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

    /**
     * 释放技能前的效果
     * @param parent
     * @param eff
     * @param needMode
     */
    public showFreeSkillEff(parent:egret.DisplayObjectContainer, eff:egret.DisplayObject, needMode:boolean){
        this.grayLayer.graphics.clear();
        if (needMode && this.stage) {
            this.grayLayer.graphics.beginFill(0x0, 0.4);
            this.grayLayer.graphics.drawRect(-30,-30,this.stage.width + 60, this.stage.height + 60);
            egret.setTimeout(()=>{this.grayLayer.graphics.clear();
            }, this, 1000);
        }
        parent.addChild(eff);
    }

    /**
     * area攻击效果
     * @param eff
     * @param value
     */
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

    /**
     * 显示升级效果
     * @param value
     */
    public showUPLevelEff(value:{id:number, level:number}){
        if (value) {
            for (let i = 0; i < fight.ROLE_UP_LIMIT; i++) {
                if (this.leftRoles[i]) {
                    this.leftRoles[i].showUPLevelEff(value);
                }
            }
        }
    }

    public reset() {
        for (let i = 0; i < this.dropProps.length; i++) {
            if (this.dropProps[i].parent) {
                this.dropProps[i].stop();
                this.dropProps[i].parent.removeChild(this.dropProps[i]);
            }
        }
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
        if (ratio <= 0.2 && this.oldLifeRatio < ratio) {
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

    private onUseProp(e:egret.Event) {
        if (this.type == FightTypeEnum.PVE) {
            let id = e.data;
            if (id == 1) {
                // 五指山
                if (!this.palmEff) {
                    this.palmEff = new BuddhaPalmEff();
                    this.palmEff.x = fight.AREA_POS[FightSideEnum.LEFT_SIDE - 1].x;
                    this.palmEff.x = fight.AREA_POS[FightSideEnum.LEFT_SIDE - 1].y;
                    this.palmEff.addEventListener(egret.Event.COMPLETE, this.onPalmEffComplete, this);
                    this.addChild(this.palmEff);
                }
            } if (id == 2) {
                // 攻击翻倍
                this.dataGenerator.doubleSideAtk(FightSideEnum.LEFT_SIDE);
                let sideRoles = this.roles[FightSideEnum.LEFT_SIDE - 1].filter((value)=>{return !!value});
                for (let i = 0; i < sideRoles.length; i++) {
                    sideRoles[i].doubleAtk();
                }
            } if (id == 3) {
                // 回复生命
                this.dataGenerator.recoverySideBlood(FightSideEnum.LEFT_SIDE);
                let sideRoles = this.roles[FightSideEnum.LEFT_SIDE - 1].filter((value)=>{return !!value});
                for (let i = 0; i < sideRoles.length; i++) {
                    sideRoles[i].recoveryBlood();
                }
            }
            this.props.push(id);
        }
    }

    private onPalmEffComplete(e:egret.Event) {
        this.palmEff.removeEventListener(egret.Event.COMPLETE, this.onPalmEffComplete, this);
        this.palmEff = null;
        this.dataGenerator.doPalmHurt(FightSideEnum.RIGHT_SIDE);
        let roleArr = this.roles[FightSideEnum.RIGHT_SIDE - 1];
        this.addEventListener(egret.Event.ENTER_FRAME, this.onCheckAllIdle, this);
        for (let i = 0; i < roleArr.length; i++) {
            if (roleArr[i]) {
                roleArr[i].hit();
            }
        }
    }

    private onCheckAllIdle(){
        this.removeEventListener(egret.Event.ENTER_FRAME, this.onCheckAllIdle, this);
        this.onOneStepComplete();
    }

    /** 强制结束? */
    public forceEnd(){
        this.reset();
        this.dispatchEventWith(ContextEvent.FIGHT_END, true);
    }

    private onReadyComplete(e:egret.Event) {
        this.leftTotalLife = e.data[0] || "1";
        this.rightTotalLife = e.data[1] || "1";
    }

    public dispose() {
        this.reset();
        this.removeEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.removeEventListener("role_die", this.onRoleDie, this, true);
        this.removeEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.removeEventListener("fight_ready_complete", this.onReadyComplete, this, true);
        EventManager.inst.addEventListener("use_prop_eff", this.onUseProp, this);
        EventManager.inst.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onHeroDataUpdate, this);
    }
}
