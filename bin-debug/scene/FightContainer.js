var FightStateEnum;
(function (FightStateEnum) {
    FightStateEnum[FightStateEnum["Wait"] = 1] = "Wait";
    FightStateEnum[FightStateEnum["Fight"] = 2] = "Fight";
    FightStateEnum[FightStateEnum["End"] = 3] = "End";
})(FightStateEnum || (FightStateEnum = {}));
var FightTypeEnum;
(function (FightTypeEnum) {
    FightTypeEnum[FightTypeEnum["PVE"] = 1] = "PVE";
    FightTypeEnum[FightTypeEnum["PVP"] = 2] = "PVP";
    FightTypeEnum[FightTypeEnum["DUP"] = 3] = "DUP";
})(FightTypeEnum || (FightTypeEnum = {}));
/**
 * 战斗角色容器
 *
 * @author hh
 */
var FightContainer = (function (_super) {
    __extends(FightContainer, _super);
    function FightContainer(type) {
        if (type === void 0) { type = FightTypeEnum.PVE; }
        _super.call(this);
        this.fightSteps = [];
        this.steps = [];
        this.meanWhileStep = 1;
        this.leftRoles = Array(9);
        this.rightRoles = Array(9);
        this.roles = [this.leftRoles, this.rightRoles];
        this.state = FightStateEnum.Wait;
        this.type = FightTypeEnum.PVE;
        this.type = type;
        this.addEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.addEventListener("role_die", this.onRoleDie, this, true);
        this.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onRoleDataUpdate, this);
    }
    var d = __define,c=FightContainer,p=c.prototype;
    /**
     * 开始战斗
     *
     * @param left  左边角色数据
     * @param right 右边角色数据
     * @param auto
     */
    p.startFight = function (left, right, auto) {
        if (auto === void 0) { auto = false; }
        this.reset();
        this.elements = [].concat(left, right);
        this.initElement();
        if (auto) {
            this.start();
        }
    };
    /**
     * 开始战斗  通过配置数据
     * @param data
     * @param auto
     */
    p.startFightByConfig = function (data, auto) {
        if (auto === void 0) { auto = false; }
        this.reset();
        this.elements = data.concat();
        this.initElement();
        if (auto) {
            this.start();
        }
    };
    p.initElement = function () {
        var arr = this.elements.concat();
        var orders = [0, 3, 6, 1, 4, 7, 2, 5, 8];
        for (var i_1 = 0; i_1 < arr.length; i_1++) {
            var roleData = new FightRoleData();
            roleData.parse(arr[i_1], arr[i_1].id);
            var role = new FightRole(this, roleData);
            var side = roleData.side - 1;
            var pos = roleData.pos;
            this.roles[side][pos] = role;
        }
        for (var i = 0; i < orders.length; i++) {
            var index = orders[i];
            !!this.roles[0][index] && this.addChild(this.roles[0][index]);
            !!this.roles[1][index] && this.addChild(this.roles[1][index]);
        }
    };
    p.start = function () {
        if (this.state != FightStateEnum.Fight) {
            if (this.state == FightStateEnum.End) {
                this.reset();
                this.initElement();
            }
            this.state = FightStateEnum.Fight;
            this.dataGenerator = new FightProcessGenerator();
            this.dataGenerator.addConfigDataArr(this.elements.concat());
            this.fightSteps = this.dataGenerator.generateData();
            this.steps = this.fightSteps.concat();
            fight.recordLog(this.steps, fight.LOG_FIGHT_INFO);
            this.startStep();
        }
    };
    p.startStep = function () {
        if (this.fightSteps.length <= 0) {
            fight.recordLog("战斗结束.oh yeah!");
            this.end();
        }
        else {
            var count = this.getPlayingCount();
            this.meanWhileStep = count;
            var delayTime = 0;
            while (count--) {
                var data = this.fightSteps.shift();
                this.doStep(data, delayTime);
                delayTime += fight.MEANWHILE_FIGHT_DELAY_TIME;
            }
        }
    };
    p.onRoleDataUpdate = function () {
        this.fightSteps = this.dataGenerator.updateGenerateData();
        this.steps = this.fightSteps.concat();
    };
    p.doStep = function (data, delay) {
        var startRole = this.getRoleByStr(data.pos);
        startRole.playFight(data, delay);
    };
    p.onOneStepComplete = function () {
        var _this = this;
        this.meanWhileStep--;
        if (this.meanWhileStep <= 0)
            egret.setTimeout(function () {
                _this.startStep();
            }, null, 10);
    };
    p.onRoleDie = function (e) {
        var role = e.data;
        this.roleDie(role);
    };
    p.roleDie = function (role) {
        var side = role.roleData.side - 1;
        var pos = role.roleData.pos;
        delete this.roles[side][pos];
        role.dispose();
    };
    p.getRoleByStr = function (str) {
        var side = +str.substr(0, 1) - 1;
        var pos = +str.substr(2, 1);
        return this.roles[side][pos];
    };
    p.getPlayingCount = function () {
        var result = 1;
        if (this.fightSteps.length > 1) {
            var firstPos = this.fightSteps[0].pos;
            var firstSide = firstPos.substr(0, 1);
            for (var i = 1; i < this.fightSteps.length; i++) {
                var curPos = this.fightSteps[i].pos;
                var curSide = curPos.substr(0, 1);
                if ((firstSide == curSide) && (firstPos != curPos)) {
                    result++;
                    firstPos = curPos;
                }
                else {
                    break;
                }
            }
        }
        return fight.CAN_MEANWHILE_FIGHT ? result : 1;
    };
    p.end = function () {
        this.state = FightStateEnum.End;
        this.dispatchEventWith("fight_end", true);
    };
    /**
     * 得到总步数
     * @returns {number}
     */
    p.getStepCount = function () {
        return this.steps.length;
    };
    /**
     * 得到step
     */
    p.getSteps = function () {
        return this.steps.concat();
    };
    /**
     * 得到参加战斗的怪
     */
    p.getMonsterArr = function () {
        var result = [];
        for (var i = 0; i < 9; i++) {
            result[i] = 0;
        }
        for (var i_2 = 0; i_2 < this.elements.length; i_2++) {
            if (this.elements[i_2].side == fight.SIDE_RIGHT) {
                var pos = this.elements[i_2].pos;
                result[pos] = +(this.elements[i_2].id);
            }
        }
        return result;
    };
    p.reset = function () {
        this.fightSteps = [];
        for (var i = 0; i < this.leftRoles.length; i++) {
            if (this.leftRoles[i]) {
                this.leftRoles[i].dispose();
                delete this.leftRoles[i];
            }
        }
        for (var i = 0; i < this.rightRoles.length; i++) {
            if (this.rightRoles[i]) {
                this.rightRoles[i].dispose();
                delete this.rightRoles[i];
            }
        }
    };
    p.dispose = function () {
        this.reset();
        this.removeEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.removeEventListener("role_die", this.onRoleDie, this, true);
    };
    return FightContainer;
}(egret.DisplayObjectContainer));
egret.registerClass(FightContainer,'FightContainer');
