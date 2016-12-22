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
        Config.DropData = RES.getRes("n2_pve_item_json");
        Config.StageData = RES.getRes("n2_pve_stage_json");
        // 同时出战的时间间隔
        fight.MEANWHILE_FIGHT_DELAY_TIME = +Config.FightConfig.meanwhile_fight_delay_time;
        // 能否同时出战
        fight.CAN_MEANWHILE_FIGHT = Boolean(Config.FightConfig.can_meanwhile_fight);
        // 回退的时间间隔
        fight.RETREAT_TIME = +Config.FightConfig.retreat_time;
        // 移动的时间
        fight.MOVE_TIME = +Config.FightConfig.move_time;
        // 移动攻击时,距离目标点的位置
        fight.MOVE_ATTACK_OFF = +Config.FightConfig.move_attack_position_off;
        // 子弹飞行时间
        fight.BULLET_RUN_TIME = +Config.FightConfig.bullet_run_time;
        // 子弹间间隔
        fight.BULLET_RUN_DELAY_TIME = +Config.FightConfig.bullet_run_delay_time;
        // 死亡延迟时间
        fight.DIE_DELAY_TIME = +Config.FightConfig.die_delay_time;
        // 生命条缓动时间
        fight.LIFE_BAR_TWEEN_TIME = +Config.FightConfig.life_bar_tween_time;
        if (Config.FightConfig.area_right_pos) {
            var arr = Config.FightConfig.area_right_pos.split(",");
            fight.AREA_POS[0].x = +arr[0];
            fight.AREA_POS[0].y = +arr[1];
        }
        if (Config.FightConfig.area_left_pos) {
            var arr = Config.FightConfig.area_left_pos.split(",");
            fight.AREA_POS[1].x = +arr[0];
            fight.AREA_POS[1].y = +arr[1];
        }
        var leftPos = Config.FightConfig.left_role_pos;
        for (var i = 0; i < leftPos.length; i++) {
            fight.POS_MAP[0][i].x = leftPos[i][0];
            fight.POS_MAP[0][i].y = leftPos[i][1];
        }
        var rightPos = Config.FightConfig.right_role_pos;
        for (var i = 0; i < rightPos.length; i++) {
            fight.POS_MAP[1][i].x = rightPos[i][0];
            fight.POS_MAP[1][i].y = rightPos[i][1];
        }
    };
    return Config;
}(egret.HashObject));
egret.registerClass(Config,'Config');
//# sourceMappingURL=Config.js.map