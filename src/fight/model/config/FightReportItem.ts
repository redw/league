/**
 * Created by honghong on 2016/12/1.
 */
class FightReportItem{
    /** 技能id */
    skillId:number;
    /** 被攻击者 */
    target:FightReportTargetItem[];
    /** 是否暴击 */
    cri:boolean;
    /** 眩晕 */
    vertigo:boolean;
    /** 输出伤害反弹 */
    backOutHurtRatio:number;
    /** 伤害反弹 */
    outHurtRatio:number;
    /** 第几轮 */
    round:number;
    /** 第几步 */
    index:number;

    dcri:number;
    dcirDom:number;
    ddodge:number;
    dblock:number;

    /** 角色id */
    id:number;
    /** 位置 side_pos */
    pos:string;
    /** 血量 */
    hp:string;
    /** 最大血量 */
    maxhp:string;
    /** 伤害 */
    damage:string;
    /** 物攻 */
    phyAtk:string;
    /** 物防 */
    phyDef:string;
    /** 魔攻 */
    magAtk:string;
    /** 魔防 */
    magDef:string;
    /** buffs */
    buff:number[];
}

class FightReportTargetItem {
    /** 是否格档 */
    block:boolean;
    /** 是否闪避 */
    dodge:boolean;
    /** 添加的血量 */
    addHP:string;
    /** 伤害系数 */
    hurtRatio:number;
    /** 伤害反弹系数 */
    backHurtRatio:number;
    /** 无敌 */
    invincible:boolean;
    /** 物免 */
    isFreePhysicalAtk:boolean;
    /** 魔免 */
    isFreeMagicAtk:boolean;

    dcri:number;
    dcirDom:number;
    ddodge:number;
    dblock:number;

    /** 角色id */
    id:number;
    /** 位置 side_pos */
    pos:string;
    /** 血量 */
    hp:string;
    /** 最大血量 */
    maxhp:string;
    /** 伤害 */
    damage:string;
    /** 物攻 */
    phyAtk:string;
    /** 物防 */
    phyDef:string;
    /** 魔攻 */
    magAtk:string;
    /** 魔防 */
    magDef:string;
    /** buffs */
    buff:number[];
}