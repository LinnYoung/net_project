import { _decorator, Component, Node, Material, Vec2, ModelComponent, Vec3, geometry, CameraComponent, systemEvent, SystemEventType, EventTouch, PhysicsSystem, PhysicsRayResult, Prefab, instantiate, InstanceMaterialType, director, sliced } from 'cc';
import { AStarNode, E_Node_Type } from './AStarNode';
import { AStarMgr } from './AStarMgr';
const { ccclass, property } = _decorator;



@ccclass('TestAStar')
export class TestAStar extends Component {

    /**
     * 左上角第一个立方体的X坐标
     */
    public beginX = -3;

    /**
     * 左上角第一个立方体的Y坐标
     */
    public beginY = 5;

    /**
     * 之后每个立方体之间的 偏移X坐标
     */
    public offsetX = 2;

    /**
     * 之后每个立方体之间的偏移Y坐标
     */
    public offsetY = -2;

    /**
     * 地图格子的宽
     */
    public mapW = 5;

    /**
     * 地图格子的高
     */
    public mapH = 5;

    @property({ type: Material })
    public red: Material = null;

    @property({ type: Material })
    public yellow: Material = null;

    @property({ type: Material })
    public blue: Material = null;

    @property({ type: Material })
    public normal: Material = null;

    @property({ type: Prefab })
    public instanObj: Prefab = null;


    /**
     * 开始点 给它一个 为负的坐标
     */
    private beginPos: Vec2 = new Vec2(-1, 0);

    /**
     * 创建的cubes列表
     */
    private cubes: Array<Node> = new Array<Node>();

    /**
     * AStar 节点列表
     */
    private lst: Array<AStarNode> = new Array<AStarNode>();

    /**
     * 摄像机实例
     */
    @property({ type: CameraComponent })
    private readonly mainCamera: CameraComponent = null;

    /**
     * 射线实例
     */
    private ray: geometry.ray = new geometry.ray();

    /**
     * 格子生成点
     */
    @property({ type: Node })
    public spawnPos: Node = null;

    public onLoad() {
        let self = this;

        //初始化AStarMgr
        //let aStarMgr:AStarMgr=self.node.getComponent('AStarMgr') as AStarMgr;
        //aStarMgr.Init();

        AStarMgr.Instance().InitMapInfo(self.mapW, self.mapH);

        for (let i = 0; i < self.mapW; ++i) {
            for (let j = 0; j < self.mapH; ++j) {
                //创建一个个立方体
                //let obj =this.node.CreatePrimitive(PrimitiveType.BOX);
                let obj = instantiate(self.instanObj) as Node;
                //设置父对象
                obj.parent = self.spawnPos;
                //console.log("obj.type is:"+obj);
                obj.position = new Vec3(self.beginX + i * self.offsetX, self.beginY + j * self.offsetY, 0);
                //console.log("obj.node.position is:"+obj.position);
                //名字
                obj.name = i + "_" + j;
                //存储立方体到字典容器中
                self.cubes.push(obj);
                //console.log("self.cubes.length is:"+self.cubes.length);

                //得到格子 判断它是不是阻挡
                let tempNode: AStarNode = AStarMgr.Instance().nodes[i][j];
                if (tempNode.type == E_Node_Type.Stop) {
                    obj.getComponent(ModelComponent).material = self.red;
                    //console.log("set obj'material:"+obj.getComponent(ModelComponent).material.toString());
                }
            }
            // console.log("continute for-time is:"+i);
        }
    }


    public onEnable() {
        systemEvent.on(SystemEventType.TOUCH_START, this.TestAStar, this);
        //systemEvent.on(SystemEventType.KEY_DOWN, this.Test, this);
    }

    public onDisable() {
        systemEvent.off(SystemEventType.TOUCH_START, this.TestAStar, this);
        // systemEvent.off(SystemEventType.KEY_UP, this.Test, this);
    }

