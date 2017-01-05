/**
 * 英雄角色值对象
 * Created by hh on 2017/1/4.
 */
class HeroVO{
    private _id:number;             // 角色id
    public starPiece:number;        // 碎片
    public skill:number;            // 解锁技能
    public level:number;            // 等级
    public starLevel:number;        // 星级
    public strengthenLevel:number;  // 强化等级
    public config:RoleConfig;       // 角色配置

    public constructor(value?:any){
        this.parse(value);
    }

    public get id(){
        return this._id;
    }

    public set id(value:number) {
        this._id = value;
        this.config = Config.HeroData[value];
    }

    public get phyAtk(){
        let base = this.getBaseValue(this.config.physical_atk);
        return this.getValue(base, 1);
    }

    public get maxHP(){
        let base = this.getBaseValue(this.config.hp);
        return this.getValue(base, 2);
    }

    public get phyDef(){
        let base = this.getBaseValue(this.config.physical_def);
        return this.getValue(base, 3);
    }

    public get magAtk(){
        let base = this.getBaseValue(this.config.magical_atk);
        return this.getValue(base, 4);
    }

    public get magDef(){
        let base = this.getBaseValue(this.config.magical_def);
        return this.getValue(base, 5);
    }


    private getBaseValue(value:number){
        return value;
        // let paraA:number = Config.BaseData[4]["value"];
        // let paraB:number = Config.BaseData[5]["value"];
        // let paraC:number = Config.BaseData[6]["value"];
        // let heroLv:number = this.level;
        // let heroEnhanceLv:number = this.strengthenLevel;
        // let lvAdd:number = Math.pow(paraA,heroLv-1);
        // let enhanceAdd:number = Math.pow(paraB,heroEnhanceLv);
        // let base:number = (value + paraC) * lvAdd * enhanceAdd;
        // return base;
    }

    private getValue(base:number,atkType:number):string
    {
        return base + "";
        // var total:string;
        // var targetArr = [];
        // targetArr.push(1);//自己
        // targetArr.push(2);//全体
        // if(parseInt(this.config.job) == 1 || parseInt(this.config.job) == 5) //近战
        // {
        //     targetArr.push(6);
        // }
        // else //远程
        // {
        //     targetArr.push(7);
        // }
        //
        // if(parseInt(this.config.race) == 3) //人
        // {
        //     targetArr.push(3);
        //     targetArr.push(8);
        //     targetArr.push(9);
        // }
        // else if (parseInt(this.config.race) == 4)
        // {
        //     targetArr.push(4);
        //     targetArr.push(8);
        //     targetArr.push(10);
        // }
        // else if(parseInt(this.config.race) == 5)
        // {
        //     targetArr.push(5);
        //     targetArr.push(9);
        //     targetArr.push(10);
        // }
        //
        // //天赋
        // var addBuff:number = 1;
        // if(this.level >= 10)
        // {
        //     var talent:any = Config.TalentData[this.id];
        //     for(var i in talent)
        //     {
        //         if(i != "id")
        //         {
        //             var key:string = i.replace("effect_","");
        //             var value:any = talent[i];
        //             var target:number = value[1];//加成目标
        //             var nature:number = value[0];//加成类型
        //             var add:number = value[2];//加成值
        //             if(this.level >= parseInt(key) && targetArr.indexOf(target) > -1)
        //             {
        //                 if(nature == 8 || nature == atkType)
        //                 {
        //                     addBuff *= (1+add);
        //                 }
        //             }
        //         }
        //     }
        // }
        //
        // total = BigNum.mul(base,addBuff);
        //
        // //法宝
        // var addWeapon:number = 1;
        // for(var c in UserProxy.inst.weaponList)
        // {
        //     var weaponInfo:any = UserProxy.inst.weaponList[c];
        //     var weaponData:any = Config.WeaponData[c];
        //     var value1:any = weaponData["attr_1"];
        //     var value2:any = weaponData["attr_2"];
        //     var add1:number = parseFloat(value1[2]) * (1 + 0.1 * weaponInfo["lv"]);
        //     var add2:number =  parseFloat(value2[2]) * (1 + 0.1 * weaponInfo["lv"]);
        //     var target1:number = value1[1];//加成目标
        //     var target2:number = value2[1];//加成目标
        //     var nature1:number = value1[0];//加成类型
        //     var nature2:number = value2[0];//加成类型
        //     if(targetArr.indexOf(target1) > -1)
        //     {
        //         if(nature1 == 8 || nature1 == atkType)
        //         {
        //             addWeapon *= (1 + add1);
        //         }
        //     }
        //
        //     if(targetArr.indexOf(target2) > -1)
        //     {
        //         if(nature2 == 8 || nature2 == atkType)
        //         {
        //             addWeapon *= (1 + add2);
        //         }
        //     }
        //
        //     if(weaponData["suit"])
        //     {
        //         var suitData:any = Config.WeaponSuit[weaponData["suit"]];
        //         var suitNum:number[] = suitData["suitnum"];
        //
        //         var count:number = 0;
        //         var length:number = suitData["itemgroup"].length;
        //         for(var p:number = 0;p < length ; p++)
        //         {
        //             var weaponId:number = suitData["itemgroup"][p];
        //             var weaponInfo:any = UserProxy.inst.weaponList[weaponId];
        //             if(weaponInfo && weaponInfo["lv"])
        //             {
        //                 count++;
        //             }
        //         }
        //
        //         for(var j:number= 1;j <= suitNum.length;j++)
        //         {
        //             if(count >= suitNum[j])
        //             {
        //                 var suitValue:number[] = suitData["attr_" + j];
        //                 var target: number = suitValue[1];//加成目标
        //                 var nature: number = suitValue[0];//加成类型
        //                 var add: number = suitValue[2];//加成值
        //
        //                 if(targetArr.indexOf(target) > -1)
        //                 {
        //                     if(nature == 8 || nature == atkType)
        //                     {
        //                         addWeapon *= (1 + add);
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        //
        // total = BigNum.mul(total,addWeapon);
        //
        // //情缘
        // var addShip:number = 1;
        // for(var k in this.config.friendly)
        // {
        //     var id:number = this.config.friendly[k];
        //     var shipData:any = Config.FriendshipData[id];
        //     var shipInfo:any = UserProxy.inst.relationship[id];
        //     var parm:number = shipData["attr_parm"];
        //     if(shipInfo["lv"])
        //     {
        //         var shipValue:any = shipData["attr_1"];
        //         var target:number = shipValue[1];//加成目标
        //         var nature:number = shipValue[0];//加成类型
        //         var add:number = parseFloat(shipValue[2])*(Math.pow(parm,shipInfo["lv"]-1));//加成值
        //         if(targetArr.indexOf(target) > -1)
        //         {
        //             if(nature == 8 || nature == atkType)
        //             {
        //                 addShip *= (1 + add);
        //             }
        //         }
        //     }
        // }
        // total = BigNum.mul(total,addShip);
        // return total;
    }

    public parse(obj:any) {
        this.id = obj.id;
        this.level = obj["lv"] || 0;
        this.starLevel = obj["star"] || 1;
        this.strengthenLevel = obj["enhanceLv"] || 0;
        this.starPiece = obj["starPiece"] || 0;
        this.skill = obj["skill"] || 0;
    }
}