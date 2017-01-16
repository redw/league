/**
 * 位图
 * @author j
 * 2016/6/8
 */
class AutoBitmap extends egret.Bitmap
{
    public constructor(value?:any)
    {
        super();
        if (value) {
            this.source = value;
        }
    }

    public set source(value:any)
    {
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
}