var CmdID = (function (_super) {
    __extends(CmdID, _super);
    function CmdID() {
        _super.apply(this, arguments);
    }
    var d = __define,c=CmdID,p=c.prototype;
    CmdID.initCmd = function () {
        CmdID.addCmd(CmdID.ENTER, NetEnterCmd);
        CmdID.addCmd(CmdID.FIGHT_PVP_BEGIN, NetPVPReqFightDataCmd, false, false);
        CmdID.addCmd(CmdID.FIGHT_SYNC, NetFightSyncCmd, false, false);
        CmdID.addCmd(CmdID.FIGHT_FORMATION, NetFormationCmd, false, false);
        CmdID.addCmd(CmdID.FIGHT_DATA_TEST, TestCmd, false, false);
    };
    CmdID.addCmd = function (cmd, cls, isWait, isPost) {
        if (isWait === void 0) { isWait = false; }
        if (isPost === void 0) { isPost = false; }
        CmdID.cmdMap[cmd] = cls;
        if (isWait) {
            CmdID.waitCmdList.push(cmd);
        }
        if (isPost) {
            CmdID.postCmdList.push(cmd);
        }
    };
    //创建一个协议对应的处理命令
    CmdID.createCmd = function (cmd, data) {
        if (CmdID.cmdMap[cmd]) {
            var inst = new CmdID.cmdMap[cmd](data);
            inst.execute();
        }
        else {
            console.warn("[" + cmd + "] Class Not Defined....");
        }
    };
    //登录
    CmdID.ENTER = "enter";
    //心跳
    CmdID.ALIVE = "keepLive";
    //英雄升级
    CmdID.HERO_UP = "heroUp";
    //刷新物品商店
    CmdID.WEAPON_SHOP_RESET = "weaponShopReset";
    //购买法宝
    CmdID.WEAPON_SHOP_BUY = "weaponShopBuy";
    //出售法宝
    CmdID.WEAPON_SHOP_SELL = "weaponShopSell";
    //升级法宝
    CmdID.WEAPON_UP = "weaponUp";
    //购买法宝格子
    CmdID.WEAPON_POS_BUY = "weaponPosBuy";
    //小妖升级
    CmdID.MONSTER_UP = "monsterUp";
    //小妖挑战
    CmdID.MONSTER_CHALLENGE = "monsterChallenge";
    //小妖扫荡
    CmdID.MONSTER_SWEEP = "monsterSweep";
    //小妖重置
    CmdID.MONSTER_RESET = "monsterReset";
    //小妖买体力
    CmdID.MONSTER_BUY_VIT = "monsterBuyVit";
    //反馈
    CmdID.ADVICE = "advice";
    //签到
    CmdID.SIGN_IN = "signin";
    //接受拒绝好友
    CmdID.ANSWER_FRIEND = "answerFriend";
    //打开好友
    CmdID.OPEN_FRIEND = "openFriend";
    //好友一键接送体力
    CmdID.ONE_KEY = "oneKey";
    //好友单领体力
    CmdID.GET_ONE = "getOne";
    //寻仙
    CmdID.DRAW_HERO = "drawHero";
    //领取邮件
    CmdID.MAIL_ENCLOSE = "mailEnclose";
    //删除邮件
    CmdID.DELETE_MAIL = "deleteMail";
    //巡山获得钱
    CmdID.MONEY = "money";
    //巡山升级
    CmdID.MONEY_UP = "moneyUp";
    //巡山自动开启
    CmdID.AUTO_MONEY = "autoMoney";
    //打开秘境
    CmdID.DUNGEON_OPEN = "dungeonOpen";
    //秘境挑战
    CmdID.DUNGEON_FIGHT = "dungeonFight";
    //打开小妖
    CmdID.MONSTER_OPEN = "monsterOpen";
    //打开竞技场
    CmdID.OPEN_PVP = "openPVP";
    //更换对手
    CmdID.CHANGE_OP = "changeOp";
    //成就
    CmdID.ACHIEVEMENT = "achievement";
    //每日任务
    CmdID.TASK = "task";
    //排行
    CmdID.RANK = "rank";
    //pvp排行
    CmdID.LAST_PVP_RANK = "lastPVPrank";
    //pvp排行实时
    CmdID.PVP_RANK = "PVPrank";
    //目标任务
    CmdID.MISSION = "mission";
    //日常活动
    CmdID.DAILY = "daily";
    //限时活动
    CmdID.ACTIVITY = "activity";
    //分享奖励
    CmdID.SHARE_PRICE = "sharePrice";
    //摇钱树的钱
    CmdID.TREE_MONEY = "treeMoney";
    //历届冠军
    CmdID.PVP_TOPS = "PVPtops";
    //打开、刷新pvp商店
    CmdID.PVP_SHOP_RESET = "pvpShopReset";
    //购买pvp商店
    CmdID.PVP_SHOP_BUY = "pvpShopBuy";
    //英雄强化升级
    CmdID.ENHANCE_UP = "enhanceUp";
    //强化重置
    CmdID.ENHANCE_RESET = "enhanceReset";
    //升星
    CmdID.STAR_UP = "starUp";
    //商城
    CmdID.SHOP = "shop";
    //七日礼包
    CmdID.SEVEN_DAY_GIFT = "sevenDayGift";
    //获取分享奖励
    CmdID.GET_SHARE_PRIZE = "getSharePrize";
    //邀请
    CmdID.INVITE = "invite";
    //新手引导
    CmdID.SET_GUIDE = "setGuide";
    //是否有新邮件
    CmdID.HAS_NEW_MAIL = "hasNewMail";
    // 战斗同步
    CmdID.FIGHT_SYNC = "battleSync";
    // 布阵
    CmdID.FIGHT_FORMATION = "changeHero";
    // pvp开战
    CmdID.FIGHT_PVP_BEGIN = "beginPVP";
    // test
    CmdID.FIGHT_DATA_TEST = "test";
    //
    CmdID.PROP_USE = "use_item";
    //要做协议与类的映射
    CmdID.cmdMap = {};
    CmdID.waitCmdList = [];
    CmdID.postCmdList = [];
    return CmdID;
}(egret.HashObject));
egret.registerClass(CmdID,'CmdID');
//# sourceMappingURL=CmdID.js.map