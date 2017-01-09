/**
 * 用户数据
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
class UserProxy extends egret.HashObject
{
    private static _instance: UserProxy = null;
    public curArea:number = 1;
    public battle_pos:number[] = [];
    public server_time:number = 0;

    static get inst(): UserProxy {
        if (UserProxy._instance == null) {
            UserProxy._instance = new UserProxy();
        }
        return UserProxy._instance;
    }


    public heroData:HeroModel = new HeroModel();
    public fightData:FightDataModel = new FightDataModel();
}