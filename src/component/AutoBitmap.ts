/**
 * 位图
 * @author j
 * 2016/6/8
 */
class AutoBitmap extends egret.Bitmap
{
    private _source:any;
    public constructor()
    {
        super();
    }

    public set source(value:any)
    {
        this._source = value;
        if (typeof(value) == "string")
        {
            if (RES.hasRes(value))
            {
                RES.getResAsync(value, (res:any) =>
                {
                    this.texture = res;
                }, this);
            }
            else
            {
                RES.getResByUrl(value, (res:any) =>
                {
                    this.texture = res;
                }, this, RES.ResourceItem.TYPE_IMAGE);
            }
        }
        else
        {
            this.texture = value;
        }
    }

    public get source(){
        return this._source;
    }
}