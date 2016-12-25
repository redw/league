/**
 * Created by hh on 2016/12/19.
 */
var FightDropContainer = (function (_super) {
    __extends(FightDropContainer, _super);
    function FightDropContainer() {
        _super.call(this);
        this.propContainer = new egret.DisplayObjectContainer();
        this.addChild(this.propContainer);
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTouchTap, this);
    }
    var d = __define,c=FightDropContainer,p=c.prototype;
    p.onTouchTap = function (e) {
        var item = e.target;
        item.dispose();
    };
    p.startLevel = function () {
        // let dropIds = UserProxy.inst.fightData.generateDrop();
        // for (let i = 0; i < dropIds.length; i++) {
        //     let dropItem = new DropItem();
        //     dropItem.x = 200;
        //     dropItem.y = 80 + 160 * i;
        //     dropItem.config = Config.DropData[dropIds[i]];
        //     this.propContainer.addChild(dropItem);
        // }
    };
    return FightDropContainer;
}(egret.DisplayObjectContainer));
egret.registerClass(FightDropContainer,'FightDropContainer');
var DropItem = (function (_super) {
    __extends(DropItem, _super);
    function DropItem() {
        _super.call(this);
        this.touchEnabled = true;
        this.bitmap = new AutoBitmap();
        this.addChild(this.bitmap);
    }
    var d = __define,c=DropItem,p=c.prototype;
    d(p, "config"
        ,function () {
            return this._config;
        }
        ,function (value) {
            this._config = value;
            var source = "resource/assets/fight/" + value.resource + ".png";
            this.bitmap.source = source;
        }
    );
    p.dispose = function () {
        if (this.parent) {
            this.parent.removeChild(this);
        }
    };
    return DropItem;
}(egret.DisplayObjectContainer));
egret.registerClass(DropItem,'DropItem');
//# sourceMappingURL=FightDropContainer.js.map