/**
 * 战斗资源加载策略
 * Created by hh on 2017/1/12.
 */
var fight;
(function (fight) {
    fight.LOAD_PRIORITY_SKILL_NAME = 10000;
    fight.LOAD_PRIORITY_AREA_BG = 50;
    fight.LOAD_PRIORITY_STAR_SKY_BG = 40;
    fight.LOAD_PRIORITY_EYES = 20;
    fight.LOAD_PRIORITY_ROLE = 1000;
    fight.LOAD_PRIORITY_SKILL = 500;
    fight.LOAD_PRIORITY_EFFECT = 200;
    fight.LOAD_PRIORITY_BUFF = 100;
    fight.LOAD_PRIORITY_MAP_PROSPECT = 0;
    fight.LOAD_PRIORITY_MAP_BACKGROUND = 0;
    fight.LOAD_PRIORITY_MAP_MIDDLE = 50;
    fight.LOAD_PRIORITY_DROP = 20;
    fight.LOAD_PRIORITY_OTHER = 1;
    fight.RES_PROP_WITH_1 = "126_attack_source";
    fight.RES_PROP_WITH_3 = "buff_hp1";
    var isLoadingDrop = false;
    /**
     * 初始化加载策略
     * 首先加载关卡资源
     */
    function loadInit() {
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, onFightResLoadComplete, null);
    }
    fight.loadInit = loadInit;
    function onFightResLoadComplete(e) {
        var groupName = e.groupName;
        var curLevel = UserProxy.inst.curArea;
    }
    function firstEnterPVE(roleArr) {
        // 加载角色
        var rolePathArr = [];
        for (var i = 0; i < roleArr.length; i++) {
            var roleData = roleArr[i];
            var roleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, rolePathArr);
        }
        // 初始化时加载背景乐
        var bgm = Config.StageCommonData[Math.ceil(UserProxy.inst.curArea / fight.MAP_SWITCH_SIZE)].bgm;
        pushResToArr(bgm + "_mp3", rolePathArr);
        RES.createGroup("pve_fight_role", rolePathArr, true);
        RES.loadGroup("pve_fight_role", -1);
        loadSkillEff(roleArr, -1);
        loadBuffEff(roleArr, -1);
        // 加载掉落
        var dropArr = [];
        pushResToArr("item_appear_effect", dropArr);
        pushResToArr("item_disappear_effect", dropArr);
        var keys = Object.keys(Config.DropData);
        for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            var dropConfig = Config.DropData[id];
            pushResToArr(dropConfig.resource, dropArr);
            if (("RES_PROP_WITH_" + id) in fight) {
                pushResToArr(fight["RES_PROP_WITH_" + id], dropArr);
            }
        }
        RES.createGroup("pve_drop_group", dropArr, true);
        RES.loadGroup("pve_drop_group", fight.LOAD_PRIORITY_DROP);
        // 加载效果
        loadCommonFightEff();
    }
    fight.firstEnterPVE = firstEnterPVE;
    /**
     * 加载pve资源
     * @param roleArr   角色
     */
    function loadPVEFightRes(roleArr) {
        // 加载角色
        var rolePathArr = [];
        for (var i = 0; i < roleArr.length; i++) {
            var roleData = roleArr[i];
            var roleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, rolePathArr);
        }
        RES.createGroup("pve_fight_role", rolePathArr, true);
        RES.loadGroup("pve_fight_role", fight.LOAD_PRIORITY_ROLE);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
    }
    fight.loadPVEFightRes = loadPVEFightRes;
    function loadPVPFightRes(roleArr) {
        var resGroupRes = getFightNeedRes(roleArr);
        pushResToArr("role_born", resGroupRes);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
        RES.createGroup("pvpFight", resGroupRes, true);
        RES.loadGroup("pvpFight");
    }
    fight.loadPVPFightRes = loadPVPFightRes;
    function loadBossFightRes(roleArr) {
        var resGroupRes = fight.getFightNeedRes(roleArr);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
        RES.createGroup("bossFight", resGroupRes, true);
        RES.loadGroup("bossFight");
    }
    fight.loadBossFightRes = loadBossFightRes;
    /**
     * 获取战斗角色所需的资源
     * @param roleDataArr
     */
    function getFightNeedRes(roleDataArr) {
        var resPath = [];
        pushResToArr("death_effect", resPath);
        pushResToArr("dust_effect", resPath);
        pushResToArr("skill_source", resPath);
        pushResToArr("lvl_up", resPath);
        pushResToArr("hit_normal", resPath);
        for (var i = 0; i < roleDataArr.length; i++) {
            var roleData = roleDataArr[i];
            var roleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, resPath);
            var skill = [].concat(roleConfig.skill, roleConfig.begin_skill);
            for (var j = 0; j < skill.length; j++) {
                if (!!skill[j]) {
                    var skillConfig = Config.SkillData[skill[j]];
                    pushResToArr(skillConfig.scource_effect, resPath);
                    pushResToArr(skillConfig.target_effect, resPath);
                }
            }
        }
        return resPath;
    }
    fight.getFightNeedRes = getFightNeedRes;
    /** 加载英雄资源 */
    function loadHeroRes(roleArr, priority) {
        if (priority === void 0) { priority = fight.LOAD_PRIORITY_ROLE; }
        var resGroupRes = fight.getFightNeedRes(roleArr);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
        RES.createGroup("heroRes_group", resGroupRes, true);
        RES.loadGroup("heroRes_group", priority);
    }
    fight.loadHeroRes = loadHeroRes;
    function loadSkillEff(roleArr, priority) {
        if (priority === void 0) { priority = fight.LOAD_PRIORITY_SKILL; }
        var skillPathArr = [];
        for (var i = 0; i < roleArr.length; i++) {
            var roleData = roleArr[i];
            var roleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            var skill = roleConfig.skill.concat();
            for (var j = 0; j < skill.length; j++) {
                var skillConfig = Config.SkillData[skill[j]];
                if (skillConfig) {
                    pushResToArr(skillConfig.scource_effect, skillPathArr);
                    pushResToArr(skillConfig.target_effect, skillPathArr);
                }
            }
        }
        RES.createGroup("fight_skill_effect_group", skillPathArr, true);
        RES.loadGroup("fight_skill_effect_group", priority);
    }
    function loadBuffEff(roleArr, priority) {
        if (priority === void 0) { priority = fight.LOAD_PRIORITY_BUFF; }
        var buffArr = [];
        for (var i = 0; i < roleArr.length; i++) {
            var roleData = roleArr[i];
            var roleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            var skill = roleConfig.skill.concat();
            for (var j = 0; j < skill.length; j++) {
                var skillConfig = Config.SkillData[skill[j]];
                if (skillConfig) {
                    var buffId = skillConfig.buff_id;
                    var buffConfig = Config.BuffData[buffId];
                    if (buffConfig && buffConfig.resource) {
                        pushResToArr(buffConfig.resource, buffArr);
                    }
                }
            }
        }
        RES.createGroup("buff_effect_group", buffArr, true);
        RES.loadGroup("buff_effect_group", priority);
    }
    function loadCommonFightEff() {
        var effArr = [];
        pushResToArr("death_effect", effArr);
        pushResToArr("dust_effect", effArr);
        pushResToArr("hit_normal", effArr);
        pushResToArr("skill_source", effArr);
        pushResToArr("lvl_up", effArr);
        RES.createGroup("fight_effect_group", effArr, true);
        RES.loadGroup("fight_effect_group", fight.LOAD_PRIORITY_EFFECT);
    }
    function pushResToArr(value, arr) {
        if (value) {
            if (arr.indexOf(value + "_png") < 0) {
                arr.push(value + "_png", value + "_json");
            }
        }
    }
    /**
     * 返回是否mc资源加载完成
     * @param value
     * @returns {boolean}
     */
    function isMCResourceLoaded(value) {
        return RES.hasRes(value + "_png") && RES.hasRes(value + "_json");
    }
    fight.isMCResourceLoaded = isMCResourceLoaded;
})(fight || (fight = {}));
//# sourceMappingURL=FightResStrategy.js.map