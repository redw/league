/**
 * 战斗角色容器
 * @author hh
 */
var FightContainer = (function (_super) {
    __extends(FightContainer, _super);
    function FightContainer(type) {
        if (type === void 0) { type = FightTypeEnum.PVE; }
        _super.call(this);
        this.bunch = "a"; // 串
        this.result = 0; // 战斗结果
        this.level = -1; // 战斗配置id(pvp战斗无视)
        this.steps = []; // 战斗步骤(副本)
        this.autoFight = false; // 是否自动战斗
        this.firstEnter = false; // 是否第一次进
        this.isGuide = false; // 是否是正在引导
        this.type = FightTypeEnum.PVE; // 战斗类型
        this.forceEnd = false; // 强制结束
        this.state = FightStateEnum.Wait; // 战斗状态
        this.oldLifeRatio = -1; // 生命进度条
        this.isHeroDataUpdate = false; // 英雄数据是否变化
        this.initRoleCount = 0; // 初始角色数量
        this.meanWhileStep = 1; // 同时可出战的步数
        this.leftTotalLife = "1"; // 左方总生命
        this.rightTotalLife = "1"; // 右方总生命
        this.fightSteps = []; // 战斗步骤
        this.props = []; // 道具
        this.originalElements = [];
        this.leftRoles = Array(fight.ROLE_UP_LIMIT);
        this.rightRoles = Array(fight.ROLE_UP_LIMIT);
        this.roles = [this.leftRoles, this.rightRoles];
        this.moveCount = 0;
        this.type = type;
        var hasTween = type == FightTypeEnum.PVE;
        if (type == FightTypeEnum.PVE) {
            this.dropProps = [];
            for (var i = 0; i < fight.DROP_POS.length; i++) {
                var dropItem = new DropItem();
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
        else {
            var areaImage = new PriorityImage(fight.LOAD_PRIORITY_AREA_BG, "arena_background_png");
            areaImage.x = -30;
            areaImage.y = 140;
            this.addChild(areaImage);
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
            this.transitionLayer = new PVETransitionEff({ x: fight.WIDTH, y: fight.HEIGHT });
            this.addChild(this.transitionLayer);
        }
        this.fontEffLayer = new eui.Group();
        this.addChild(this.fontEffLayer);
        this.addEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.addEventListener("role_die", this.onRoleDie, this, true);
        this.addEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.addEventListener("fight_ready_complete", this.onReadyComplete, this, true);
        EventManager.inst.addEventListener("use_prop", this.onUseProp, this);
        EventManager.inst.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onHeroDataUpdate, this);
    }
    var d = __define,c=FightContainer,p=c.prototype;
    p.onHeroDataUpdate = function (e) {
        this.isHeroDataUpdate = true;
    };
    /**
     * 布署角色
     * @param data  角色的数据
     * @param auto  是否自动开战(只对pve有用)
     * @param level 场景等级(只对pve和秘镜有用)
     * @param guide 是否是引导除段(引导阶段)
     * @param firstEnter 是否第一次进
     */
    p.fightDeployment = function (data, auto, level, guide, firstEnter) {
        if (auto === void 0) { auto = true; }
        if (level === void 0) { level = 1; }
        if (guide === void 0) { guide = false; }
        if (firstEnter === void 0) { firstEnter = false; }
        this.shakeScreenEff && this.shakeScreenEff.stopShake();
        this.autoFight = auto;
        this.isGuide = guide;
        this.firstEnter = firstEnter;
        this.bunch = fight.randomSkillTriggerBunch();
        this.originalElements = data.concat();
        if (this.type == FightTypeEnum.PVE) {
            this.foregroundLayer.level = level;
            this.middleGroundLayer.level = level;
            this.prospectLayer.level = level;
            this.level = level;
            if (firstEnter || Config.StageCommonData[Math.ceil(this.level / fight.MAP_SWITCH_SIZE)].map != Config.StageCommonData[Math.ceil(this.level / fight.MAP_SWITCH_SIZE)].map) {
                this.transitionLayer.level = level;
            }
            if (!guide) {
                this.tweenRemoveRole();
            }
        }
        else if (this.type == FightTypeEnum.PVP) {
            this.level = level;
            this.reset();
            var eff = new BattleStartEff();
            eff.addEventListener(egret.Event.COMPLETE, this.bornRoles, this);
            this.damageEffLayer.addChild(eff);
        }
        else if (this.type == FightTypeEnum.BOSS) {
            this.level = level;
            this.reset();
            this.foregroundLayer.source = Config.WeaponFb[level].map;
            this.middleGroundLayer.source = Config.WeaponFb[level].map;
            this.prospectLayer.source = Config.WeaponFb[level].map;
        }
    };
    p.forceStart = function (steps) {
        if (steps === void 0) { steps = null; }
        this.playSteps = steps;
        this.autoFight = true;
        this.tweenRemoveRoleComplete(null);
    };
    p.addGuideProp = function (propId) {
        var dropConfig = Config.DropData[propId];
        var resource = dropConfig.resource;
        var path = URLConfig.getPropEffectURL(resource);
        McUtil.create(path, resource, this.addPropComplete, this);
    };
    p.addPropComplete = function () {
        this.dropProps[0].dropId = 5;
        if (!this.dropProps[0].parent)
            this.roleLayer.addChild(this.dropProps[0]);
    };
    p.removeGuideProp = function () {
        var len = this.dropProps ? this.dropProps.length : 0;
        for (var i = 0; i < len; i++) {
            if (this.dropProps[i].parent) {
                this.dropProps[i].stop();
                this.dropProps[i].dropId = 0;
                this.dropProps[i].parent.removeChild(this.dropProps[i]);
            }
        }
    };
    /**
     * 添加角色
     * @param elements
     * @param withTween
     */
    p.addRoles = function (elements, withTween) {
        var _this = this;
        var arr = elements;
        this.moveCount = 0;
        var _loop_1 = function(i) {
            var roleData = arr[i];
            var role = FightRoleFactory.createRole(this_1, roleData);
            this_1.initRoleCount++;
            var side = roleData.side - 1;
            var pos = roleData.pos;
            this_1.roles[side][pos] = role;
            if (withTween) {
                var tox = role.x;
                if (roleData.side == FightSideEnum.LEFT_SIDE) {
                    role.x = fight.WIDTH * -0.5 + role.x;
                }
                else {
                    role.x = fight.WIDTH * 1.5 + role.x;
                }
                egret.Tween.get(role).to({ x: tox }, fight.MIDDLE_GROUND_MOVE_TIME).
                    call(function () {
                    egret.Tween.removeTweens(role);
                    _this.roleMoveComplete();
                }, this_1);
            }
        };
        var this_1 = this;
        for (var i = 0; i < arr.length; i++) {
            _loop_1(i);
        }
        var orders = fight.ROLE_Z_INDEX_ARR;
        var zIndex = 0;
        for (var i = 0; i < orders.length; i++) {
            var index = orders[i];
            if (index == fight.ADD_AREA_IN_INDEX) {
                this.leftAreaCont = new egret.DisplayObjectContainer();
                this.roleLayer.addChild(this.leftAreaCont);
            }
            if (this.roles[0][index]) {
                this.roles[0][index].zIndex = zIndex;
                this.roleLayer.addChild(this.roles[0][index]);
                zIndex++;
            }
            if (this.type == FightTypeEnum.PVE) {
                var dropIndex = fight.ADD_DROP_IN_INDEX.indexOf(index);
                if (dropIndex > -1) {
                    this.roleLayer.addChild(this.dropProps[dropIndex]);
                }
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
        if (!withTween && this.autoFight) {
            this.start(this.playSteps);
        }
    };
    /**
     * 开始战斗
     * @param steps
     */
    p.start = function (steps) {
        if (!this.originalElements || this.originalElements.length <= 0) {
            fight.recordLog("no role data,cannot start", fight.LOG_FIGHT_WARN);
        }
        else {
            if (this.state != FightStateEnum.Fight) {
                this.state = FightStateEnum.Fight;
                var hasDrop = false;
                var len = this.dropProps ? this.dropProps.length : 0;
                for (var i = 0; i < len; i++) {
                    if (this.dropProps[i].dropId > 0) {
                        hasDrop = true;
                        break;
                    }
                }
                if (!hasDrop) {
                    var drops = UserProxy.inst.fightData.generateDrop();
                    var dropIndex = 0;
                    for (var i = 0; i < drops.length; i++) {
                        if (this.dropProps && this.dropProps[i]) {
                            if (("RES_PROP_WITH_" + drops[i]) in fight) {
                                if (fight.isMCResourceLoaded(fight["RES_PROP_WITH_" + drops[i]])) {
                                    this.dropProps[dropIndex].dropId = drops[i];
                                    dropIndex++;
                                }
                            }
                            else {
                                this.dropProps[dropIndex].dropId = drops[i];
                                dropIndex++;
                            }
                        }
                    }
                }
                this.dispatchEventWith("fight_start", true);
                if (steps) {
                    for (var i = 0; i < steps.length; i++) {
                        steps[i].index = i;
                    }
                    this.fightSteps = steps.concat();
                }
                else {
                    this.dataGenerator = new FightProcessGenerator();
                    var arr = this.originalElements;
                    var roleArr = fight.generateFightRoleVOArr(arr);
                    this.dataGenerator.addSceneDataVec(roleArr);
                    this.fightSteps = this.dataGenerator.generateData(this.bunch);
                    this.result = this.dataGenerator.result;
                    this.dispatchEventWith("fight_ready_complete", true, [this.dataGenerator.getLeftTotalLife(), this.dataGenerator.getRightTotalLife()]);
                }
                this.steps = this.fightSteps.concat();
                var hero = Array(fight.ROLE_UP_LIMIT);
                var monsterIds = Array(fight.ROLE_UP_LIMIT);
                for (var i = 0; i < this.originalElements.length; i++) {
                    if (this.originalElements[i]) {
                        if (this.originalElements[i].side == 1) {
                            hero[this.originalElements[i].pos] = this.originalElements[i].id;
                        }
                        if (this.originalElements[i].side == 2) {
                            monsterIds[this.originalElements[i].pos] = this.originalElements[i].id;
                        }
                    }
                }
                if (Global.DEBUG) {
                    console.groupCollapsed("-----------------------战斗信息---------------");
                    console.log("英雄id:", hero);
                    console.log("串:", this.bunch);
                    console.log("怪物id:", monsterIds);
                    console.log("步骤:", this.steps);
                    console.groupEnd();
                }
                if (this.type != FightTypeEnum.PVP) {
                    if (this.autoFight) {
                        this.startStep();
                    }
                }
            }
            this.playSteps = null;
        }
    };
    p.roleMoveComplete = function () {
        this.moveCount++;
        if (this.moveCount >= this.originalElements.length) {
            if (this.autoFight)
                this.start(this.playSteps);
        }
    };
    p.startStep = function (e) {
        if (e === void 0) { e = null; }
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.startStep, this);
        }
        if (this.fightSteps.length <= 0) {
            this.oldLifeRatio = -1;
            this.addEventListener(egret.Event.ENTER_FRAME, this.checkFightEnd, this);
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
    p.doStep = function (data, delay) {
        var startRole = this.getRoleByPos(data.pos);
        if (startRole) {
            startRole.fight(data, delay);
        }
        else {
            fight.recordLog("\u7B2C" + data.index + "\u6B65\u51FA\u9519", fight.LOG_FIGHT_WARN);
        }
    };
    p.onOneStepComplete = function () {
        var _this = this;
        if (this.palmEff) {
            this.palmEff.free();
        }
        else {
            this.meanWhileStep--;
            if (this.meanWhileStep <= 0)
                egret.setTimeout(function () {
                    if (_this.forceEnd) {
                        _this.forceEnd = false;
                        _this.reset();
                        _this.state = FightStateEnum.End;
                        _this.dispatchEventWith(ContextEvent.FIGHT_END, true);
                    }
                    else {
                        _this.startStep();
                    }
                }, this, fight.STEP_DELAY_TIME);
        }
    };
    p.onRoleDie = function (e) {
        var role = e.data;
        this.roleDie(role);
    };
    p.roleDie = function (role) {
        var side = role.side - 1;
        var pos = role.pos;
        delete this.roles[side][pos];
        role.dispose();
        FightRoleFactory.freeRole(role);
    };
    p.getRoleByPos = function (str) {
        var side = +str.substr(0, 1) - 1;
        var pos = +str.substr(2, 1);
        return this.roles[side][pos];
    };
    p.getRole = function (value) {
        var side = value.side;
        var pos = value.pos;
        if (side < 1 || side > 2 || pos < 0 || pos > 8) {
            fight.recordLog("获取角色参数不对", fight.LOG_FIGHT_WARN);
            return null;
        }
        return this.roles[side - 1][pos];
    };
    p.getPlayingCount = function () {
        var result = 1;
        if (this.type != FightTypeEnum.PVE) {
            return result;
        }
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
    /**
     * 检测战斗结束
     */
    p.checkFightEnd = function () {
        var _this = this;
        var canEnd = true;
        if (canEnd) {
            this.removeEventListener(egret.Event.ENTER_FRAME, this.checkFightEnd, this);
            this.state = FightStateEnum.End;
            egret.setTimeout(function () {
                _this.dispatchEventWith(ContextEvent.FIGHT_END, true);
            }, this, 200);
        }
    };
    /**
     * 得到触发的串
     * @returns {string}
     */
    p.getTriggerChanceType = function () {
        return this.bunch;
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
        for (var i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            result[i] = 0;
        }
        for (var i = 0; i < this.originalElements.length; i++) {
            if (!fight.isHero(this.originalElements[i].id)) {
                var pos = this.originalElements[i].pos;
                result[pos] = +(this.originalElements[i].id);
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
        roleArr = roleArr.filter(function (value) { return (value.pos) % 3 == (role.pos % 3); });
        roleArr.concat(targetArr);
        roleArr = roleArr.filter(function (value) { return (!!value && !!value.parent); });
        roleArr.sort(function (a, b) { return b.zIndex - a.zIndex; });
        for (var i = 0; i < roleArr.length - 1; i++) {
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
        roleArr = roleArr.filter(function (value) { return (value.pos) % 3 == (role.pos % 3); });
        roleArr = roleArr.concat(targetArr);
        roleArr = roleArr.filter(function (value) { return (!!value && !!value.parent); });
        roleArr.sort(function (a, b) { return b.zIndex - a.zIndex; });
        for (var i = 0; i < roleArr.length - 1; i++) {
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
    };
    p.tweenRemoveRole = function () {
        var _this = this;
        var off = 0;
        for (var i = 0; i < fight.ROLE_UP_LIMIT; i++) {
            if (this.leftRoles[i] && this.leftRoles[i].side == FightSideEnum.LEFT_SIDE) {
                off = fight.WIDTH * -1;
                break;
            }
            if (this.rightRoles[i] && this.rightRoles[i].side == FightSideEnum.RIGHT_SIDE) {
                if (off) {
                    off = 0;
                }
                else {
                    off = fight.WIDTH;
                }
                break;
            }
        }
        if (off) {
            var tween = egret.Tween.get(this.roleLayer);
            tween.to({ x: this.roleLayer.x + off }, fight.MIDDLE_GROUND_MOVE_TIME);
            tween.call(function () {
                _this.roleLayer.x = 0;
                _this.reset();
                _this.tweenRemoveRoleComplete();
            }, this);
        }
        else {
            this.reset();
            this.tweenRemoveRoleComplete();
        }
    };
    p.bornRoles = function (e) {
        var _this = this;
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.bornRole, this);
        }
        var arr = this.originalElements;
        var roleArr = fight.generateFightRoleVOArr(arr);
        for (var i = 0; i < roleArr.length; i++) {
            if (roleArr[i]) {
                egret.setTimeout(function (index) {
                    var eff = new MCEff("role_born");
                    _this.bornRole(roleArr[index]);
                    eff.x = fight.getRoleInitPoint(roleArr[index]).x;
                    eff.y = fight.getRoleInitPoint(roleArr[index]).y;
                    _this.damageEffLayer.addChild(eff);
                }, this, i * 200, i);
            }
        }
    };
    p.bornRole = function (roleData) {
        var role = new FightRole(this, roleData);
        var side = roleData.side - 1;
        var pos = roleData.pos;
        this.roles[side][pos] = role;
        this.roleLayer.addChild(role);
        var sideRoles = this.roles[side].concat();
        var zIndexArr = fight.ROLE_Z_INDEX_ARR;
        role["z__index"] = zIndexArr[pos];
        sideRoles.sort(function (a, b) { return a["z__index"] - b["z__index"]; });
        sideRoles = sideRoles.filter(function (value) { return !!value; });
        for (var i = 0; i < sideRoles.length; i++) {
            if (sideRoles[i].parent) {
                sideRoles[i].parent.removeChild(sideRoles[i]);
            }
            this.roleLayer.addChild(sideRoles[i]);
            sideRoles[i].idle();
        }
        this.initRoleCount++;
        if (this.initRoleCount >= this.originalElements.length) {
            this.leftAreaCont = new egret.DisplayObjectContainer();
            this.roleLayer.addChildAt(this.leftAreaCont, 0);
            this.rightAreaCont = new egret.DisplayObjectContainer();
            this.roleLayer.addChildAt(this.rightAreaCont, 0);
            egret.setTimeout(this.startStep, this, 200);
        }
    };
    // 目前只有pve有跟着场景移除角色
    p.tweenRemoveRoleComplete = function (e) {
        if (e === void 0) { e = null; }
        if (e) {
            e.target.removeEventListener(egret.Event.COMPLETE, this.tweenRemoveRole, this);
        }
        var arr = this.originalElements;
        var roleArr = fight.generateFightRoleVOArr(arr);
        if (this.firstEnter) {
            if (this.level % 10 == 0 && this.type == FightTypeEnum.PVE) {
                var eff = new BossIncomingEff();
                eff.addEventListener(egret.Event.COMPLETE, this.stageEffComplete, this);
                this.damageEffLayer.addChild(eff);
            }
            else {
                var eff = void 0;
                if (this.type == FightTypeEnum.PVE) {
                    var stageName = Config.StageCommonData[Math.ceil(this.level / fight.MAP_SWITCH_SIZE)].title;
                    eff = new NewChapterEff(stageName);
                }
                else {
                    eff = new BattleStartEff();
                }
                eff.addEventListener(egret.Event.COMPLETE, this.stageEffComplete, this);
                this.damageEffLayer.addChild(eff);
            }
            return;
        }
        if (this.autoFight) {
            this.addRoles(roleArr, true);
        }
        else {
            if (this.level % 10 == 0 && this.type == FightTypeEnum.PVE) {
                var eff = new BossIncomingEff();
                eff.addEventListener(egret.Event.COMPLETE, this.stageEffComplete, this);
                this.damageEffLayer.addChild(eff);
            }
            else if (Config.StageData[this.level - 1] && Config.StageData[this.level].map != Config.StageData[this.level - 1].map && this.type == FightTypeEnum.PVE) {
                var eff = new NewChapterEff(Config.StageData[this.level].title);
                eff.addEventListener(egret.Event.COMPLETE, this.stageEffComplete, this);
                this.damageEffLayer.addChild(eff);
            }
            else {
                this.addRoles(roleArr, true);
            }
        }
    };
    // 场景特效(例如开启新地图,boss关)
    p.stageEffComplete = function (e) {
        if (e === void 0) { e = null; }
        if (e)
            e.target.removeEventListener(egret.Event.COMPLETE, this.stageEffComplete, this);
        this.autoFight = true;
        var arr = this.originalElements;
        var roleArr = fight.generateFightRoleVOArr(arr);
        this.addRoles(roleArr, true);
    };
    p.getCurTotalLife = function (side) {
        var curLife = "0";
        var roleArr = this.roles[side - 1];
        var len = roleArr ? roleArr.length : 0;
        for (var i = 0; i < len; i++) {
            var role = roleArr[i];
            if (role) {
                curLife = BigNum.add(curLife, role.curHP);
            }
        }
        return curLife;
    };
    p.getTotalLife = function (side) {
        var totalLife = "0";
        var roleArr = this.roles[side - 1];
        var len = roleArr ? roleArr.length : 0;
        for (var i = 0; i < len; i++) {
            var role = roleArr[i];
            if (role) {
                totalLife = BigNum.add(totalLife, role.maxHP);
            }
        }
        return totalLife;
    };
    /**
     * 开始抖动
     * @param 抖动幅度
     */
    p.startShake = function (range) {
        if (range > 0) {
            if (!this.shakeScreenEff) {
                this.shakeScreenEff = new ShakeScreenEff(this);
            }
            this.shakeScreenEff.startShake(range);
        }
    };
    /**
     * 显示灰尘效果
     * @param value
     */
    p.showMoveDustEff = function (value) {
        var eff = new MoveDustEff();
        eff.x = value.x;
        eff.y = value.y;
        this.showEff(this.dustLayer, eff, value);
    };
    /**
     * 释放技能前的效果
     * @param parent
     * @param eff
     * @param needMode
     */
    p.showFreeSkillEff = function (parent, eff, needMode) {
        var _this = this;
        this.grayLayer.graphics.clear();
        if (needMode && this.stage) {
            this.grayLayer.graphics.beginFill(0x0, 0.4);
            this.grayLayer.graphics.drawRect(-30, -30, this.stage.width + 60, this.stage.height + 60);
            egret.setTimeout(function () {
                _this.grayLayer.graphics.clear();
            }, this, 1000);
        }
        parent.addChild(eff);
    };
    /**
     * area攻击效果
     * @param eff
     * @param value
     */
    p.showAreaEff = function (eff, value) {
        var scaleX = (value.side == FightSideEnum.LEFT_SIDE ? -1 : 1);
        eff.scaleX = scaleX;
        if (value.side == FightSideEnum.LEFT_SIDE) {
            this.leftAreaCont.addChild(eff);
        }
        else {
            this.rightAreaCont.addChild(eff);
        }
    };
    /**
     * 显示伤害效果
     * @param eff
     * @param value
     */
    p.showDamageEff = function (eff, value) {
        this.showEff(this.damageEffLayer, eff, value);
    };
    /**
     * 显示效果
     * @param parent
     * @param eff
     * @param value
     */
    p.showEff = function (parent, eff, value) {
        if (parent && eff) {
            if (value) {
                if (typeof value == "number") {
                    eff.scaleX = value;
                }
                else {
                    eff.scaleX = value.side == FightSideEnum.RIGHT_SIDE ? -1 : 1;
                }
            }
            parent.addChild(eff);
        }
    };
    /**
     * 显示飘字效果
     * @param content
     * @param type
     */
    p.flyTxt = function (content, fntname) {
        var fontEff = new FontEff(fntname);
        fontEff.x = content.x || 0;
        fontEff.y = content.y || 0;
        fontEff.show(content);
        this.showEff(this.fontEffLayer, fontEff);
    };
    /** 显示技能名字效果 */
    p.showSkillFlyTxt = function (content) {
        if (this.type != FightTypeEnum.PVE) {
            var skillEff = new SkillNameEff(content);
            skillEff.x = 72;
            skillEff.y = 50;
            this.addChild(skillEff);
        }
    };
    /**
     * 显示升级效果
     * @param value
     */
    p.showUPLevelEff = function (value) {
        if (value) {
            for (var i = 0; i < fight.ROLE_UP_LIMIT; i++) {
                if (this.leftRoles[i]) {
                    this.leftRoles[i].showUPLevelEff(value);
                }
            }
        }
    };
    p.reset = function () {
        var len = this.dropProps ? this.dropProps.length : 0;
        for (var i = 0; i < len; i++) {
            if (this.dropProps[i].parent) {
                this.dropProps[i].stop();
                this.dropProps[i].parent.removeChild(this.dropProps[i]);
            }
        }
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
    p.onRoleHPChange = function () {
        var curTotalLife = this.getCurTotalLife(FightSideEnum.LEFT_SIDE);
        var ratio = +BigNum.div(curTotalLife, this.leftTotalLife);
        var w = fight.WIDTH;
        var h = fight.HEIGHT;
        if (this.type != FightTypeEnum.PVE) {
            h = 860;
        }
        if (this.oldLifeRatio > 0) {
            if (ratio <= 0.3 && ratio < this.oldLifeRatio) {
                if (!this.warnEff) {
                    this.warnEff = new FightWarnEff(this);
                }
                this.warnEff.show(w, h);
                this.oldLifeRatio = ratio;
            }
        }
        else {
            this.oldLifeRatio = ratio;
        }
    };
    p.onUseProp = function (e) {
        if (this.type == FightTypeEnum.PVE) {
            var id = e.data;
            if (id == 1) {
                // 五指山
                if (!this.palmEff) {
                    this.palmEff = new BuddhaPalmEff();
                    this.palmEff.x = fight.AREA_POS[FightSideEnum.LEFT_SIDE - 1].x;
                    this.palmEff.y = fight.AREA_POS[FightSideEnum.LEFT_SIDE - 1].y;
                    this.palmEff.addEventListener(egret.Event.COMPLETE, this.onPalmEffComplete, this);
                    this.addChild(this.palmEff);
                }
            }
            if (id == 2) {
                // 攻击翻倍
                this.dataGenerator.doubleSideAtk(FightSideEnum.LEFT_SIDE);
                var sideRoles = this.roles[FightSideEnum.LEFT_SIDE - 1].filter(function (value) { return !!value; });
                for (var i = 0; i < sideRoles.length; i++) {
                    sideRoles[i].doubleAtk();
                }
            }
            if (id == 3) {
                // 回复生命
                this.dataGenerator.recoverySideBlood(FightSideEnum.LEFT_SIDE);
                var sideRoles = this.roles[FightSideEnum.LEFT_SIDE - 1].filter(function (value) { return !!value; });
                for (var i = 0; i < sideRoles.length; i++) {
                    sideRoles[i].recoveryBlood();
                }
            }
            this.props.push(id);
        }
    };
    p.onPalmEffComplete = function (e) {
        this.palmEff.removeEventListener(egret.Event.COMPLETE, this.onPalmEffComplete, this);
        this.palmEff = null;
        this.dataGenerator.doPalmHurt(FightSideEnum.RIGHT_SIDE);
        var roleArr = this.roles[FightSideEnum.RIGHT_SIDE - 1];
        this.addEventListener(egret.Event.ENTER_FRAME, this.onCheckAllIdle, this);
        for (var i = 0; i < roleArr.length; i++) {
            if (roleArr[i]) {
                roleArr[i].hit();
            }
        }
    };
    p.onCheckAllIdle = function () {
        this.removeEventListener(egret.Event.ENTER_FRAME, this.onCheckAllIdle, this);
        this.onOneStepComplete();
    };
    p.forceToStage = function () {
        if (this.state != FightStateEnum.End) {
            this.forceEnd = true;
        }
    };
    p.onReadyComplete = function (e) {
        this.leftTotalLife = e.data[0] || "1";
        this.rightTotalLife = e.data[1] || "1";
    };
    p.dispose = function () {
        this.reset();
        this.removeEventListener("role_one_step_complete", this.onOneStepComplete, this, true);
        this.removeEventListener("role_die", this.onRoleDie, this, true);
        this.removeEventListener("role_hp_change", this.onRoleHPChange, this, true);
        this.removeEventListener("fight_ready_complete", this.onReadyComplete, this, true);
        EventManager.inst.addEventListener("use_prop_eff", this.onUseProp, this);
        EventManager.inst.addEventListener(ContextEvent.ROLE_DATA_UPDATE, this.onHeroDataUpdate, this);
    };
    return FightContainer;
}(egret.DisplayObjectContainer));
egret.registerClass(FightContainer,'FightContainer');
//# sourceMappingURL=FightContainer.js.map