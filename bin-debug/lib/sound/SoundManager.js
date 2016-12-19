/**
 * 声音
 * @author j
 * 2016/11/21
 */
var SoundManager = (function (_super) {
    __extends(SoundManager, _super);
    function SoundManager() {
        _super.apply(this, arguments);
        //----------------------------------------//
        this._musicSwitch = true;
        this._effectSwitch = true;
    }
    var d = __define,c=SoundManager,p=c.prototype;
    d(SoundManager, "inst"
        ,function () {
            if (SoundManager._inst == null) {
                SoundManager._inst = new SoundManager();
            }
            return SoundManager._inst;
        }
    );
    d(p, "musicSwitch"
        ,function () {
            return this._musicSwitch;
        }
        ,function (value) {
            this._musicSwitch = value;
            if (this._musicSwitch) {
                if (this._musicSound) {
                    this._musicSound.play();
                }
            }
            else {
                if (this._musicSound) {
                    this._musicSound.stop();
                }
            }
        }
    );
    d(p, "effectSwitch"
        ,function () {
            return this._effectSwitch;
        }
        ,function (value) {
            this._effectSwitch = value;
        }
    );
    p.setup = function () {
        Global.getStage().addEventListener(egret.Event.ACTIVATE, this.onActive, this);
        Global.getStage().addEventListener(egret.Event.DEACTIVATE, this.onDeactive, this);
    };
    p.playMusic = function (path, playTime) {
        if (this._musicSwitch) {
            if (this._musicSound) {
                this._musicSound.stop();
                this._musicSound = null;
            }
            this._musicSound = new BaseSound(path, egret.Sound.MUSIC);
            this._musicSound.play(playTime);
        }
    };
    p.stopMusic = function () {
        if (this._musicSound) {
            this._musicSound.stop();
            this._musicSound = null;
        }
    };
    p.playEffect = function (path, playTime) {
        var sound = null;
        if (this._effectSwitch) {
            sound = new BaseSound(path, egret.Sound.EFFECT);
            sound.play(playTime);
        }
        return sound;
    };
    p.onActive = function (event) {
        if (this._musicSwitch) {
            if (this._musicSound) {
                this._musicSound.play();
            }
        }
    };
    p.onDeactive = function (event) {
        if (this._musicSwitch) {
            if (this._musicSound) {
                this._musicSound.stop();
            }
        }
    };
    return SoundManager;
}(egret.HashObject));
egret.registerClass(SoundManager,'SoundManager');
