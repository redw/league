/**
 * 关卡配置
 * Created by hh on 16/11/26.
 */
interface StageConfig {
    monster_number: number[];
    monster:string[];
    id: number;
}

interface StageCommonConfig {
    map:string;
    bgm:string;
    title:string;
}

/**
 * 秘镜关卡配置
 * Created by hh on 2017/1/10.
 */
interface BossStageConfig {
    id:number;
    name:string;
    rank:number;
    level:number;
    reward_1:number[];
    head_icon:number;
    pvp_stage:number;
    enemy:number[];
    map:string;
    bgm:string;
}
