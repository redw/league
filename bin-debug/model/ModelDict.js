/**
 * Created by Administrator on 2016/12/6.
 */
var ModelDict = (function (_super) {
    __extends(ModelDict, _super);
    function ModelDict(itemC, eventPrefix) {
        _super.call(this);
        this.content = Object.create(null);
        this.itemC = itemC;
        this.eventPrefix = eventPrefix;
    }
    var d = __define,c=ModelDict,p=c.prototype;
    p.parse = function (value) {
        var keys = Object.keys(value);
        var len = keys.length;
        for (var i = 0; i < len; i++) {
            var key = keys[i];
            if (this.containsKey(key)) {
                var item = this.getValue(key);
                item.parse(value[key], key);
            }
            else {
                var item = new this.itemC();
                item.parse(value[key], key);
                this.add(key, item);
            }
        }
        if (len > 0) {
            EventManager.inst.dispatch(this.eventPrefix + "_UPDATE");
        }
    };
    p.getKeys = function () {
        return Object.keys(this.content);
    };
    /**
     * 长度
     * @return
     *
     */
    p.length = function () {
        return this.getKeys().length;
    };
    p.add = function (key, value) {
        this.content[key] = value;
    };
    /**
     * 更新
     * @param key
     * @param value
     */
    p.update = function (key, value) {
        var item = this.getValue(key);
        item.parse(value);
        EventManager.inst.dispatch(this.eventPrefix + "_UPDATE", key);
    };
    p.remove = function (key) {
        if (this.containsKey(key)) {
            delete this.content[key];
            EventManager.inst.dispatch(this.eventPrefix + "_UPDATE", key);
        }
    };
    p.removeKeys = function (keys) {
        var len = keys ? keys.length : 0;
        for (var i = 0; i < len; i++) {
            if (this.containsKey(keys[i])) {
                delete this.content[keys[i]];
            }
        }
        if (len > 0) {
            EventManager.inst.dispatch(this.eventPrefix + "_UPDATE");
        }
    };
    /**
     * 是否包含指定key
     * @param key
     * @return
     *
     */
    p.containsKey = function (key) {
        return key in this.content;
    };
    /**
     * 通过key获取value
     * @param key
     * @return
     *
     */
    p.getValue = function (key) {
        return this.content[key];
    };
    /**
     * 获取value列表
     * @return
     *
     */
    p.getValues = function () {
        var result = [];
        var keys = this.getKeys();
        for (var i = 0; i < keys.length; i++) {
            result.push(this.content[keys[i]]);
        }
        return result;
    };
    /**
     * 清空
     *
     */
    p.clear = function () {
        this.content = Object.create(null);
    };
    return ModelDict;
}(egret.HashObject));
egret.registerClass(ModelDict,'ModelDict');
//# sourceMappingURL=ModelDict.js.map