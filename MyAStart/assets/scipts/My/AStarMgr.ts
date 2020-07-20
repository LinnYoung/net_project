import { _decorator, Component, Node, Vec3, Vec2, animation, Color, GraphicsComponent, renderer, Layers, sliced, math, ContentStrategy, isElementModifier } from 'cc';
import { AStarNode, E_Node_Type, NodeDir } from './AStarNode';
const { ccclass, property } = _decorator;

/// <summary>
/// AStar寻路算法的基本原理就是不停的找自己周围的点，选出一个新的点作为起点再循环的找
/// 1.寻路消耗公式：
///           f(寻路消耗)=g(离起点的距离)+h(离终点的距离)
/// 2.开启列表：
/// 每次从新的点找周围的点时，如果周围的点已经在开启列表或者关闭列表中了，我们就不去管它了
/// 3.关闭列表：
/// 每次往关闭列表中放点时，我们都应该判断这个点是不是和终点一样，如果是一样证明路径找完了，如果不一样，继续找。
/// 4.格子对象的父对象
/// </summary>
@ccclass('AStartMgr')
export class AStarMgr extends Component {

    private static instance: AStarMgr = null;

    public static Instance(): AStarMgr {
        return this.instance;
    }

    /**
     * 寻路损耗 1
     *
     * @private
     * @memberof AStarMgr
     */
    private g1 = 1;

    /**
     * 寻路损耗 1.4
     *
     * @private
     * @memberof AStarMgr
     */
    private g2 = 1.4;

    /**
     * 地图的宽
     */
    private mapW: number;

    /**
     * 地图的高
     */
    private mapH: number;

    /**
     * 地图相关所有的格子对象容器
     */
    public nodes: Array<any> = new Array<any>();

    /**
     * 开启列表(保存已检测到和未到达的点)
     */
    private openLst: Array<any> = new Array<any>();

    /**
     *  关闭列表(保存已到达的点)
     */
    private closeLst: Array<any> = new Array<any>();

    /**
     * 当前节点周围八个点
     *
     * @private
     * @type {Array<any>}
     * @memberof AStarMgr
     */
    private nearLst: Array<any> = new Array<any>(8);

    /**
     * 路径
     */
    private path: Array<any> = new Array<any>();

    /**
     * 是否是八方向行走
     *
     * @private
     * @type {boolean}
     * @memberof AStarMgr
     */
    private isEightTrans: boolean = false;

    private justTop: AStarNode = null;
    private justLeft: AStarNode = null;
    private justRight: AStarNode = null;
    private justDown: AStarNode = null;
    private leftToTop: AStarNode = null;
    private rightToTop: AStarNode = null;
    private leftToDown: AStarNode = null;
    private rightToDown: AStarNode = null;


    /**
     * 被追寻者是否改变了位置
     *
     * @type {boolean}
     * @memberof AStarMgr
     */
    public isChangeTrans: boolean = false;

    constructor() {
        super();
        AStarMgr.instance = this;
    }

    public Init() {
        //AStarMgr.instance=this;
        console.log("AStarMgr Init...");
    }

    public update() {
        this.UpdateAStar();
    }

    /**
     * 更新AStar  寻路路径
     */
    public UpdateAStar() {
        let self = this;

        //如果找到了目标
        //只是暂时停止寻路
        //如果角色没有死亡，当玩家位置改变时，重新寻路
        //解决方法，定时检测，触发检测
        if (self.isChangeTrans != false) {
            //self.FindPath();
        }

        //console.log("Update AStar Path finding ...")
    }

    /**
     * 初始化地图
     * @param w 地图的宽
     * @param h 地图的高
     */
    public InitMapInfo(w, h) {
        //根据宽高 创建格子 阻挡的问题 我们可以随机阻挡
        //因为我们现在没有地图相关的数据
        let self = this;

        //记录宽高
        self.mapW = w;
        self.mapH = h;

        //声明容器可以装多少个格子
        //self.nodes= new AStarNode[w][h];

        //生成格子
        for (let i: number = 0; i < w; ++i) {
            //console.log("self.nodes.length:" + self.nodes.length);
            self.nodes[i] = [];
            for (let j: number = 0; j < h; ++j) {
                //用三目运算符随机生成阻挡格子
                //应该从地图配置表读取生成的
                //let nodeObj: AStarNode = new AStarNode(i, j, (self.RandomNum(0, 100) < 20 ? E_Node_Type.Stop : E_Node_Type.Walk));
                let nodeObj: AStarNode = new AStarNode(i, j, E_Node_Type.Walk);
                self.nodes[i][j] = nodeObj;
            }
        }

        //测试用的 
        self.nodes[0][0].type = E_Node_Type.Stop;
        self.nodes[1][0].type = E_Node_Type.Stop;
        self.nodes[4][0].type = E_Node_Type.Stop;
        //self.nodes[3][2].type = E_Node_Type.Stop;//测试对角是阻挡时取消注释这句
        self.nodes[4][2].type = E_Node_Type.Stop;
        self.nodes[1][4].type = E_Node_Type.Stop;
        self.nodes[2][3].type = E_Node_Type.Stop;
        self.nodes[2][4].type = E_Node_Type.Stop;

        //剔除不必要的点
        //self.WayPathMemory();
    }

