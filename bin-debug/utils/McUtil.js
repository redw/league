/**
 * 动画工具
 * @author j
 *
 */
var McUtil;
(function (McUtil) {
    var _factoryMap = {};
    function create(path, name, func, thisObj) {
        if (_factoryMap[path] == null) {
            _factoryMap[path] = { "factory": null, "callbackList": [] };
        }
        var item = _factoryMap[path];
        if (item["factory"]) {
            func.call(thisObj, new egret.MovieClip(item["factory"].generateMovieClipData(name)));
        }
        else {
            item["callbackList"].push({ "name": name, "func": func, "thisObj": thisObj });
            if (item["callbackList"].length == 1) {
                RES.getResByUrl(path + ".json", function (json) {
                    if (json == null) {
                        throw new Error("McUtil => " + path + ".json Load Error....");
                    }
                    RES.getResByUrl(path + ".png", function (texture) {
                        if (texture == null) {
                            throw new Error("McUtil => " + path + ".png Load Error....");
                        }
                        item["factory"] = new egret.MovieClipDataFactory(json, texture);
                        for (var _i = 0, _a = item["callbackList"]; _i < _a.length; _i++) {
                            var callback = _a[_i];
                            callback["func"].call(callback["thisObj"], new egret.MovieClip(item["factory"].generateMovieClipData(callback["name"])));
                        }
                        delete item["callbackList"];
                    }, this);
                }, this);
            }
        }
    }
    McUtil.create = create;
    function clear(key) {
        if (key) {
            var delList = [];
            for (var path in _factoryMap) {
                if (path.indexOf(key) >= 0) {
                    delList.push(path);
                }
            }
            for (var _i = 0, delList_1 = delList; _i < delList_1.length; _i++) {
                var delPath = delList_1[_i];
                delete _factoryMap[delPath];
            }
        }
        else {
            _factoryMap = {};
        }
    }
    McUtil.clear = clear;
})(McUtil || (McUtil = {}));
//# sourceMappingURL=McUtil.js.map