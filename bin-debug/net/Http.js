var Http = (function (_super) {
    __extends(Http, _super);
    function Http(host) {
        _super.call(this);
        this._cmdDispatcher = new egret.EventDispatcher();
        this._errorDispatcher = new egret.EventDispatcher();
        this._host = host;
        this._loader = new egret.URLLoader();
        this._loader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        this._loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
        this._loader.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onError, this);
        this._reqList = [];
        this._currentReq = null;
    }
    var d = __define,c=Http,p=c.prototype;
    d(Http, "inst"
        ,function () {
            if (Http._instance == null) {
                var inst = new Http(Global.SERVER_ADDR);
                inst.setToken(Global.TEST_TOKEN);
                inst.addEventListener(ContextEvent.HTTP_OK, Http.onOk, inst);
                inst.addEventListener(ContextEvent.HTTP_ERROR, Http.onError, inst);
                Http._instance = inst;
            }
            return Http._instance;
        }
    );
    Http.onOk = function (event) {
        Http._errorCount = 0;
    };
    Http.onError = function (event) {
        var data = event.data;
        var cmd = data["cmd"];
        var error = data["error"];
        if (error == -1) {
            Http._errorCount++;
            if (Http._errorCount > 3 || cmd == CmdID.ENTER) {
                Alert.show("与服务器连接异常，\n请重新登录！", false, false, function () {
                    location.reload();
                });
            }
        }
        else if (error == 10004) {
            Alert.show("游戏登录状态失效，\n请重新登录！", false, false, function () {
                // ExternalUtil.inst.logout();
            });
        }
        else {
            console.error(error);
        }
    };
    p.setToken = function (token) {
        this._token = token;
    };
    p.send = function (cmd, args, ctrl) {
        if (args == null) {
            args = {};
        }
        if (ctrl == null) {
            ctrl = "game";
        }
        args["now"] = Date.now();
        this._reqList.push([cmd, args, ctrl]);
        this.next();
    };
    p.clear = function (cmd) {
        var removeList = [];
        for (var _i = 0, _a = this._reqList; _i < _a.length; _i++) {
            var req = _a[_i];
            if (req[0] == cmd) {
                removeList.push(req);
            }
        }
        for (var _b = 0, removeList_1 = removeList; _b < removeList_1.length; _b++) {
            var req = removeList_1[_b];
            ArrayUtil.remove(this._reqList, req);
        }
    };
    p.next = function () {
        if (this._reqList.length > 0 && this._currentReq == null) {
            this._currentReq = this._reqList.shift();
            if (this._currentReq) {
                var cmd = this._currentReq[0];
                var args = this._currentReq[1];
                var ctrl = this._currentReq[2];
                var url = this._host + "/" + ctrl + "?";
                var isPost = CmdID.postCmdList.indexOf(cmd) >= 0;
                var request;
                if (CmdID.waitCmdList.indexOf(cmd) >= 0) {
                }
                if (isPost) {
                    var postArgs = [];
                    postArgs.push("cmd=" + cmd);
                    if (this._token) {
                        postArgs.push("token=" + this._token);
                    }
                    for (var key in args) {
                        postArgs.push(key + "=" + args[key]);
                    }
                    request = new egret.URLRequest(url);
                    request.method = egret.URLRequestMethod.POST;
                    request.data = new egret.URLVariables(postArgs.join("&"));
                    if (Global.DEBUG) {
                        console.log("%c >>>>>>[" + postArgs.join("&") + "]", "color:green");
                    }
                }
                else {
                    var getArgs = "cmd=" + cmd;
                    if (this._token) {
                        getArgs = getArgs + ("&token=" + this._token);
                    }
                    for (var key in args) {
                        getArgs = getArgs + ("&" + key + "=" + args[key]);
                    }
                    request = new egret.URLRequest(url + getArgs);
                    request.method = egret.URLRequestMethod.GET;
                    if (Global.DEBUG) {
                        console.log("%c >>>>>>[" + getArgs + "]", "color:green");
                    }
                }
                this._loader.load(request);
            }
        }
    };
    p.onComplete = function (event) {
        this.execute(this._loader.data);
    };
    p.onError = function (event) {
        this.execute(null);
    };
    p.execute = function (result) {
        var cmd = this._currentReq[0];
        if (Global.DEBUG) {
            console.log("%c <<<<<< " + cmd + ":" + result, "color:blue");
        }
        if (CmdID.waitCmdList.indexOf(cmd) >= 0) {
        }
        var data = JSON.parse(result);
        var error = 0;
        if (data) {
            if (data["error"]) {
                error = parseInt(data["error"]);
            }
        }
        else {
            error = -1;
        }
        if (error == 0) {
            CmdID.createCmd(cmd, data);
            this.dispatchCmd(cmd, data);
            this.dispatchEventWith(ContextEvent.HTTP_OK, false, { "cmd": cmd, "data": data });
        }
        else {
            this.dispatchError(cmd, error);
            this.dispatchEventWith(ContextEvent.HTTP_ERROR, false, { "cmd": cmd, "error": error });
        }
        this._currentReq = null;
        this.next();
    };
    p.dispatchCmd = function (cmd, data) {
        this._cmdDispatcher.dispatchEventWith(cmd, false, data);
    };
    p.hasCmdListener = function (cmd) {
        return this._cmdDispatcher.hasEventListener(cmd);
    };
    p.addCmdListener = function (cmd, listener, thisObj) {
        this._cmdDispatcher.addEventListener(cmd, listener, thisObj);
    };
    p.removeCmdListener = function (cmd, listener, thisObj) {
        this._cmdDispatcher.removeEventListener(cmd, listener, thisObj);
    };
    p.dispatchError = function (cmd, data) {
        this._errorDispatcher.dispatchEventWith(cmd, false, data);
    };
    p.hasErrorListener = function (cmd) {
        return this._errorDispatcher.hasEventListener(cmd);
    };
    p.addErrorListener = function (cmd, listener, thisObj) {
        this._errorDispatcher.addEventListener(cmd, listener, thisObj);
    };
    p.removeErrorListener = function (cmd, listener, thisObj) {
        this._errorDispatcher.removeEventListener(cmd, listener, thisObj);
    };
    return Http;
}(egret.EventDispatcher));
egret.registerClass(Http,'Http');
//# sourceMappingURL=Http.js.map