    /**
     * 寻路时产生的记忆
     * 或者说生成地图时，存入不可穿越的点
     * 用于优化AStar
     * @memberof AStarMgr
     */
    public WayPathMemory() {
        //地图数据是一定的
        //所以阻挡点也是一定的
        let self = this;

        //可能多此一举
        self.nodes.forEach(element => {
            let tempNode = element as AStarNode;
            if (tempNode.type == E_Node_Type.Stop) {
                delete self.nodes[tempNode.x][tempNode.y];
                //self.nodes.filter(tempNode => tempNode !== self.nodes);
                console.log("Remove element at self.nodes")
            }
        });

        console.log("WayPath memory is save...");
    }

    /**
     * 寻路方法
     * @param startPos 开始点
     * @param endPos 结束点
     */
    public FindPath(startPos: Vec2, endPos: Vec2) {

        console.log("StartPos is:" + startPos + " " + "EndPos is:" + endPos);
        let self = this;
        //实际项目中 传入的点往往是 坐标系中的点
        //我们这里省略换算的步骤 直接认为它是传进来的格子坐标

        //首先判断 传入的两个点 是否合法
        //1.首先 要在地图范围内
        //如果不合法 应该直接 返回null 意味着不能寻路
        if (startPos.x < 0 || startPos.x >= self.mapW ||
            startPos.y < 0 || startPos.y >= self.mapH ||
            endPos.x < 0 || endPos.x >= self.mapW ||
            endPos.y < 0 || endPos.y >= self.mapH) {
            console.log("Start or end points are outside the map grid");
            return null;
        }
        //2.要不是阻挡
        //得到起点和终点  对应的格子
        let start: AStarNode = self.nodes[startPos.x][startPos.y];
        let end: AStarNode = self.nodes[endPos.x][endPos.y];

        if (start.type == E_Node_Type.Stop || end.type == E_Node_Type.Stop) {
            console.log("The start or end point is the block");
            return null;
        }

        //清空上一次相关的数据 避免他们影响  这一次的寻路计算

        //清空关闭和开启列表
        self.closeLst = [];
        self.openLst = [];

        //把开始点放入关闭列表中
        start.father = null;
        start.f = 0;
        start.g = 0;
        start.h = 0;
        self.closeLst.push(start);

        while (true) {
            self.nearLst = [];
            //存储周围8个点
            self.JustPassPath(start, end);

            //死路判断  开启列表为空 都还没有找到终点 就认为是死路
            if (self.openLst.length == 0) {
                console.log("Blind alley...");
                return null;
            }

            //选出开启列表中 寻路消耗最小的点
            self.openLst.sort(self.SortOpenLst);

            //console.log("****************");
            /*for (let i = 0; i < self.openLst.length; ++i) {
                 let targetNode = self.openLst[i];
                 //console.log("Point:" + targetNode.x + " ," + targetNode.y + "  :g=" + targetNode.g + "  h=" + targetNode.h + "  f=" + targetNode.f);
             }*/

            //放入关闭列表中 然后再从开启列表中移除
            self.closeLst.push(self.openLst[0]);
            //找得这个点 又变成新的起点 进入下一次寻路计算了
            start = self.openLst[0];
            self.openLst.shift();
            //如果这个点已经是终点 那么得到最终结果返回出去
            //如果这个点 不是终点 那么继续寻路
            if (start == end) {
                //找完了 找到路径
                //返回路径
                self.path = [];
                self.path.push(end);
                //father是空时是找到start点，start点的father就是空
                while (end.father != null) {
                    self.path.push(end.father);
                    end = end.father;
                }

                //列表翻正得到正确的路径
                self.path.reverse();
                return self.path;
            }
        }
    }

