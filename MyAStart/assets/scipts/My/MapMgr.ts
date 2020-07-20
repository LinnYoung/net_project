import { _decorator, Component, Node, GraphicsComponent, Color, GFX_DRAW_INFO_SIZE, path, loader, ModelComponent, Mesh, GFXPrimitiveMode, utils, GFXAttributeName, GFXFormat, Material, JsonAsset, animation, Vec3 } from 'cc';
import { MapCfgData } from './MapCfgData';
import { E_Node_Type } from './AStarNode';
const { ccclass, property } = _decorator;

@ccclass('MapMgr')
export class MapMgr extends Component {

  

    @property({ type: Node })
    public targerNode: Node = null;

    public gridW = 6;
    public gridH = 6;

    public meshV: Mesh;

    private maxTick=2;

    private  meshName="MeshDrawRoot"

    /**
     * 地图配置表路径
     */
    private readonly path = "configs/MapCfg.json";

    @property({type: Material})
    public mat: Material = null;;

    constructor() {
        super();
    }

    onLoad() {
        let self = this;

        //self.InitMapCfg(self.path);
        // self.DrawMap(2, 2);

        //self.CreateGrid("editor/grid");
    }

    start(){
       this.CreateGrid('editor/grid');
    }

    public mapCfgArr: Array<MapCfgData> = [];

    /**
     * 初始化地图数据
     * @param path 配置表路径
     */
    private InitMapCfg(path: string) {
        let self = this;

        loader.loadRes<JSON>(path, null, null, null, function (err, obj) {
            if (err) {
                console.log("err while read" + err);
                return;
            }

            //解析数据
            let mapData = JsonAsset.deserialize(obj);    
            let data = mapData.json;    
            for (let i = 0; i < data.length; i++) {
                let currId = data[i].id;
                let currMapX = data[i].mapX;
                let currMapY = data[i].mapY;
                let currType = data[i].type;

                let map: MapCfgData = new MapCfgData(currId, currMapX, currMapY, currType);
                self.mapCfgArr.push(map);
                console.log("data[0]'s value is:" + data[i].des);
                console.log("now ,I want to know map's value:"+map.id+"  "+"  "+map.mapX+"  "+map.mapY+"  "+map.type);
                console.log("Also,I want to know mapCfgArr's length is: "+self.mapCfgArr.length);
            }
           
            console.log("MapDataCfg init successfully!!! ");
        });
    }

    /**
     * 获取ID对应的MapData
     * @param id 
     */
    public GetMapCfgDataByID(id): MapCfgData {
        let self = this;
        let mcd: MapCfgData = null;

        self.mapCfgArr.forEach(element => {
            if (element.id == id)
                mcd = element;
            else
                console.log("Not found it...");
        });

        return mcd;
    }

  
    public DrawMesh(){

    }

    /**
     * 创建Mesh
     * @param effectName 节点名
     */
    public CreateGrid(effectName) {
        const tempNode = new Node(effectName);

        tempNode.parent = this.node;
        tempNode.setWorldPosition(cc.v3(0, 0, 0));
        const model = tempNode.addComponent(ModelComponent);

        const positions = [];
        const colors = [];
        const indices = [];

        const xLineNum = 10;
        const zLineNum = 10;
        const space = 1;
        
        for (let i = 0; i < xLineNum; i++) {
            positions.push(i*space, -1000);
            positions.push(i*space, 1000);
        }

        for (let j = 0; j < zLineNum; j++) {
            positions.push(-1000, j*space);
            positions.push(1000, j*space);
        }

        for (let i = 0; i < positions.length; i += 2) {
            indices.push(i / 2);
        }

        const primitiveMode = GFXPrimitiveMode.LINE_STRIP_ADJACENCY;
        // 使用二维顶点来节省顶点数据
        const attributes = [{
            name: GFXAttributeName.ATTR_POSITION,
            format: GFXFormat.RG32F,
        }];
        const mesh = utils.createMesh({positions, indices, colors, primitiveMode, attributes});

        model.mesh = mesh;
        model.material = this.mat;

        return model;
    }

}
