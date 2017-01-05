/**
 * Created by Administrator on 2016/12/6.
 */
class ModelDict extends egret.HashObject{
    private itemC:any;
    private eventPrefix:string;
    private content = Object.create(null);

    constructor(itemC:any, eventPrefix:string){
        super();
        this.itemC = itemC;
        this.eventPrefix = eventPrefix;
    }

    public parse(value:any){
        let keys = Object.keys(value);
        const len = keys.length;
        for (let i = 0; i < len; i++) {
            let key = keys[i];
            if (this.containsKey(key)) {
                let item:any = this.getValue(key);
                if (!value[key].id) {
                    value[key].id = key;
                }
                item.parse(value[key]);
            } else {
                let item = new this.itemC();
                if (!value[key].id) {
                    value[key].id = key;
                }
                item.parse(value[key]);
                this.add(key, item);
            }
        }
        if (len > 0) {
            EventManager.inst.dispatch(this.eventPrefix + "_UPDATE");
        }
    }

    public getKeys(){
        return Object.keys(this.content);
    }

    /**
     * 长度
     * @return
     *
     */
    public length():number {
        return this.getKeys().length;
    }

    private add(key:string, value:any){
        this.content[key] = value;
    }

    /**
     * 更新
     * @param key
     * @param value
     */
    public update(key:string, value:any) {
        var item:any = this.getValue(key);
        item.parse(value);
        EventManager.inst.dispatch(this.eventPrefix + "_UPDATE", key);
    }

    public remove(key:string) {
        if (this.containsKey(key)) {
            delete this.content[key];
            EventManager.inst.dispatch(this.eventPrefix + "_UPDATE", key);
        }
    }

    public removeKeys(keys:string[]){
        var len = keys ? keys.length : 0;
        for (var i = 0; i < len; i++) {
            if (this.containsKey(keys[i])) {
                delete this.content[keys[i]];
            }
        }
        if (len > 0) {
            EventManager.inst.dispatch(this.eventPrefix + "_UPDATE");
        }
    }

    /**
     * 是否包含指定key
     * @param key
     * @return
     *
     */
    public containsKey(key:string):boolean {
        return key in this.content;
    }

    /**
     * 通过key获取value
     * @param key
     * @return
     *
     */
    public getValue(key:string | number){
        return this.content[key];
    }

    /**
     * 获取value列表
     * @return
     *
     */
    public getValues():any[] {
        var result:any[] = [];
        var keys = this.getKeys();
        for (var i = 0; i < keys.length; i++) {
            result.push(this.content[keys[i]]);
        }
        return result;
    }

    /**
     * 清空
     *
     */
    public clear():void {
        this.content = Object.create(null);
    }


}