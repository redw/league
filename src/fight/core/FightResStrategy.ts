/**
 * 战斗资源加载策略
 * Created by hh on 2017/1/12.
 */
module fight{
    import hasRes = RES.hasRes;
    export const LOAD_PRIORITY_ROLE:number = 1000;
    export const LOAD_PRIORITY_SKILL:number = 500;
    export const LOAD_PRIORITY_EFFECT:number = 200;
    export const LOAD_PRIORITY_BUFF:number = 100;
    export const LOAD_PRIORITY_MAP_PROSPECT:number = 30;
    export const LOAD_PRIORITY_MAP_BACKGROUND:number = 40;
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

    /**
     * 加载pve资源
     * @param id    关卡id
     * @param roleArr   角色
     */
    export function loadPVEFightRes(id:number, roleArr:{id:number}[]) {
        // 加载角色
        let rolePathArr = [];
        for (let i = 0; i < roleArr.length; i++) {
            let roleData = roleArr[i];
            let roleConfig:RoleConfig = Config.HeroData[roleData.id] || Config.EnemyData[roleData.id];
            pushResToArr(roleConfig.resource, rolePathArr);
        }
        RES.createGroup(`pve_fight_role`, rolePathArr, true);
        RES.loadGroup(`pve_fight_role`, LOAD_PRIORITY_ROLE);

        // 加载技能
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
        RES.createGroup(`pve_fight_skill`, skillPathArr, true);
        RES.loadGroup(`pve_fight_skill`, LOAD_PRIORITY_SKILL);

        // 加载效果
        const effArr = [];
        pushResToArr("death_effect", effArr);
        pushResToArr("dust_effect", effArr);
        pushResToArr("skill_source", effArr);
        pushResToArr("lvl_up", effArr);
        RES.createGroup(`pve_effect_group`, effArr, true);
        RES.loadGroup(`pve_effect_group`, LOAD_PRIORITY_EFFECT);

        // 加载buff
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
        RES.loadGroup(`buff_effect_group`, LOAD_PRIORITY_BUFF);



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
        RES.loadGroup("pve_drop_group", fight.LOAD_PRIORITY_DROP + Number(id));
    }

    /**
     * 返回是否mc资源加载完成
     * @param value
     * @returns {boolean}
     */
    export function isMCResourceLoaded(value:string){
        return RES.hasRes(`${value}_png`) && RES.hasRes(`${value}_json`);
    }

    export function loadPVPFightRes(){

    }

    export function loadBossFightRes(){

    }

    export function loadMap(){

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

    function pushResToArr(value:any, arr:any[]) {
        if (value) {
            if (arr.indexOf(value + "_png") < 0) {
                arr.push(value + "_png", value + "_json");
            }
        }
    }
}
