/**
 * 战斗资源加载策略
 * Created by hh on 2017/1/12.
 */
module fight{
    import hasRes = RES.hasRes;
    export const LOAD_PRIORITY_SKILL_NAME:number = 10000;

    export const LOAD_PRIORITY_AREA_BG:number = 50;
    export const LOAD_PRIORITY_STAR_SKY_BG:number = 40;
    export const LOAD_PRIORITY_EYES:number = 20;

    export const LOAD_PRIORITY_ROLE:number = 1000;
    export const LOAD_PRIORITY_SKILL:number = 500;
    export const LOAD_PRIORITY_EFFECT:number = 200;
    export const LOAD_PRIORITY_BUFF:number = 100;
    export const LOAD_PRIORITY_MAP_PROSPECT:number = 0;
    export const LOAD_PRIORITY_MAP_BACKGROUND:number = 0;
    export const LOAD_PRIORITY_MAP_MIDDLE:number = 50;
    export const LOAD_PRIORITY_DROP:number = 20;
    export const LOAD_PRIORITY_OTHER:number = 1;

    export const RES_PROP_WITH_1 = "126_attack_source";
    export const RES_PROP_WITH_3 = "buff_hp1";

    let isLoadingDrop = false;

    /**
     * 初始化加载策略
     * 首先加载关卡资源
     */
    export function loadInit(){
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, onFightResLoadComplete, null);
    }

    function onFightResLoadComplete(e:RES.ResourceEvent) {
        let groupName = e.groupName;
        let curLevel = UserProxy.inst.curArea;
    }

    export function firstEnterPVE(roleArr:{id:number}[]){
        // 加载角色
        let rolePathArr = [];
        for (let i = 0; i < roleArr.length; i++) {
            let roleData = roleArr[i];
            let roleConfig:RoleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, rolePathArr);
        }
        // 初始化时加载背景乐
        let bgm = Config.StageCommonData[Math.ceil(UserProxy.inst.curArea / fight.MAP_SWITCH_SIZE)].bgm;
        pushResToArr(`${bgm}_mp3`, rolePathArr);
        RES.createGroup(`pve_fight_role`, rolePathArr, true);
        RES.loadGroup(`pve_fight_role`, -1);

        loadSkillEff(roleArr, -1);
        loadBuffEff(roleArr, -1);

        // 加载掉落
        let dropArr = [];
        pushResToArr("item_appear_effect", dropArr);
        pushResToArr("item_disappear_effect", dropArr);
        let keys = Object.keys(Config.DropData);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            let dropConfig:FightDropConfig = Config.DropData[id];
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

    /**
     * 加载pve资源
     * @param roleArr   角色
     */
    export function loadPVEFightRes(roleArr:{id:number}[]) {
        // 加载角色
        let rolePathArr = [];
        for (let i = 0; i < roleArr.length; i++) {
            let roleData = roleArr[i];
            let roleConfig:RoleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, rolePathArr);
        }
        RES.createGroup(`pve_fight_role`, rolePathArr, true);
        RES.loadGroup(`pve_fight_role`, LOAD_PRIORITY_ROLE);

        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
    }

    export function loadPVPFightRes(roleArr:{id:number}[]){
        let resGroupRes = getFightNeedRes(roleArr);
        pushResToArr("role_born", resGroupRes);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
        RES.createGroup("pvpFight", resGroupRes, true);
        RES.loadGroup("pvpFight");
    }

    export function loadBossFightRes(roleArr:{id:number}[]){
        let resGroupRes = fight.getFightNeedRes(roleArr);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
        RES.createGroup("bossFight", resGroupRes, true);
        RES.loadGroup("bossFight");
    }

    /**
     * 获取战斗角色所需的资源
     * @param roleDataArr
     */
    export function getFightNeedRes(roleDataArr:{id:number}[]){
        let resPath:string[] = [];
        pushResToArr("death_effect", resPath);
        pushResToArr("dust_effect", resPath);
        pushResToArr("skill_source", resPath);
        pushResToArr("lvl_up", resPath);
        pushResToArr("hit_normal", resPath);
        for (let i = 0; i < roleDataArr.length; i++) {
            let roleData = roleDataArr[i];
            let roleConfig:RoleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, resPath);
            let skill:string[] = [].concat(roleConfig.skill, roleConfig.begin_skill);
            for (let j = 0; j < skill.length; j++) {
                if (!!skill[j]) {
                    let skillConfig = Config.SkillData[skill[j]];
                    pushResToArr(skillConfig.scource_effect, resPath);
                    pushResToArr(skillConfig.target_effect, resPath);
                }
            }
        }
        return resPath;
    }

    /** 加载英雄资源 */
    export function loadHeroRes(roleArr:{id:number}[], priority:number=LOAD_PRIORITY_ROLE){
        let resGroupRes = fight.getFightNeedRes(roleArr);
        loadSkillEff(roleArr);
        loadBuffEff(roleArr);
        RES.createGroup("heroRes_group", resGroupRes, true);
        RES.loadGroup(`heroRes_group`, priority);
    }

    function loadSkillEff(roleArr:{id:number}[], priority:number = LOAD_PRIORITY_SKILL){
        let skillPathArr = [];
        for (let i = 0; i < roleArr.length; i++) {
            let roleData = roleArr[i];
            let roleConfig:RoleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            let skill:number[] = roleConfig.skill.concat();
            for (let j = 0; j < skill.length; j++) {
                let skillConfig = Config.SkillData[skill[j]];
                if (skillConfig) {
                    pushResToArr(skillConfig.scource_effect, skillPathArr);
                    pushResToArr(skillConfig.target_effect, skillPathArr);
                }
            }
        }
        RES.createGroup(`fight_skill_effect_group`, skillPathArr, true);
        RES.loadGroup(`fight_skill_effect_group`, priority);
    }

    function loadBuffEff(roleArr:{id:number}[], priority:number = LOAD_PRIORITY_BUFF) {
        const buffArr = [];
        for (let i = 0; i < roleArr.length; i++) {
            let roleData = roleArr[i];
            let roleConfig:RoleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            let skill:number[] = roleConfig.skill.concat();
            for (let j = 0; j < skill.length; j++) {
                let skillConfig = Config.SkillData[skill[j]];
                if (skillConfig) {
                    let buffId = skillConfig.buff_id;
                    let buffConfig:BuffConfig = Config.BuffData[buffId];
                    if (buffConfig && buffConfig.resource) {
                        pushResToArr(buffConfig.resource, buffArr);
                    }
                }
            }
        }
        RES.createGroup(`buff_effect_group`, buffArr, true);
        RES.loadGroup(`buff_effect_group`, priority);
    }

    function loadCommonFightEff(){
        const effArr = [];
        pushResToArr("death_effect", effArr);
        pushResToArr("dust_effect", effArr);
        pushResToArr("hit_normal", effArr);
        pushResToArr("skill_source", effArr);
        pushResToArr("lvl_up", effArr);
        RES.createGroup(`fight_effect_group`, effArr, true);
        RES.loadGroup(`fight_effect_group`, LOAD_PRIORITY_EFFECT);
    }

    function pushResToArr(value:any, arr:any[]) {
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
    export function isMCResourceLoaded(value:string){
        return RES.hasRes(`${value}_png`) && RES.hasRes(`${value}_json`);
    }
}
