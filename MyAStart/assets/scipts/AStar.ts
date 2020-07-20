import { _decorator, Component, Node, graphics, GraphicsComponent, systemEvent, SystemEvent, SystemEventType, Color, Vec2 } from 'cc';
import { GridType, Grid } from './Grid';
const { ccclass, property } = _decorator;

@ccclass('AStar')
export class AStar extends Component {


    @property({ type: Node })
    public mapPos: Node = null;

    @property({ type: GraphicsComponent })
    public map: GraphicsComponent = null;


    /**
     * 单元格子的宽度
     */
    public gridW: any;


    /**
     * 单元格子的高度
     */
    public gridH: any;


    /**
     * 纵向格子的数量
     */
    public mapH: number;

    /**
     * 横向格子的数量
     */
    public mapW: number;

    /**
     * 是否八方向寻路
     */
    public is8dir: boolean;

    /**
     * 格子列表
     */
    public gridsLst: Array<Array<Grid>> = new Array<Array<Grid>>();

    /**
     * 路径数组
     */
    public path: Array<Grid> = null;

    /**
     * 开启列表
     */
    public openLst: Array<Grid> = null;

    /**
     * 关闭列表
     */
    public closeLst: Array<Grid> = null;



    constructor() {
        super();
        this.map;
    }


    onLoad() {

        this.gridW = 50;
        this.gridH = 50;
        this.mapH = 15;
        this.mapW = 25;

        this.is8dir = true;

        systemEvent.on(SystemEventType.TOUCH_START, this.OnTouchStart, this);
        systemEvent.on(SystemEventType.TOUCH_MOVE, this.OnTouchMove, this);
        systemEvent.on(SystemEventType.TOUCH_START, this.OnTouchEnd, this);


        //初始化map
        //this.map=this.mapPos.getComponent<GraphicsComponent>();

        //初始化地图
        this.InitMap();
    }


    /**
     * 当触摸开始时
     */
    private OnTouchStart() {
        // this.InitMap();
    }

    /** 
     * 当触摸时
    */
    private OnTouchMove(event) {
        let pos = event.getLocation();
        let x = Math.floor(pos.x / (this.gridW + 2));
        let y = Math.floor(pos.y / (this.gridH + 2));
        if (this.gridsLst[x][y].type == GridType.Normal) {
            this.gridsLst[x][y].type = GridType.Barrier;
            this.Draw(x, y, Color.CYAN);
        }
    }

    /**
     * 当触摸结束时
     */
    private OnTouchEnd() {
        // 开始寻路
        this.FindPath(new Vec2(1, 2), new Vec2(16, 3));
    }


    /**
     * 初始化地图
     */
    public InitMap() {
        this.openLst = new Array<Grid>();
        this.closeLst = new Array<Grid>();
        this.path = new Array<Grid>();
        // 初始化格子二维数组
        this.gridsLst = new Array(this.mapW + 1);
        for (let col = 0; col < this.gridsLst.length; col++) {
            this.gridsLst[col] = new Array(this.mapH + 1);
        }

        console.log("map 是否存在：" + this.map);

        this.map.clear();

        for (let col = 0; col <= this.mapW; col++) {
            for (let row = 0; row <= this.mapH; row++) {
                this.Draw(col, row, Color.WHITE);
                this.AddGrid(col, row, GridType.Normal);
            }
        }

        // 设置起点和终点
        let startX = 1;
        let startY = 2;
        let endX = 16;
        let endY = 3;
        this.gridsLst[startX][startY].type = GridType.Start;
        this.Draw(startX, startY, Color.MAGENTA);

        this.gridsLst[endX][endY].type = GridType.End;
        this.Draw(endX, endY, Color.BLUE);
    }

    /**
     * 添加格子
     * @param x 列
     * @param y 行
     * @param type 格子类型
     */
    public AddGrid(x: number, y: number, type: GridType) {

        let grid: Grid = new Grid();
        grid.x = x;
        grid.y = y;
        grid.type = type;
        this.gridsLst[x][y] = grid;
    }

    /**
     * 排序方法
     * @param x 格子1
     * @param y 格子2
     */
    private SortFunc(x: Grid, y: Grid) {
        return x.f - y.f;
    }


