import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('IconAnimTrigger')
export class IconAnimTrigger extends Component {

    @property(Node)
    iconParent: Node;

    start() {
    }

    onPlayIconAnimation() {
        const children = this.iconParent.children;
        let delayToPlay = 0;
        for (const child of children) {
            delayToPlay += 0.05;
            this.scheduleOnce(()=>{
                const modelNode = child.getChildByName('Sketchfab_model');
                if (modelNode) {
                    modelNode.getComponent(Animation).play();
                }
            }, delayToPlay);
        }
    }
}

