/**
 * Created by Administrator on 2016/12/16.
 */
class Config extends egret.HashObject {
    static HeroData:any;
    static EnemyData:any;
    static SkillData:any;
    static BuffData:any;
    static BaseData:any;
    static StageData:any;
    static FightConfig:any;
    static TriggerChanceData:any;

    static init() {
        Config.FightConfig = RES.getRes("fight_config_json");
        Config.HeroData = RES.getRes("n2_hero_json");
        Config.EnemyData =RES.getRes("n2_pve_enemy_json");
        Config.SkillData = RES.getRes("n2_hero_skill_json");
        Config.TriggerChanceData = RES.getRes("n2_trigger_chance_json");
        Config.BuffData = RES.getRes("n2_buff_json");
    }
}