    /**
     * 排序函数
     * @param a
     * @param b
     */
    private SortOpenLst(a, b): any {
        if (a.f > b.f)
            return 1;
        else if (a.f == b.f)
            return 1;
        else
            return -1;
    }


    private JustPassPath(start: AStarNode, end: AStarNode) {
        let self = this;
        //拿到各个节点
        //正上
        self.justTop = self.GetAStarNode(start.x, start.y + 1, self.g1);
        //正左
        self.justLeft = self.GetAStarNode(start.x - 1, start.y, self.g1);
        //正右
        self.justRight = self.GetAStarNode(start.x + 1, start.y, self.g1);
        //正下
        self.justDown = self.GetAStarNode(start.x, start.y - 1, self.g1);
        //左上
        self.leftToTop = self.GetAStarNode(start.x - 1, start.y + 1, self.g2);
        //左下
        self.leftToDown = self.GetAStarNode(start.x - 1, start.y - 1, self.g2);
        //右上
        self.rightToTop = self.GetAStarNode(start.x + 1, start.y + 1, self.g2);
        //右下
        self.rightToDown = self.GetAStarNode(start.x + 1, start.y - 1, self.g2);

        //从起点开始 找周围的点 并放入邻近列表中
        if (self.leftToTop != null && (self.justTop.type == E_Node_Type.Stop || self.justLeft.type == E_Node_Type.Stop)) {
            //移除左上
            self.leftToTop = null;
        }
        if (self.rightToTop != null && (self.justTop.type == E_Node_Type.Stop || self.justRight.type == E_Node_Type.Stop)) {
            //移除右上
            self.rightToTop = null;
        }
        if (self.leftToDown != null && (self.justDown.type == E_Node_Type.Stop || self.justLeft.type == E_Node_Type.Stop)) {
            //移除左下
            self.leftToDown = null;
        }
        if (self.rightToDown != null && (self.justDown.type == E_Node_Type.Stop || self.justRight.type == E_Node_Type.Stop)) {
            //移除右下
            self.rightToDown = null;
        }

        //把不为空的邻近点添加进列表
        self.AddNearLst(self.justTop);
        self.AddNearLst(self.justDown);
        self.AddNearLst(self.justLeft);
        self.AddNearLst(self.justRight);
        self.AddNearLst(self.leftToTop);
        self.AddNearLst(self.leftToDown);
        self.AddNearLst(self.rightToTop);
        self.AddNearLst(self.rightToDown);

        //Debug.Log("数组长度：" + nearLst.Count);
        //把符合条件的点放入开启列表
        for (let i = 0; i < self.nearLst.length; i++) {
            //Debug.Log("当前遍历哪个数组：" + i);
            self.FindNearlyNodeToOpenLst(self.nearLst[i], start, end);
            //Debug.Log("开启列表中有哪些数据：" + openLst[i].ToString());
        }
    }

    /**
     *  把临近的点放入开启列表中的函数
     * @param x X坐标
     * @param y Y坐标
     * @param g 寻路损耗
     * @param father 父节点
     * @param end
     */
    private FindNearlyNodeToOpenLst(tempNode: AStarNode, father: AStarNode, end: AStarNode) {
        let self = this;

        //判断这些点 是否是边界 是否是阻挡 是否在开启或者关闭列表 如果都不是 才放入开启列表
        if (tempNode == null ||
            tempNode.type == E_Node_Type.Stop)
            return;
        if (self.IsInArray(self.closeLst, tempNode) ||
            self.IsInArray(self.openLst, tempNode)) {
        }
        else {
            //计算f值
            //f=g+h
            //记录父对象
            tempNode.father = father;
            //如果通过了上面的合法验证 存放到开启列表中
            self.openLst.push(tempNode);
        }
        //计算g  我离起点的距离  就是我父节点离起点的距离 +我离我父节点的距离
        tempNode.g = father.g + tempNode.g;
        //曼哈顿街区算法（这个算法有错）斜向或者任意方向不能用它 
        // tempNode.h = Math.abs(end.x - tempNode.x) + Math.abs(end.y - tempNode.y)
        //欧几里得距离公式适用于各个角度，但Astar算法八方向以上的寻路就没有必要了
        //let v1: Vec2 = new Vec2(Math.abs(end.x - tempNode.x), Math.abs(end.y - tempNode.y));
        //let v2: Vec2 = new Vec2(0, 0);
        //tempNode.h= Vec2.distance(v1, v2);
        //tempNode.h = Vec2.distance(tempNode, end);
         tempNode.h = Vec2.distance(end, tempNode);
        //tempNode.h = Vec2.distance(new Vec2(end.x,end.y),new Vec2(tempNode.x,tempNode.y));//为什么只有这样才可以？
        //tempNode.h = Vec2.distance(new Vec2(tempNode.x, tempNode.y), new Vec2(end.x, end.y));
        /*let dx=Math.abs(end.x-tempNode.x);
        let dy=Math.abs(end.y-tempNode.y);
        tempNode.g=1.4*Math.sqrt(dx*dx+dy*dy);*/

        tempNode.f = tempNode.g + tempNode.h;
        console.log("tempNode is:" + tempNode.x + "," + tempNode.y);
    }

