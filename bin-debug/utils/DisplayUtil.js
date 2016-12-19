/**
 * ÏÔʾ¹¤¾ßÀà
 * by Rock
 * (c) copyright 2014 - 2035
 * All Rights Reserved.
 */
var DisplayUtil;
(function (DisplayUtil) {
    function createCover(alpha, coverWidth, coverHeight) {
        var cover = new eui.Group();
        cover.width = Global.getStageWidth();
        cover.height = Global.getStageHeight();
        var spr = new egret.Sprite();
        spr.graphics.beginFill(0x000000, alpha ? alpha : 0.5);
        spr.graphics.drawRect(0, 0, coverWidth ? coverWidth : Global.getStageWidth(), coverHeight ? coverHeight : Global.getStageHeight());
        spr.graphics.endFill();
        spr.touchChildren = false;
        spr.touchEnabled = false;
        cover.addChild(spr);
        return cover;
    }
    DisplayUtil.createCover = createCover;
    function removeFromParent(displayObject) {
        if (displayObject && displayObject.parent) {
            displayObject.parent.removeChild(displayObject);
        }
        else {
            if (displayObject && !displayObject.parent) {
                //                console.log("delete fail!");
                displayObject = null;
            }
        }
    }
    DisplayUtil.removeFromParent = removeFromParent;
    function getChildByName(parent, name) {
        for (var i = 0; i < parent.numElements; i++) {
            var element = parent.getElementAt(i);
            if (element.name == name) {
                return element;
            }
        }
        return null;
    }
    DisplayUtil.getChildByName = getChildByName;
    function changeBGready(parent) {
        var cover = new eui.Group();
        cover.width = parent.width;
        cover.height = parent.height;
        var spr = new egret.Sprite();
        spr.graphics.beginFill(0x000000);
        spr.graphics.drawRect(0, 0, parent.width, parent.height);
        spr.graphics.endFill();
        spr.touchChildren = false;
        spr.touchEnabled = false;
        spr.alpha = 0;
        cover.addChild(spr);
        parent.addChild(cover);
        var tw = egret.Tween.get(spr);
        tw.to({ alpha: 1 }, 500);
        tw.to({ alpha: 0 }, 500);
        tw.call(removeBg, this);
        var self = cover;
        var child = spr;
        function removeBg() {
            self.removeChild(child);
            parent.removeChild(self);
        }
    }
    DisplayUtil.changeBGready = changeBGready;
})(DisplayUtil || (DisplayUtil = {}));
