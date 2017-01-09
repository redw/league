/**
 * 进入游戏返回
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
class NetEnterCmd extends BaseCmd
{

    public execute() {
        Config.init();

        UserProxy.inst.heroData.parse(this.data["heroList"]);
        UserProxy.inst.fightData.parse(this.data["battleObj"]);
    }

    public init():void {

    }
}