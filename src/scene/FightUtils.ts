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
     * 验证主动配置
     * @param value
     */
    export function verifyActiveSkill(value:SkillConfig) {
        if (value.type == "passive") {
            recordLog(`技能${value.id}主动与被动技能配置错误`,fight.LOG_FIGHT_WARN);
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
            if (!value.effect_damage_frame) {
                recordLog(`技能${value.id}的${value.action_type}攻击没有配效果伤害帧`,fight.LOG_FIGHT_WARN);
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
        return value && value.target_group == "friend"
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
        let minValue = Math.abs(role.roleData.pos - curRole.roleData.pos);
        for (let i = 1; i < targets.length; i++) {
            let curValue = Math.abs(role.roleData.pos - curRole.roleData.pos);
            if (curValue < minValue) {
                curRole = targets[i];
            }
        }
        let point = getRoleInitPoint(curRole.roleData);
        if (role.roleData.side == FightSideEnum.RIGHT_SIDE) {
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
        }
        // else {
        //     egret.log(content);
        // }
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
            recordLog(`资源${id} 不存在在帧标签`, LOG_FIGHT_WARN);
        }
        return result;
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

    export function playSound(url:string){
        if (url){
            try {
                // SoundManager.inst.playEffect(URLConfig.getSoundURL(url));
            } catch (e) {
                recordLog(`播放{url}声音出错`, LOG_FIGHT_WARN);
            }

        }
    }

    /**
     * 生成角色
     */
    export function createRole(){
        // var factory = new egret.MovieClipDataFactory()
        // let dataRes:any = RES.getRes(name + "_json");
        // let textureRes:any = RES.getRes(name + "_png");
        // factory.mcDataSet = dataRes;
        // factory.texture = textureRes;
        // return new egret.MovieClip(factory.generateMovieClipData(name));
    }
}