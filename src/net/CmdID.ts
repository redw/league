class CmdID extends egret.HashObject {
    //登录
    public static ENTER: string = "enter";
    //心跳
    public static ALIVE: string = "keepLive";
    //英雄升级
    public static HERO_UP:string = "heroUp";
    //刷新物品商店
    public static WEAPON_SHOP_RESET:string = "weaponShopReset";
    //购买法宝
    public static WEAPON_SHOP_BUY:string = "weaponShopBuy";
    //出售法宝
    public static WEAPON_SHOP_SELL:string = "weaponShopSell";
    //升级法宝
    public static WEAPON_UP:string = "weaponUp";
    //购买法宝格子
    public static WEAPON_POS_BUY:string = "weaponPosBuy";
    //小妖升级
    public static MONSTER_UP:string = "monsterUp";
    //小妖挑战
    public static MONSTER_CHALLENGE:string = "monsterChallenge";
    //小妖扫荡
    public static MONSTER_SWEEP:string = "monsterSweep";
    //小妖重置
    public static MONSTER_RESET:string = "monsterReset";
    //小妖买体力
    public static MONSTER_BUY_VIT:string = "monsterBuyVit";
    //反馈
    public static ADVICE:string = "advice";
    //签到
    public static SIGN_IN:string = "signin";
    //接受拒绝好友
    public static ANSWER_FRIEND:string = "answerFriend";
    //打开好友
    public static OPEN_FRIEND:string = "openFriend";
    //好友一键接送体力
    public static ONE_KEY:string = "oneKey";
    //好友单领体力
    public static GET_ONE:string = "getOne";
    //寻仙
    public static DRAW_HERO:string = "drawHero";
    //领取邮件
    public static MAIL_ENCLOSE:string = "mailEnclose";
    //删除邮件
    public static DELETE_MAIL:string = "deleteMail";
    //巡山获得钱
    public static MONEY:string = "money";
    //巡山升级
    public static MONEY_UP:string = "moneyUp";
    //巡山自动开启
    public static AUTO_MONEY:string = "autoMoney";
    //打开秘境
    public static DUNGEON_OPEN:string = "dungeonOpen";
    //秘境挑战
    public static DUNGEON_FIGHT:string = "dungeonFight";
    //打开小妖
    public static MONSTER_OPEN:string = "monsterOpen";
    //打开竞技场
    public static OPEN_PVP:string = "openPVP";
    //更换对手
    public static CHANGE_OP:string = "changeOp";
    //成就
    public static ACHIEVEMENT:string = "achievement";
    //每日任务
    public static TASK:string = "task";
    //排行
    public static RANK:string = "rank";
    //pvp排行
    public static LAST_PVP_RANK:string = "lastPVPrank";
    //pvp排行实时
    public static PVP_RANK:string = "PVPrank";
    //目标任务
    public static MISSION:string = "mission";
    //日常活动
    public static DAILY:string = "daily";
    //限时活动
    public static ACTIVITY:string = "activity";
    //分享奖励
    public static SHARE_PRICE:string = "sharePrice";
    //摇钱树的钱
    public static TREE_MONEY:string = "treeMoney";
    //历届冠军
    public static PVP_TOPS:string = "PVPtops";
    //打开、刷新pvp商店
    public static PVP_SHOP_RESET:string = "pvpShopReset";
    //购买pvp商店
    public static PVP_SHOP_BUY:string = "pvpShopBuy";
    //英雄强化升级
    public static ENHANCE_UP:string = "enhanceUp";
    //强化重置
    public static ENHANCE_RESET:string = "enhanceReset";
    //升星
    public static STAR_UP:string = "starUp";
    //商城
    public static SHOP:string = "shop";
    //七日礼包
    public static SEVEN_DAY_GIFT = "sevenDayGift";


    //获取分享奖励
    public static GET_SHARE_PRIZE: string = "getSharePrize";
    //邀请
    public static INVITE: string = "invite";
    //新手引导
    public static SET_GUIDE: string = "setGuide";
    //是否有新邮件
    public static HAS_NEW_MAIL: string = "hasNewMail";

    // 战斗同步
    public static FIGHT_SYNC:string = "battleSync";
    // 布阵
    public static FIGHT_FORMATION:string = "changeHero";
    // pvp开战
    public static FIGHT_PVP_BEGIN:string = "beginPVP";
    // test
    public static FIGHT_DATA_TEST:string = "test";
    //
    public static PROP_USE:string = "use_item";

    //要做协议与类的映射
    public static cmdMap: any = {};
    public static waitCmdList: string[] = [];
    public static postCmdList: string[] = [];

    public static initCmd(): void {
        CmdID.addCmd(CmdID.ENTER, NetEnterCmd);

        CmdID.addCmd(CmdID.FIGHT_PVP_BEGIN,NetPVPReqFightDataCmd,false,false);
        CmdID.addCmd(CmdID.FIGHT_SYNC, NetFightSyncCmd, false, false);
        CmdID.addCmd(CmdID.FIGHT_FORMATION, NetFormationCmd, false, false);
        CmdID.addCmd(CmdID.FIGHT_DATA_TEST, TestCmd, false, false)
    }

    public static addCmd(cmd: string, cls: any, isWait: Boolean = false, isPost: Boolean = false): void {
        CmdID.cmdMap[cmd] = cls;

        if (isWait) {
            CmdID.waitCmdList.push(cmd);
        }
        if (isPost) {
            CmdID.postCmdList.push(cmd);
        }
    }

    //创建一个协议对应的处理命令
    public static createCmd(cmd: string, data: any): void {
        if (CmdID.cmdMap[cmd]) {
            var inst: BaseCmd = new CmdID.cmdMap[cmd](data);
            inst.execute();
        }
        else {
            console.warn("[" + cmd + "] Class Not Defined....");
        }
    }
}