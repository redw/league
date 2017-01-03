/**
 * 面板基类
 * @author j
 *
 */
class BasePanel extends eui.Component {
    protected _dataInited: boolean = false;
    protected _childrenCreated: boolean = false;

    //数据
    protected _data: any;

    //层级
    protected _layer: string = PanelManager.BOTTOM_LAYER;
    //互斥
    protected _mutex: boolean = false;
    //灰底
    protected _modal: boolean = false;
    //灰底ALPHA
    protected _modalAlpha: number = 0.6;
    /*
     打开特效
     0：没有动画
     1：中间弹出
     2：上进
     3：下进
     4：左进
     5：右进
     */
    protected _effectType: number = 0;

    protected _soundOpen: boolean = false;
    protected _soundClose: boolean = false;


    get soundOpen(): boolean {
        return this._soundOpen;
    }

    set soundOpen(val:boolean){
        this._soundOpen = val ;
    }

    get soundClose(): boolean {
        return this._soundClose;
    }

    set soundClose(val:boolean){
        this._soundClose = val ;
    }

    set effectType(val:number)
    {
        this._effectType = val;
    }
    
    public constructor() {
        super();
    }

    public setData(data: any): void {
        this._data = data;
        this._dataInited = true;

        if (this._childrenCreated) {
            this.initData();
        }
    }

    protected childrenCreated(): void {
        super.childrenCreated();

        this.init();
        this._childrenCreated = true;

        if (this._dataInited) {
            this.initData();
        }
    }

    get data(): any {
        return this._data;
    }

    get layer(): string {
        return this._layer;
    }

    get mutex(): boolean {
        return this._mutex;
    }

    get modal(): boolean {
        return this._modal;
    }

    get modalAlpha(): number {
        return this._modalAlpha;
    }

    get effectType(): number {
        return this._effectType;
    }

    //初始化
    public init(): void {

    }

    //初始化数据
    public initData(): void {

    }

    //销毁处理
    public destory(): void {

    }
}