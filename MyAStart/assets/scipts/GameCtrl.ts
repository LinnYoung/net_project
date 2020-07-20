import { _decorator, Component, Node } from 'cc';
import { AStar } from './AStar';
const { ccclass, property } = _decorator;

@ccclass('GridCtrl')
export class GamdCtrl extends Component {

  start() {

  }

  public OnBtnRestart() {
    this.node.getComponent(AStar).InitMap();
  }


  public OnCheck(toggle, v) {
    if (v == 8) {
      this.node.getComponent(AStar).is8dir = toggle.isChecked;
    } else {
      this.node.getComponent(AStar).is8dir = !toggle.isChecked;
    }
  }


}
