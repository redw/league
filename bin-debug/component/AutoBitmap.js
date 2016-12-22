/**
 * 位图
 * @author j
 * 2016/6/8
 */
var AutoBitmap = (function (_super) {
    __extends(AutoBitmap, _super);
    function AutoBitmap() {
        _super.call(this);
    }
    var d = __define,c=AutoBitmap,p=c.prototype;
    d(p, "source"
        ,function () {
            return this._source;
        }
        ,function (value) {
            var _this = this;
            this._source = value;
            if (typeof (value) == "string") {
                if (RES.hasRes(value)) {
                    RES.getResAsync(value, function (res) {
                        _this.texture = res;
                    }, this);
                }
                else {
                    RES.getResByUrl(value, function (res) {
                        _this.texture = res;
                    }, this, RES.ResourceItem.TYPE_IMAGE);
                }
            }
            else {
                this.texture = value;
            }
        }
    );
    return AutoBitmap;
}(egret.Bitmap));
egret.registerClass(AutoBitmap,'AutoBitmap');
//# sourceMappingURL=AutoBitmap.js.map