    /**
     * 测试AStar
     */
    TestAStar(touch: Touch, event: EventTouch) {

        let self = this;

        //console.log("Vect.UNIT_X is:"+Vec2.UNIT_X);
        //如果鼠标左键按下

        //进行射线检测
        let info: PhysicsRayResult[] = null; //射线检测完的信息
        //得到屏幕鼠标位置发出去的射线
        //console.log("Click successful!");

        self.mainCamera.screenPointToRay(touch._point.x, touch._point.y, self.ray);

        //#region  基于物理碰撞器的射线检测

        /* if (PhysicsSystem.instance.raycast(self.ray)) {
             const r = PhysicsSystem.instance.raycastResults;
             for (let i = 0; i < r.length; i++) {
                 const item = r[i];
                 console.log("Click obj is:"+item.collider.name);
             }
         } else {
              console.log("What are you want to do!");
         }*/
        //#endregion

        //射线检测
        if (PhysicsSystem.instance.raycast(self.ray)) {
            self.ReSetMaterial();

            info = PhysicsSystem.instance.raycastResults;
            console.log("Ray Info is:" + info[0].collider.name.toString());

            //清理上一次的路径，把绿色立方体变成白色
            //如果不为空，证明找成功了
            if (self.lst != null) {
                for (let i = 0; i < self.lst.length; ++i) {
                    self.cubes[i].getComponent(ModelComponent).material = self.normal;
                    console.log("Reset self.cubes[i].material...");
                }
            }

            //console.log("self.beginPos is:"+self.beginPos);
            //console.log("self.beginPos equal new Vec2(-1.00,0.00) is:"+(self.beginPos == new Vec2(-1.00, 0.00)));
            //console.log("self.beginPos.x equal -1 and self.beginPos.y equal 0 is:"+(self.beginPos.x==-1&&self.beginPos.y==0));
            //得到点击到的立方体 才能知道是第几行第几列
            if (self.beginPos.x == -1 && self.beginPos.y == 0) {
                console.log("Set beginPos...");
                let strs = info[0].collider.node.name.split('_');
                //得到行列位置 就是开始点位置
                self.beginPos = new Vec2(Number(strs[0].toString())
                    , Number(strs[1].toString()));
                //console.log("set self.beginPos is:" + self.beginPos.toString());
                //把点击到的对象变成黄色
                info[0].collider.node.getComponent(ModelComponent).material = self.yellow;
            }
            //有起点了 那这就是 来点出终点 进行寻路
            else {
                console.log("Set endPos...");
                //得到终点
                let strs: string[] = info[0].collider.node.name.split('_');
                let endPos: Vec2 = new Vec2(Number(strs[0]), Number(strs[1]));
                console.log("endPos is:" + info[0].collider.node.name);

                //寻路
                self.lst = AStarMgr.Instance().FindPath(self.beginPos, endPos);

                //避免死路的时候黄色不变成白色，所以事先清一遍。因为beginPos.x是float类型的所以要转换为int类型
                //self.cubes[self.beginPos.x][.beginPos.y].getComponent(ModelComponent).material = this.normal;
                let st: string = (self.beginPos.x + "_" + self.beginPos.y).toString();
                self.cubes.forEach(element => {
                    if (element.name == st) {
                        //避免死路的时候黄色不变成白色，所以事先清一遍。因为beginPos.x是float类型的所以要转换为int类型
                        element.getComponent(ModelComponent).material = this.normal;
                        console.log("self.cubes[beginPos] is:" + element.name)
                    }
                });

                //如果不为空，证明找成功了
                if (self.lst != null) {
                    for (let j = 0; j < self.lst.length; ++j) {
                        let temp: string = (self.lst[j].x + "_" + self.lst[j].y).toString();
                        self.cubes.forEach(element => {
                            if(element.name==temp){
                                element.getComponent(ModelComponent).material=self.blue;
                                //console.log("打印变色的顺序："+element.name);
                            }
                        });
                       // self.cubes[j].getComponent(ModelComponent).material = this.blue;
                        console.log("打印路径顺序：" + self.lst[j].x + "_" + self.lst[j].y);
                    }
                }

                //清除开始点 把它变成初始值
                self.beginPos = new Vec2(-1, 0);
            }
        }
    }


    /**
     * 重置变成蓝色的对象为Normal
     */
    public ReSetMaterial():void{
        let self=this;

        if (self.lst != null) {
            for (let j = 0; j < self.lst.length; ++j) {
                let temp: string = (self.lst[j].x + "_" + self.lst[j].y).toString();
                self.cubes.forEach(element => {
                    if(element.name==temp){
                        element.getComponent(ModelComponent).material=self.normal;
                        //console.log("重置变色的顺序："+element.name);
                    }
                });             
            }
        }
    }

}
