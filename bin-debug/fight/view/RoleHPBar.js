/**
 * 角色血条栏
 * Created by hh on 2016/12/26.
 */
var RoleHPBar = (function (_super) {
    __extends(RoleHPBar, _super);
    function RoleHPBar(side) {
        if (side === void 0) { side = FightSideEnum.LEFT_SIDE; }
        _super.call(this);
        this.barW = 10;
        this.isCanRemove = false;
        this.oldProgress = -1;
        this.side = side;
        this.backGround = new AutoBitmap();
        this.addChild(this.backGround);
        this.backGround.source = "pvp_blood_background_png";
        this.hpBitmap = new AutoBitmap();
        if (side == FightSideEnum.LEFT_SIDE) {
            this.hpBitmap.source = "pvp_blood_png";
        }
        else {
            this.hpBitmap.source = "pvp_blood_enemy_png";
        }
        this.addChild(this.hpBitmap);
        this.hitBitmap = new AutoBitmap("pvp_blood_hit_png");
        this.hitBitmap.visible = false;
        this.addChild(this.hitBitmap);
        this.effBitmap = new AutoBitmap("pvp_blood_line_png");
        this.effBitmap.visible = false;
        this.addChild(this.effBitmap);
    }
    var d = __define,c=RoleHPBar,p=c.prototype;
    p.active = function () {
        this.isCanRemove = false;
        this.effBitmap.visible = true;
        if (this.side == FightSideEnum.RIGHT_SIDE) {
            this.effBitmap.x = 11;
            this.effBitmap.scaleX = -1;
            this.hpBitmap.x = 2;
            this.hpBitmap.y = 1;
            this.hitBitmap.x = 1;
            this.hitBitmap.y = 1;
            this.effBitmap.y = 1;
            this.effBitmap.visible = true;
            this.hpBitmap.source = "pvp_blood_enemy_png";
        }
        else {
            this.effBitmap.x = 51;
            this.effBitmap.scaleX = 1;
            this.hpBitmap.x = 1;
            this.hpBitmap.y = 1;
            this.hitBitmap.x = 1;
            this.hitBitmap.y = 1;
            this.effBitmap.y = 1;
            this.effBitmap.visible = true;
            this.hpBitmap.source = "pvp_blood_png";
        }
        this.setProgress(1, false);
    };
    p.update = function (cur, max) {
        var ratio = +(BigNum.div(cur, max)) || 0;
        var isDie = BigNum.greater(fight.DIE_HP, cur);
        this.setProgress(ratio, isDie);
    };
    p.setProgress = function (value, isDie) {
        var _this = this;
        if (this.oldProgress != value || isDie) {
            var w_1 = MathUtil.clamp(value, 0, 1) * (RoleHPBar.WIDTH - 2);
            if (this.oldProgress < 0 && !isDie) {
                this.hpBitmap.visible = true;
                this.effBitmap.visible = true;
                this.isCanRemove = true;
                this.refresh(w_1);
            }
            else {
                this.hitBitmap.visible = true;
                this.hitBitmap.alpha = 0.8;
                var tween = egret.Tween.get(this.hitBitmap);
                tween.to({ alpha: 1 }, 80);
                tween.to({ alpha: 0.4 }, 80);
                if (isDie) {
                    tween.to({ alpha: 1 }, 80);
                    tween.to({ alpha: 0.4 }, 80);
                    tween.to({ alpha: 1 }, 80);
                    tween.to({ alpha: 0.4 }, 80);
                    tween.to({ alpha: 1 }, 80);
                    tween.to({ alpha: 0.4 }, 80);
                }
                tween.call(function () {
                    egret.Tween.removeTweens(_this.hitBitmap);
                    _this.hpBitmap.visible = true;
                    _this.effBitmap.visible = false;
                    _this.hitBitmap.visible = false;
                    _this.refresh(w_1);
                    if (isDie) {
                        _this.hpBitmap.visible = false;
                        _this.effBitmap.visible = false;
                        egret.setTimeout(function () {
                            _this.isCanRemove = true;
                        }, _this, 100);
                    }
                }, this);
                this.hpBitmap.visible = false;
            }
        }
        this.oldProgress = value;
    };
    p.refresh = function (w) {
        this.hpBitmap.width = w;
        this.hitBitmap.width = w;
        var barPos = 0;
        if (this.side == FightSideEnum.LEFT_SIDE) {
            this.hpBitmap.x = 1;
            this.hitBitmap.x = 1;
            this.effBitmap.scaleX = 1;
            barPos = barPos - 9 + this.hpBitmap.width;
            this.effBitmap.x = barPos;
            this.effBitmap.visible = !(barPos > 51);
        }
        else {
            this.hpBitmap.x = RoleHPBar.WIDTH - w;
            this.hitBitmap.x = RoleHPBar.WIDTH - w;
            this.effBitmap.scaleX = -1;
            this.hitBitmap.y = 0;
            barPos = RoleHPBar.WIDTH - w;
            this.effBitmap.x = barPos + 10;
            this.effBitmap.visible = !(this.effBitmap.x < 10);
        }
    };
    p.reset = function () {
        this.oldProgress = -1;
    };
    RoleHPBar.WIDTH = 62;
    RoleHPBar.HEIGHT = 8;
    return RoleHPBar;
}(egret.DisplayObjectContainer));
egret.registerClass(RoleHPBar,'RoleHPBar');
//# sourceMappingURL=RoleHPBar.js.map