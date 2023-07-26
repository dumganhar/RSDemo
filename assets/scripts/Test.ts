import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {

    @property( { type: [Animation] })
    cameraAnims: Animation[] = [];

    @property(Node)
    iconParent: Node;

    start() {

    }

    private resetIconsPosition() {
        const children = this.iconParent.children;
        for (const child of children) {
            const modelNode = child.getChildByName('Sketchfab_model');
            if (modelNode) {
                modelNode.setPosition(0, 0, 0);
            }
        }
    }

    playCameraAnimation() {
        console.log(`play camera animation ...`);
        this.resetIconsPosition();
        for (const anim of this.cameraAnims) {
            anim.stop();
            anim.play();
        }
    }
}

