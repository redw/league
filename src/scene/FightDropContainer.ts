/**
 * Created by hh on 2016/12/19.
 */
class FightDropContainer extends egret.DisplayObjectContainer{

    private propContainer:egret.DisplayObjectContainer;

    public constructor(){
        super();

        this.propContainer = new egret.DisplayObjectContainer();
        this.addChild(this.propContainer);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    }

    private onTouchTap(e:egret.TouchEvent){
        let item = <DropItem>e.target;
        item.dispose();
    }

    public startLevel(){
        // let dropIds = UserProxy.inst.fightData.generateDrop();
        // for (let i = 0; i < dropIds.length; i++) {
        //     let dropItem = new DropItem();
        //     dropItem.x = 200;
        //     dropItem.y = 80 + 160 * i;
        //     dropItem.config = Config.DropData[dropIds[i]];
        //     this.propContainer.addChild(dropItem);
        // }
    }
}

class DropItem extends egret.DisplayObjectContainer {
    private bitmap:AutoBitmap;
    private _config:FightDropConfig;

    public constructor(){
        super();
        this.touchEnabled = true;
        this.bitmap = new AutoBitmap();
        this.addChild(this.bitmap);
    }

    public set config(value:FightDropConfig) {
        this._config = value;
        let source = "resource/assets/fight/" + value.resource + ".png";
        this.bitmap.source = source;
    }

    public get config(){
        return this._config;
    }

    public dispose(){
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}