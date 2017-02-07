/**
 * 动画工具
 * @author j
 *
 */
module McUtil
{
    var _factoryMap:any = {};

    export function create(path:string, name:string, func:any, thisObj:any):void
    {
        if (_factoryMap[path] == null)
        {
            _factoryMap[path] = {"factory": null, "callbackList": []};
        }
        var item = _factoryMap[path];

        if (item["factory"])
        {
            func.call(thisObj, new egret.MovieClip(item["factory"].generateMovieClipData(name)));
        }
        else
        {
            item["callbackList"].push({"name": name, "func": func, "thisObj": thisObj});

            if (item["callbackList"].length == 1)
            {
                RES.getResByUrl(path + ".json", function(json:any):void
                {
                    if (json == null)
                    {
                        throw new Error("McUtil => " + path + ".json Load Error....");
                    }

                    RES.getResByUrl(path + ".png", function(texture:any):void
                    {
                        if (texture == null)
                        {
                            throw new Error("McUtil => " + path + ".png Load Error....");
                        }
                        item["factory"] = new egret.MovieClipDataFactory(json, texture);

                        for (var callback of item["callbackList"])
                        {
                            callback["func"].call(callback["thisObj"], new egret.MovieClip(item["factory"].generateMovieClipData(callback["name"])));
                        }
                        delete item["callbackList"];

                    }, this);

                }, this);
            }
        }
    }

    export function clear(key?:string):void
    {
        if (key)
        {
            var delList:string[] = [];

            for (var path in _factoryMap)
            {
                if (path.indexOf(key) >= 0)
                {
                    delList.push(path);
                }
            }

            for (var delPath of delList)
            {
                delete _factoryMap[delPath];
            }
        }
        else
        {
            _factoryMap = {};
        }
    }
}