/**
 * Created by Administrator on 2016/11/30.
 */
module fight{
    /**
     * 得到角色的描述信息
     * @param role RoleData或FightRole
     * @returns {string}
     */
    export function getRolePosDes(role:any){
        let result = "";
        let arr = [];
        if (role.length >= 1) {
            arr = role.concat();
        } else {
            arr = [role];
        }
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            if (arr[i].roleData)
                result += (arr[i].roleData.side + "_" + arr[i].roleData.pos);
            else
                result += (arr[i].side + "_" + arr[i].pos);
            if (i < len - 1)
                result += ",";
        }
        return result;
    }

    /**
     * 选取目标通用规则
     * @param value 排或列
     * @returns {[number,number,number]}
     */
    export function getCommonOrders(value: number) {
        if (value == 1) {
            return [1, 0, 2];
        } else if (value == 2) {
            return [2, 1, 0];
        } else {
            return [0, 1, 2];
        }
    }

    /**
     * 验证主动技能
     * @param value
     */
    export function verifyActiveSkill(value:SkillConfig) {
        if (value.type == "passive") {
            recordLog(`技能${value.id}应该是主动配置`,fight.LOG_FIGHT_WARN);
        }
        if (!value.trigger_chance || value.trigger_chance > 1) {
            recordLog(`技能${value.id}的串配置错误`,fight.LOG_FIGHT_WARN);
        }
        if (!value.repeat || value.repeat > 5) {
            recordLog(`技能${value.id}的repeat配置错误`,fight.LOG_FIGHT_WARN);
        }
        if (!value.damage_frame) {
            recordLog(`技能${value.id}没有配伤害帧`,fight.LOG_FIGHT_WARN);
        }
        if (value.action_type == fight.ATTACK_ACTION_JUMP && !value.jump_frame) {
            recordLog(`技能${value.id}的跳跃攻击没有配跳跃帧`,fight.LOG_FIGHT_WARN);
        }
        if (value.action_type == fight.ATTACK_ACTION_AREA || value.action_type == fight.ATTACK_ACTION_TURN) {
            if (!Number(value.effect_damage_frame)) {
                recordLog(`技能${value.id}的${value.action_type}攻击伤害帧配置错误`,fight.LOG_FIGHT_WARN);
            }
        }
    }

    /**
     * 是否是英雄
     * @param roleId
     * @returns {boolean}
     */
    export function isHero(roleId:number){
        return roleId < 200;
    }

    /**
     * 是否是加血技能
     */
    export function isAddHPSkill(value:SkillConfig){
        return value && value.damage < 0;
    }

    /**
     * 是否是boss
     * @param roleId
     * @returns {boolean}
     */
    export function isBoss(roleId:number) {
        let result = false;
        if (!isHero(roleId)) {
            result = Config.EnemyData[roleId].boss
        }
        return result;
    }

    /**
     * 得到近战攻击玩家时的攻击位置
     * @param role
     * @param targets
     * @returns {Point}
     */
    export function getNearFightPoint(role:FightRole, targets:FightRole[]){
        let curRole = targets[0];
        let minValue = Math.abs(role.pos - curRole.pos);
        for (let i = 1; i < targets.length; i++) {
            let curValue = Math.abs(role.pos - curRole.pos);
            if (curValue < minValue) {
                curRole = targets[i];
            }
        }
        let point = getRoleInitPoint(curRole);
        if (role.side == FightSideEnum.RIGHT_SIDE) {
            point.x += MOVE_ATTACK_OFF;
        } else {
            point.x -= MOVE_ATTACK_OFF;
        }
        return point;
    }

    /**
     * 得到角色出生位置
     * @param role  角色数据
     * @returns {Point}
     */
    export function  getRoleInitPoint(role:{side:number, pos:number}){
        let side = role.side - 1;
        let pos = role.pos;
        return POS_MAP[side][pos].clone();
    }

    /**
     * 记录日志
     * @param content
     * @param level
     */
    export function recordLog(content:any, level:number=0){
        if (level >= LOG_FIGHT_ERROR) {
            egret.error(content);
        } else if (level >= LOG_FIGHT_WARN) {
            egret.warn(content);
        } else {
            egret.log(content);
        }
    }

    /**
     * 需要移动攻击
     * @param action
     */
    export function needMoveAttack(action:string){
        return action == fight.ATTACK_ACTION_NORMAL ||
            action == fight.ATTACK_ACTION_ROW;
    }

    /**
     * 需要回退
     * @param action
     * @returns {boolean}
     */
    export function needRetreat(action:string){
        return action == fight.ATTACK_ACTION_NORMAL ||
            action == fight.ATTACK_ACTION_JUMP ||
            action == fight.ATTACK_ACTION_ROW;
    }

    /**
     * 播放mc的帧标签
     * @param label
     * @param mc
     * @param count
     * @param id
     * @returns {boolean}   成功播放,返回true,否则返回false
     */
    export function playFrameLabel(label:string, mc:egret.MovieClip, count:number=1, id:number|string=0) {
        let result = false;
        if (mc && mc["frameLabels"] && mc["frameLabels"].indexOf(label)) {
            result = true;
            try {
                mc.gotoAndPlay(label, count);
            } catch (e) {
                result = false;
                recordLog(`播放资源${id}帧${label}错误`, LOG_FIGHT_WARN);
            }
        } else {
            recordLog(`资源${id} 不存在帧标签${label}`, LOG_FIGHT_WARN);
        }
        return result;
    }

    /**
     * 随机技能触发串
     * @returns {string|string|string|string|string}
     */
    export function randomSkillTriggerBunch(){
        let bunch = ["a", "b", "c", "d", "e"];
        let index = Math.floor(Math.random() * bunch.length);
        return fight.TEST_BUNCH || bunch[index];
    }

    /**
     * 显示伤害,飘字等效果
     * @param parent
     * @param content
     * @param type
     */
    export function showTxt(parent:egret.DisplayObjectContainer, content:any, type:number=0){
        let fontEff;
        switch (type) {
            case FightFontEffEnum.PHYSICAL_ATK:
                fontEff = new FontPhysicalAtkEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;

            case FightFontEffEnum.MAGIC_ATK:
                fontEff = new FontMagicAtkEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;

            case FightFontEffEnum.ADD_HP:
                fontEff = new FontAddHPEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;

            case FightFontEffEnum.SYSTEM:
                fontEff = new FontSystemEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;

            case FightFontEffEnum.OTHER:
                fontEff = new FontOtherEff();
                parent.addChild(fontEff);
                fontEff.show(content);
                break;
        }
    }

    export function playSound(url:string, isMusicEff:boolean=true){
        if (url){
            try {
                // if (isMusicEff) {
                //     SoundManager.inst.playEffect(URLConfig.getSoundURL(url));
                // } else {
                //     SoundManager.inst.musicSwitch = true;
                //     SoundManager.inst.playMusic(URLConfig.getSoundURL(url));
                // }
            } catch (e) {
                recordLog(`播放{url}声音出错`, LOG_FIGHT_WARN);
            }

        }
    }

    /**
     * 生成战斗角色数据
     * @param obj   角色数据
     * @param pos   角色位置
     * @param side  角色所有边
     * @returns {FightRoleData[]}
     */
    export function generateFightHeroDataArr(obj:any[], pos:number[], side:number) {
        let result:FightRoleData[] = [];
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            let roleData = new FightRoleData();
            let key = keys[i];
            roleData.parse(obj[key], +key);
            roleData.side = side;
            roleData.pos = 0;
            for (let j = 0; !!pos && j < pos.length; j++) {
                if (roleData.id == pos[j]) {
                    roleData.pos = j;
                    break;
                }
            }
            result.push(roleData);
        }
        return result;
    }

    /**
     * 获取战斗角色所需的资源
     * @param roleDataArr
     */
    export function getFightNeedRes(roleDataArr:FightRoleData[]){
        let resPath:string[] = [];
        for (let i = 0; i < roleDataArr.length; i++) {
            let roleData = roleDataArr[i];
            let roleConfig:RoleConfig;
            if (isHero(roleData.id)) {
                roleConfig = Config.HeroData[roleData.id];
            } else {
                roleConfig = Config.EnemyData[roleData.id];
            }
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

    export function randomReq(){
        let arr = UserProxy.inst.fightData.getRandomBattleRoleArr();
        let tp = ArrayUtil.randomUniqueValue(["a", "b", "c", "d", "e"]);
        let mypos = ArrayUtil.createArr(9, 0);
        let oppos = ArrayUtil.createArr(9, 0);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].side == 1) {
                mypos[arr[i].pos] = arr[i].id;
            } else {
                oppos[arr[i].pos] = arr[i].id;
            }
        }
        fight.TEST_BUNCH = tp;
        fight.TEST_ROLE = arr.concat();
        Http.inst.send("test", {mypos:JSON.stringify(mypos), oppos:JSON.stringify(oppos), tp:tp});
    }

    function pushResToArr(value:any, arr:any[]) {
        if (!!value) {
            if (arr.indexOf(value + "_png") < 0) {
                arr.push(value + "_png", value + "_json");
            }
        }
    }
}