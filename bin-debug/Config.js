/**
 * Created by Administrator on 2016/12/16.
 */
var Config = (function (_super) {
    __extends(Config, _super);
    function Config() {
        _super.apply(this, arguments);
    }
    var d = __define,c=Config,p=c.prototype;
    Config.init = function () {
        Config.FightConfig = RES.getRes("fight_config_json");
        Config.HeroData = RES.getRes("n2_hero_json");
        Config.EnemyData = RES.getRes("n2_pve_enemy_json");
        Config.SkillData = RES.getRes("n2_hero_skill_json");
        Config.TriggerChanceData = RES.getRes("n2_trigger_chance_json");
        Config.BuffData = RES.getRes("n2_buff_json");
    };
    return Config;
}(egret.HashObject));
egret.registerClass(Config,'Config');
