enum FightStateEnum{
    Wait = 1,
    Fight,
    End
}

enum FightTypeEnum {
    PVE = 1,
    PVP,
    DUP
}

/**
 * 战斗角色容器
 *
 * @author hh
 */
class FightContainer extends egret.DisplayObjectContainer {
    private fightSteps:any[] = [];
    private steps:any[] = [];
    private meanWhileStep:number = 1;
    private leftRoles:FightRole[] = Array(9);
    private rightRoles:FightRole[] = Array(9);
    private roles:FightRole[][] = [this.leftRoles, this.rightRoles];
    private dataGenerator:FightProcessGenerator;
    private state:number = FightStateEnum.Wait;
    private type:number = FightTypeEnum.PVE;
    private elements:{id:number, pos:number, side:number}[];

    public constructor(type:number = FightTypeEnum.PVE) {
        super();
        this.type = type;
        this.addEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.addEventListener("role_die", this.onRoleDie, this, true);
        this.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onRoleDataUpdate, this);
    }

    /**
     * 开始战斗
     *
     * @param left  左边角色数据
     * @param right 右边角色数据
     * @param auto
     */
    public startFight(left:{id:number, pos:number, side:number}[],
                      right:{id:number, pos:number, side:number}[],
                      auto:boolean = false) {
        this.reset();
        this.elements = [].concat(left, right);
        this.initElement();
        if (auto) {
            this.start();
        }
    }

    /**
     * 开始战斗  通过配置数据
     * @param data
     * @param auto
     */
    public startFightByConfig(data:{id:number, pos:number, side:number}[], auto:boolean = false) {
        this.reset();
        this.elements = data.concat();
        this.initElement();
        if (auto) {
            this.start();
        }
    }

    private initElement() {
        let arr = this.elements.concat();
        let orders = [0,3,6,1,4,7,2,5,8];
        for (let i = 0; i < arr.length; i++) {
            let roleData = new FightRoleData();
            roleData.parse(arr[i], arr[i].id);
            let role = new FightRole(this, roleData);
            let side = roleData.side - 1;
            let pos = roleData.pos;
            this.roles[side][pos] = role;
        }
        for (var i = 0; i < orders.length; i++) {
            let index = orders[i];
            !!this.roles[0][index] && this.addChild(this.roles[0][index]);
            !!this.roles[1][index] && this.addChild(this.roles[1][index]);
        }
    }

    public start() {
        if (this.state != FightStateEnum.Fight) {
            if (this.state == FightStateEnum.End) {
                this.reset();
                this.initElement()
            }
            this.state = FightStateEnum.Fight;
            this.dataGenerator = new FightProcessGenerator();
            this.dataGenerator.addConfigDataArr(this.elements.concat());
            this.fightSteps = this.dataGenerator.generateData();
            this.steps = this.fightSteps.concat();
            fight.recordLog(this.steps, fight.LOG_FIGHT_INFO);
            this.startStep();
        }
    }

    private startStep() {
        if (this.fightSteps.length <= 0) {
            fight.recordLog("战斗结束.oh yeah!");
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
        startRole.playFight(data, delay);
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
        for (var i = 0; i < 9; i++) {
            result[i] = 0;
        }
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].side == fight.SIDE_RIGHT) {
                let pos = this.elements[i].pos;
                result[pos] = +(this.elements[i].id);
            }
        }
        return result;
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
