/**
 * 战斗里的一些工具方法
 * Created by hh on 2016/11/30.
 */
module fight{
    let curSoundPath:string = "";

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
        if (value) {
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
                if (!value.effect_damage_frame) {
                    recordLog(`技能${value.id}的${value.action_type}攻击伤害帧配置错误`,fight.LOG_FIGHT_WARN);
                }
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
     * 是否是加血技能
     */
    export function isAddHPSkill(value:SkillConfig){
        return value && value.damage < 0;
    }

    /**
     * 得到近战攻击玩家时的攻击位置
     * @param role
     * @param targets
     * @param skill
     * @returns {Point}
     */
    export function getNearFightPoint(role:FightRole, targets:{side:number, pos:number}[], skill:SkillConfig){
        let point = new egret.Point();
        let offPoint = (skill && skill.move_position) || [0, 0];
        if (skill.action_type == fight.ATTACK_ACTION_ROW) {
            point = getRoleInitPoint({side:3-role.side, pos:targets[0].pos % 3});
        } else {
            let curRole = targets[0];
            let minValue = Math.abs(role.pos - curRole.pos);
            for (let i = 1; i < targets.length; i++) {
                let curValue = Math.abs(role.pos - targets[i].pos);
                if (curValue < minValue) {
                    curRole = targets[i];
                }
            }
            point = getRoleInitPoint(curRole);
        }
        if (role.side == FightSideEnum.RIGHT_SIDE) {
            point.x += (MOVE_ATTACK_OFF + (+offPoint[0]));
        } else {
            point.x -= (MOVE_ATTACK_OFF + (+offPoint[0]));
        }
        point.y += (+offPoint[1]);
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
        // if (Global.DEBUG) {
        //     if (level >= LOG_FIGHT_ERROR) {
        //         console.error(content);
        //     } else if (level >= LOG_FIGHT_WARN) {
        //         console.warn(content);
        //     } else {
        //         console.log(content);
        //     }
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
            action == fight.ATTACK_ACTION_ROW ||
            action == fight.ATTACK_ACTION_JUMP_AREA;
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
                recordLog(`资源${id}帧${label}错误`, LOG_FIGHT_WARN);
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
        let bunch = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t"];
        let index = Math.floor(Math.random() * bunch.length);
        return fight.TEST_BUNCH || bunch[index];
    }

    /**
     * 显示伤害,飘字等效果
     * @param parent
     * @param content
     * @param fntname
     */
    export function showTxt(parent:egret.DisplayObjectContainer, content:any, fntname:string){
        let fontEff = new FontEff(fntname);
        parent.addChild(fontEff);
        fontEff.show(content);
    }

    export function playSound(url:string, isMusicEff:boolean=true){
        if (url){
            try {
                if (isMusicEff) {
                    // egret.setTimeout(()=>{
                    // SoundManager.inst.effectSwitch = !UserProxy.inst.soundOpen;
                        SoundManager.inst.playEffect(URLConfig.getSoundURL(url));
                    // }, this, 100);
                } else {
                    if (curSoundPath != url) {
                        SoundManager.inst.stopMusic();
                        // SoundManager.inst.musicSwitch = !UserProxy.inst.musicOpen;
                        egret.setTimeout(()=>{
                            SoundManager.inst.playMusic(URLConfig.getSoundURL(url));
                        }, this, 0);
                        curSoundPath = url;
                    }
                }
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
     * @returns {FightRoleVO[]}
     */
    export function generatePVPFightHeroVOArr(obj:any[], pos:number[], side:number) {
        let result:FightRoleVO[] = [];
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            let fightRoleVO = new FightRoleVO();
            let key = keys[i];
            if (!obj[key].id) {
                obj[key].id = +key;
            }
            fightRoleVO.parse(obj[key]);
            fightRoleVO.side = side;
            fightRoleVO.pos = 0;
            let heroVO = new HeroVO(obj[key]);
            fightRoleVO.copyProp(heroVO);
            for (let j = 0; !!pos && j < pos.length; j++) {
                if (fightRoleVO.id == pos[j]) {
                    fightRoleVO.pos = j;
                    break;
                }
            }
            result.push(fightRoleVO);
        }
        return result;
    }

    /**
     * 生成战斗角色数据数组
     * @returns {FightRoleVO[]}
     */
    export function generateFightRoleVOArr(value:{id:number, pos:number, side:number}[]) {
        let result:FightRoleVO[] = [];
        let keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let fightRoleVO = generateFightRoleVO(value[key]);
            result.push(fightRoleVO)
        }
        return result;
    }

    /**
     * 生成战斗角色数据
     * @returns {FightRoleVO}
     */
    export function generateFightRoleVO(value:{id:number, pos:number, side:number}){
        let result = new FightRoleVO(value);
        if (fight.isHero(value.id)) {
            let heroVO = new HeroVO(value);
            result.copyProp(heroVO);
        } else {
            let monsterVO = new MonsterVO(value);
            result.copyProp(monsterVO);
        }
        return result;
    }

    /**
     * 子弹缓冲方法
     * @param ratio tween的0到1的进度
     * @returns {number}
     */
    export function bulletEase(time:number){
        return function (ratio:number) {
            let duration = time;
            let x = ratio;
            let t = ratio * duration;
            let b = 0;
            let c = 1;
            let d = duration;
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        }
    }

    /**
     * 检查战斗是否结束
     * @param arr
     * @returns {boolean}
     */
    export function checkFightEnd(arr:{side:number}[]) {
        let len = arr.length;
        let isEnd = true;
        let side = 0;
        for (let i = 0; i < len; i++) {
            if (i == 0) {
                side = arr[0].side;
            } else {
                if (side != arr[i].side) {
                    isEnd = false;
                    break;
                }
            }
        }
        return isEnd;
    }

    export function generateMonsterInfo(monsterArr:{id:number, pos:number, side:number}[]){
        let result:{id:number, pos:number, side:number, level:number}[] = [];
        for (let i = 0; i < monsterArr.length; i++) {
            let obj:any = {};
            obj.id = monsterArr[i].id;
            obj.pos = monsterArr[i].pos;
            obj.side = monsterArr[i].side;
            obj.level = this.level;
            result.push(obj);
        }
        return result;
    }

    export function generateHeroInfo(heroArr:{id:number, pos:number, side:number}[]) {
        let result:{id:number,pos:number,side:number, level:number, starLevel:number, strengthenLevel:number, starPiece:number}[] = [];
        for (let i = 0; i < heroArr.length; i++) {
            let obj:any = {};
            obj.id = heroArr[i].id;
            obj.pos = heroArr[i].pos;
            obj.side = heroArr[i].side;
            let heroVO = UserProxy.inst.heroData.getHeroData(obj.id);
            obj.level = heroVO ? heroVO.level : 0;
            obj.starLevel = heroVO ? heroVO.starLevel : 1;
            obj.strengthenLevel = heroVO ? heroVO.strengthenLevel : 0;
            obj.starPiece = heroVO ? heroVO.starPiece : 0;
            result.push(obj);
        }
        return result;
    }
}