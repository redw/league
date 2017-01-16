/**
 * Created by hh on 2017/1/13.
 */
class PriorityImage extends egret.Bitmap{
    private _source:string;
    private priority:number = 0;
    public constructor(priority:number=1, source:string=null){
        super();
        this.priority = priority;
        if (source) {
            this.source = source;
        }
    }

    public set source(value:string){
        if (RES.isGroupLoaded(value)) {
            this.addImage(value);
        } else {
            RES.createGroup(value, [value], true);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onLoadComplete, this);
            RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onLoadComplete, this);
            RES.loadGroup(value, this.priority)
        }
        this._source = value;
    }

    private onLoadComplete(e:RES.ResourceEvent){
        if (e.groupName == this._source) {
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onLoadComplete, this);
            this.addImage(this._source);
        }
    }

    private addImage(value:string){
        RES.getResAsync(value, (res:any) => {
            this.texture = res;
        }, this);
    }
}
