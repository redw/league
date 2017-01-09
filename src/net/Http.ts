class Http extends egret.EventDispatcher {
    private static _instance:Http;
    private static _errorCount:number;

    public static get inst():Http {
        if (Http._instance == null) {
            var inst:Http = new Http(Global.SERVER_ADDR);
            inst.setToken(Global.TEST_TOKEN);
            inst.addEventListener(ContextEvent.HTTP_OK, Http.onOk, inst);
            inst.addEventListener(ContextEvent.HTTP_ERROR, Http.onError, inst);
            Http._instance = inst;
        }
        return Http._instance;
    }

    private static onOk(event:egret.Event):void {
        Http._errorCount = 0;
    }

    private static onError(event:egret.Event):void {
        var data:any = event.data;
        var cmd:string = data["cmd"];
        var error:number = data["error"];
        if (error == -1) {
            Http._errorCount++;
            if (Http._errorCount > 3 || cmd == CmdID.ENTER) {
                Alert.show("与服务器连接异常，\n请重新登录！", false,false, function() {
                    location.reload();
                });
            }
        } else if (error == 10004) {
            Alert.show("游戏登录状态失效，\n请重新登录！", false, false,function() {
                // ExternalUtil.inst.logout();
            });
        } else {
            console.error(error);
            // if (Config.ErrorData[error])
            // {
            //     Alert.show(Config.ErrorData[error]);
            // }
            // else
            // {
            //     Alert.show("Error " + error);
            // }
        }
    }

    //----------------------------------------//
    private _host:string;
    private _token:string;

    private _loader:egret.URLLoader;
    private _reqList:any[];
    private _currentReq:any;

    private _cmdDispatcher:egret.EventDispatcher = new egret.EventDispatcher();
    private _errorDispatcher:egret.EventDispatcher = new egret.EventDispatcher();

    public constructor(host:string) {
        super();
        this._host = host;
        this._loader = new egret.URLLoader();
        this._loader.dataFormat = egret.URLLoaderDataFormat.TEXT;
        this._loader.addEventListener(egret.Event.COMPLETE, this.onComplete, this);
        this._loader.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onError, this);
        this._reqList = [];
        this._currentReq = null;
    }

    public setToken(token:string):void {
        this._token = token;
    }

    public send(cmd:string, args?:any, ctrl?:string):void {
        if (args == null) {
            args = {};
        }
        if (ctrl == null) {
            ctrl = "game";
        }
        args["now"] = Date.now();
        this._reqList.push([cmd, args, ctrl]);
        this.next();
    }

    public clear(cmd:string):void {
        var removeList:any[] = [];
        for (var req of this._reqList) {
            if (req[0] == cmd) {
                removeList.push(req);
            }
        }

        for (var req of removeList) {
            ArrayUtil.remove(this._reqList, req);
        }
    }

    private next():void {
        if (this._reqList.length > 0 && this._currentReq == null) {
            this._currentReq = this._reqList.shift();
            if (this._currentReq) {
                var cmd:string = this._currentReq[0];
                var args:any = this._currentReq[1];
                var ctrl:string = this._currentReq[2];
                var url:string = this._host + "/" + ctrl + "?";
                var isPost:boolean = CmdID.postCmdList.indexOf(cmd) >= 0;
                var request:egret.URLRequest;
                if (CmdID.waitCmdList.indexOf(cmd) >= 0) {
                    // Processing.inst.show();
                }
                if (isPost) {
                    var postArgs:Array<string> = [];
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
                } else {
                    var getArgs:string = "cmd=" + cmd;
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
    }

    private onComplete(event:egret.Event):void {
        this.execute(this._loader.data);
    }

    private onError(event:egret.IOErrorEvent):void {
        this.execute(null);
    }

    private execute(result:string):void {
        var cmd:string = this._currentReq[0];
        if (Global.DEBUG) {
            console.log("%c <<<<<< " + cmd + ":" + result, "color:blue");
        }
        if (CmdID.waitCmdList.indexOf(cmd) >= 0) {
            // Processing.inst.hide();
        }
        var data:any = JSON.parse(result);
        var error:number = 0;
        if (data) {
            if (data["error"]) {
                error = parseInt(data["error"]);
            }
        } else {
            error = -1;
        }
        if (error == 0) {
            CmdID.createCmd(cmd, data);
            this.dispatchCmd(cmd, data);
            this.dispatchEventWith(ContextEvent.HTTP_OK, false, {"cmd": cmd, "data": data});
        } else {
            this.dispatchError(cmd, error);
            this.dispatchEventWith(ContextEvent.HTTP_ERROR, false, {"cmd": cmd, "error": error});
        }
        this._currentReq = null;
        this.next();
    }

    public dispatchCmd(cmd:string, data:any):void {
        this._cmdDispatcher.dispatchEventWith(cmd, false, data);
    }

    public hasCmdListener(cmd:string):boolean {
        return this._cmdDispatcher.hasEventListener(cmd);
    }

    public addCmdListener(cmd:string, listener:Function, thisObj:any):void {
        this._cmdDispatcher.addEventListener(cmd, listener, thisObj);
    }

    public removeCmdListener(cmd:string, listener:Function, thisObj:any):void {
        this._cmdDispatcher.removeEventListener(cmd, listener, thisObj);
    }

    public dispatchError(cmd:string, data:any):void {
        this._errorDispatcher.dispatchEventWith(cmd, false, data);
    }

    public hasErrorListener(cmd:string):Boolean {
        return this._errorDispatcher.hasEventListener(cmd);
    }

    public addErrorListener(cmd:string, listener:Function, thisObj:any):void {
        this._errorDispatcher.addEventListener(cmd, listener, thisObj);
    }

    public removeErrorListener(cmd:string, listener:Function, thisObj:any):void {
        this._errorDispatcher.removeEventListener(cmd, listener, thisObj);
    }
}