    /**
     *  获取邻近节点
     * @param x 
     * @param y 
     * @param g 
     */
    private GetAStarNode(x, y, g): AStarNode {
        let self = this;
        if (x < 0 || x >= self.mapW) return null;
        if (y < 0 || y >= self.mapH) return null;
        //在范围内 再去取点
        let node: AStarNode = self.nodes[x][y] as AStarNode;
        node.g = g;
        return node;
    }

    /**
     * 添加进邻近列表
     * @param node
     */
    private AddNearLst(node: AStarNode) {
        let self = this;
        console.log("self.nearLst.includes(node) is:" + self.nearLst.includes(node));
        if (node != null && self.IsInArray(self.nearLst, node) == false) {
            self.nearLst.push(node);
        }
    }


    /**
     * 是否在数组里
     * @param arr
     * @param target
     */
    private IsInArray(arr: Array<any>, target): boolean {
        let isExit: boolean = false;
        arr.find(function (val) {
            if (val == target)
                return isExit = true;
        })
        return isExit;
    }

    /**
     * 生成随机数
     * @param min 最小值
     * @param max 最大值
     */
    private RandomNum(min: number, max): number {
        switch (arguments.length) {
            case 1:
                return parseInt((Math.random() * min + 1).toString(), 10)
                break;
            case 2:
                return parseInt((Math.random() * (max - min + 1) + min).toString(), 10);
                break;
            default:
                return 0;
                break;
        }
    }

    /**
     * 获取玩家所在的格子
     * @param pos1 玩家二维坐标
     * @param pos2 追寻者二维坐标
     */
    public GetPlayerGrid(pos1: Vec2, pos2: Vec2): AStarNode {
        let self = this;
        //通过pos去查找Grid
        //首先Grid不一定与玩家坐标对应
        //但与玩家周围的格子相邻
        //传进的坐标是Vec2，这意味着玩家Vec3坐标剔除Y坐标
        console.log("What about pos is:" + pos1);

        //可以采用碰撞检测，但那太耗性能
        let minDis = 0;
        let isCalDisFrist = true;

        let targetPosArr: Array<Vec2> = [];
        let targetPos: Vec2 = Vec2.ZERO;

        //以玩家为中心，获取周围8个点或者any
        let nearGridLst = self.CetGridLstByPlayerPos(pos1);
        nearGridLst.forEach(element => {
            let tempGrid: AStarNode = element as AStarNode;

            //计算两点距离
            let v2: Vec2 = new Vec2(tempGrid.x, tempGrid.y);
            console.log("What about v2 is:" + v2.toString())
            let curDis: number = self.CalDistance(pos1, v2);
            console.log("CurDis is:" + curDis);
            //循环检测获得最短的那个点
            if (isCalDisFrist == false) {
                if (curDis < minDis) {
                    minDis = curDis;
                    //距离最短的点可能有多个
                    targetPosArr.push(v2);
                    console.log("Push element to targetPosArr...");
                }
                //会出现两种情况：
                //1.在格子里
                //2.在两个格子边界中
            }
            else {
                //一般来讲，两点不重合的话，距离是大于零的
                //这里用于第一次赋值minDis
                minDis = curDis;
                //第一次赋值时，也应该push
                targetPosArr.push(v2);
                console.log("Push element to targetPosArr in frist...")
            }
        });
        //距离最短可能有多个点，我们只取与追捕者视线一致的点
        //这个想法可能也是错的
        //因为有阻挡区域
        let isCalAngleFrist = true;
        let minAngle = 0;
        //计算角度
        targetPosArr.forEach(element => {
            let tempVec2: Vec2 = element;

            //拿到最小角度
            //会不会有问题？正负弧度应该不会出现
            let curAngle = self.CalAngle(tempVec2, pos2);
            console.log("What about curAngle is:" + curAngle);
            if (isCalAngleFrist == false) {
                if (curAngle < minAngle) {
                    minAngle = curAngle;
                    targetPos = tempVec2;
                    console.log("What about minAngle is:" + minAngle)
                }
            }
            else {
                minAngle = curAngle;
                targetPos = tempVec2;
            }
        });

        //最后根据点拿到对应的AStarNode
        let targetPlayerNode: AStarNode = self.nodes[targetPos.x][targetPos.y];
        return targetPlayerNode;
    }

