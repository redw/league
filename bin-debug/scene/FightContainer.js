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
        this.meanWhileStep = 1;
        this.leftRoles = Array(9);
        this.rightRoles = Array(9);
        this.roles = [this.leftRoles, this.rightRoles];
        this.state = FightStateEnum.Wait;
        this.type = FightTypeEnum.PVE;
        this.level = -1;
        this.steps = [];
        this.fightSteps = [];
        this.elements = [];
        this.autoFight = false;
        this.moveCount = 0;
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
    var d = __define,c=FightContainer,p=c.prototype;
    /**
     * 开始战斗
     * @param data  角色的数据
     * @param auto
     * @param level
     */
    p.startFight = function (data, auto, level) {
        if (auto === void 0) { auto = false; }
        if (level === void 0) { level = 1; }
        this.autoFight = auto;
        this.elements = [];
        var arr = data.concat();
        for (var i = 0; i < arr.length; i++) {
            var roleData = new FightRoleData();
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
    };
    p.addRoles = function (elements, withTween) {
        var _this = this;
        var arr = elements;
        this.moveCount = 0;
        for (var i = 0; i < arr.length; i++) {
            var roleData = arr[i];
            var role = new FightRole(this, roleData);
            var side = roleData.side - 1;
            var pos = roleData.pos;
            this.roles[side][pos] = role;
            if (!!withTween) {
                var tox = role.x;
                if (roleData.side == FightSideEnum.LEFT_SIDE) {
                    role.x = fight.WIDTH * -0.5 + role.x;
                }
                else {
                    role.x = fight.WIDTH * 0.5 + role.x;
                }
                egret.Tween.get(role).to({ x: tox }, 500).
                    call(function () { _this.roleMoveComplete(); }, this);
            }
        }
        var orders = [0, 3, 6, 1, 4, 7, 2, 5, 8];
        var zIndex = 0;
        for (var i = 0; i < orders.length; i++) {
            var index = orders[i];
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
        if (!withTween && this.autoFight) {
            this.start();
        }
    };
    p.start = function () {
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
    };
    p.roleMoveComplete = function () {
        this.moveCount++;
        if (this.moveCount >= this.elements.length) {
            console.log(this.moveCount, this.elements.length, "...");
            if (this.autoFight)
                this.start();
        }
    };
    p.startStep = function () {
        if (this.fightSteps.length <= 0) {
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
        startRole.fight(data, delay);
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
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].isHero) {
                var pos = this.elements[i].pos;
                result[pos] = +(this.elements[i].id);
            }
        }
        return result;
    };
    /**
     * 把行动的角色提到排最前面
     * @param role
     * @param targetArr
     */
    p.bringRoleToFront = function (role, targetArr) {
        var roleArr = [];
        var leftRoles = this.leftRoles.filter(function (value) { return !!value; });
        var rightRoles = this.rightRoles.filter(function (value) { return !!value; });
        roleArr = roleArr.concat(leftRoles, rightRoles);
        roleArr = roleArr.filter(function (value) { return (value.roleData.pos) % 3 == (role.roleData.pos % 3); });
        if (roleArr.length == 1) {
            roleArr = roleArr.concat(targetArr);
        }
        roleArr.sort(function (a, b) { return b.zIndex - a.zIndex; });
        if (roleArr[0] != role) {
            this.roleLayer.swapChildren(roleArr[0], role);
        }
    };
    /**
     * 把行动的角色移动到正确的位置
     * @param role
     * @param targetArr
     */
    p.bringRoleToSelfZPos = function (role, targetArr) {
        var roleArr = [];
        var leftRoles = this.leftRoles.filter(function (value) { return !!value; });
        var rightRoles = this.rightRoles.filter(function (value) { return !!value; });
        roleArr = roleArr.concat(leftRoles, rightRoles);
        roleArr = roleArr.filter(function (value) { return (value.roleData.pos) % 3 == (role.roleData.pos % 3); });
        if (roleArr.length == 1) {
            roleArr = roleArr.concat(targetArr);
        }
        roleArr.sort(function (a, b) { return b.zIndex - a.zIndex; });
        if (roleArr[0] != role) {
            if (this.roleLayer.getChildIndex(roleArr[0]) < this.roleLayer.getChildIndex(role))
                this.roleLayer.swapChildren(roleArr[0], role);
        }
    };
    /**
     * 显示伤害效果
     * @param eff
     */
    p.showDamageEff = function (eff) {
        this.damageEffLayer.addChild(eff);
    };
    /**
     * 显示飘字效果
     * @param content
     * @param type
     */
    p.flyTxt = function (content, type) {
        if (type === void 0) { type = 0; }
        var fontEff;
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
    };
    p.tweenRemoveRole = function (off) {
        var _this = this;
        if (off > 0 && this.level > 0) {
            var tween = egret.Tween.get(this.roleLayer);
            tween.to({ x: this.roleLayer.x - PVEBackGround.WIDTH }, fight.MIDDLE_GROUND_MOVE_TIME, egret.Ease[fight.MIDDLE_GROUND_MOVE_EASE]).call(function () {
                _this.roleLayer.x = 0;
                _this.reset();
                egret.setTimeout(function () { _this.tweenRemoveRoleComplete(); }, _this, 100);
            }, this);
        }
        else {
            this.reset();
            this.tweenRemoveRoleComplete();
        }
    };
    p.tweenRemoveRoleComplete = function () {
        if (this.level < 0 || this.type != FightTypeEnum.PVE) {
            this.addRoles(this.elements, false);
        }
        else {
            this.addRoles(this.elements, true);
        }
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
//# sourceMappingURL=FightContainer.js.map