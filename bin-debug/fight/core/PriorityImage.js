/**
 * Created by hh on 2017/1/13.
 */
var PriorityImage = (function (_super) {
    __extends(PriorityImage, _super);
    function PriorityImage(priority, source) {
        if (priority === void 0) { priority = 1; }
        if (source === void 0) { source = null; }
        _super.call(this);
        this.priority = 0;
        this.priority = priority;
        if (source) {
            this.source = source;
        }
    }
    var d = __define,c=PriorityImage,p=c.prototype;
    d(p, "source",undefined
        ,function (value) {
            this._source = value;
            if (RES.isGroupLoaded(value)) {
                this.addImage(value);
            }
            else {
                RES.createGroup(value, [value], true);
                RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onLoadComplete, this);
                RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onLoadComplete, this);
                RES.loadGroup(value, this.priority);
            }
        }
    );
    p.onLoadComplete = function (e) {
        if (e.groupName == this._source) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onLoadComplete, this);
            this.addImage(this._source);
        }
    };
    p.addImage = function (value) {
        var _this = this;
        RES.getResAsync(value, function (res) {
            _this.texture = res;
        }, this);
    };
    return PriorityImage;
}(egret.Bitmap));
egret.registerClass(PriorityImage,'PriorityImage');
//# sourceMappingURL=PriorityImage.js.map