    /**
     *  计算两点之间的角度
     * @param v1
     * @param v2
     */
    private CalAngle(v1: Vec2, v2: Vec2): any {
        let angle = Vec2.angle(v1, v2);
        console.log("The angle is:" + angle);
        let eurgle = angle * (360 / Math.PI);
        console.log("The eurgle is:" + eurgle);
        return angle;
    }

    /**
     * 获取以玩家为中心，周围8个点或三个点或两个点或一个点????
     * @param p1 玩家节点
     */
    private CetGridLstByPlayerPos(p1: Vec2): Array<any> {
        let self = this;

        //首先划分格子大小一定要有序并且适当、无小数
        //例如：10*10的地图，长度为10宽度也为10，（0，0）（0，1）（0，2）...
        //这样做的好处就是能使问题简单化

        //其次，玩家不可能身处阻挡区域

        //对p1的X,Y分别四舍五入
        //规整化
        let targerX = Math.round(p1.x);
        let targerY = Math.round(p1.y);

        let pos: Vec2 = new Vec2(targerX, targerY);
        //获取玩家为中心8个点或一个点
        let targetNodeLst: Array<any> = new Array<any>();
        let tempGrid = null;

        //#region 如果玩家位于边界
        //如果玩家位于边界
        //只需取一点
        //可能位于两点之间
        //最终是哪一点取决于四舍五入的结果
        if (self.IsAtBound(pos) == true) {
            targetNodeLst.push(pos);
            console.log("Pos is at bound")
        }
        //#endregion

        //#region  如果玩家不位于边界

        else {
            //左上  x-1 y-1
            tempGrid = self.nodes[targerX - 1][targerY + 1];
            targetNodeLst.push(tempGrid);

            //上 x  y-1
            tempGrid = self.nodes[targerX][targerY + 1];
            targetNodeLst.push(tempGrid);

            //右上  x+1 y-1
            tempGrid = self.nodes[targerX + 1][targerY + 1];
            targetNodeLst.push(tempGrid);

            //左 x-1 y
            tempGrid = self.nodes[targerX - 1][targerY];
            targetNodeLst.push(tempGrid);

            //右 x+1 y
            tempGrid = self.nodes[targerX + 1][targerY];
            targetNodeLst.push(tempGrid);

            //左下 x-1 y+1
            tempGrid = self.nodes[targerX - 1][targerY - 1];
            targetNodeLst.push(tempGrid);

            //下 x y+1
            tempGrid = self.nodes[targerX][targerY - 1];
            targetNodeLst.push(tempGrid);

            //右下 x+1 y+1
            tempGrid = self.nodes[targerX + 1][targerY - 1];
            targetNodeLst.push(tempGrid);
            console.log("GetGridLstByPlayerPos return lst:" + targetNodeLst[0]);
        }
        return targetNodeLst;
        //#endregion
    }

    /**
     *  删除指定元素
     * @param arr
     * @param target
     */
    private DelteArray(arr: Array<any>, target) {
        let self = this;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                arr.splice(target, 1);
            }
        }
    }

    /**
     * 是否在边界/是否接近边界
     * @param pos 传入规整化的坐标
     */
    private IsAtBound(pos: Vec2): boolean {
        let isAtBound: boolean = false;
        //边界判断
        if (pos.x < 0 || pos.y >= self.mapW ||
            pos.x < 0 || pos.y >= self.mapH)
            isAtBound = true;
        return isAtBound;
    }

    /**
     * 计算两点之间的距离
     * @param v1 起点 (玩家二维坐标)
     * @param v2 终点 (nodes里的点)
     */
    private CalDistance(v1: Vec2, v2: Vec2): number {
        let disVal = Vec2.distance(v1, v2);
        console.log("CalDistance's value is:" + disVal);
        return disVal;
    }
}