    /**
     * 生成路径
     * @param grid 
     */
    private GeneratePath(grid: Grid) {
        this.path.push(grid);
        while (grid.parent) {
            grid = grid.parent;
            this.path.push(grid);
        }
        console.log("Path.length: " + this.path.length);
        for (let i = 0; i < this.path.length; i++) {
            // 起点终点不覆盖，方便看效果
            if (i != 0 && i != this.path.length - 1) {
                let grid = this.path[i];
                this.Draw(grid.x, grid.y, Color.GREEN);
            }
        }
    }


    /**
      * 找到路径
      * @param startPos 起点
      * @param endPos 终点
      */
    private FindPath(startPos: Vec2, endPos: Vec2) {


        //首先判断 传入的两个点 是否合法
        //1.首先 要在地图范围内
        //如果不合法 应该直接 返回null 意味着不能寻路
        if (startPos.x < 0 || startPos.x >= this.mapW
            || startPos.y < 0 || startPos.y >= this.mapH
            || endPos.x < 0 || endPos.y >= this.mapH) {
            console.log("开始或者结束点在地图格子范围外");
            return;
        }
        else {

            //要不是阻挡
            //得到起点和终点 对应的格子
            let startGrid: Grid = this.gridsLst[startPos.x][startPos.y];
            let endGrid: Grid = this.gridsLst[endPos.x][endPos.y];

            this.openLst.push(startGrid);
            let curGrid: Grid = this.openLst[0];
            while (this.openLst.length > 0 && curGrid.type != GridType.Start) {
                // 每次都取出f值最小的节点进行查找
                curGrid = this.openLst[0];
                if (curGrid.type == GridType.Start) {
                    console.log("Find path success.");
                    this.GeneratePath(curGrid);
                    return;
                }

                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (i != 0 || j != 0) {
                            let col = curGrid.x + i;
                            let row = curGrid.y + j;
                            if (col >= 0 && row >= 0 && col <= this.mapW && row <= this.mapH
                                && this.gridsLst[col][row].type != GridType.Barrier
                                && this.closeLst.indexOf(this.gridsLst[col][row]) < 0) {
                                if (this.is8dir) {
                                    // 8方向 斜向走动时要考虑相邻的是不是障碍物
                                    if (this.gridsLst[col - i][row].type == GridType.Barrier || this.gridsLst[col][row - j].type == GridType.Barrier) {
                                        continue;
                                    }
                                } else {
                                    // 四方形行走
                                    if (Math.abs(i) == Math.abs(j)) {
                                        continue;
                                    }
                                }

                                // 计算g值
                                let g = curGrid.g + parseInt(Math.sqrt(Math.pow(i * 10, 2) + Math.pow(j * 10, 2)).toString());
                                if (this.gridsLst[col][row].g == 0 || this.gridsLst[col][row].g > g) {
                                    this.gridsLst[col][row].g = g;
                                    // 更新父节点
                                    this.gridsLst[col][row].parent = curGrid;
                                }
                                // 计算h值 manhattan估算法
                                this.gridsLst[col][row].h = Math.abs(endPos.x - col) + Math.abs(endPos.y - row);
                                // 更新f值
                                this.gridsLst[col][row].f = this.gridsLst[col][row].g + this.gridsLst[col][row].h;
                                // 如果不在开放列表里则添加到开放列表里
                                if (this.openLst.indexOf(this.gridsLst[col][row]) < 0) {
                                    this.openLst.push(this.gridsLst[col][row]);
                                }
                                // // 重新按照f值排序（升序排列)
                                // this.openList.sort(this._sortFunc);
                            }
                        }
                    }
                }
                // 遍历完四周节点后把当前节点加入关闭列表
                this.closeLst.push(curGrid);
                // 从开放列表把当前节点移除
                this.openLst.splice(this.openLst.indexOf(curGrid), 1);
                if (this.openLst.length <= 0) {
                    console.log("Find path failed.");
                }

                // 重新按照f值排序（升序排列)
                this.openLst.sort(this.SortFunc);
            }
        }
    }

    /**
     * 划线
     * @param col 列
     * @param row 行
     * @param color 颜色
     */
    private Draw(col: any, row: any, color: Color) {
      
        color = color != undefined ? color : Color.GRAY;
        this.map.fillColor = color;
        let posX = 2 + col * (this.gridW + 2);
        let posY = 2 + row * (this.gridH + 2);
        this.map.fillRect(posX, posY, this.gridW, this.gridH);
    }

  
}
