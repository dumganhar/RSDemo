import { _decorator, Component, Node, Animation, find, profiler } from 'cc';
import { VirtualCamera } from '../cinestation/runtime/VirtualCamera';
import { BodyType, VCamBody } from '../cinestation/runtime/Datas/VCamBody';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {

    @property(VirtualCamera)
    vCamera: VirtualCamera;

    @property(Node)
    iconParent: Node;

    private _anim: Animation;

    start() {
        this.resetIconsPosition();
        this._anim = this.vCamera.getComponent(Animation);

        // profiler.hideStats();
    }

    private resetIconsPosition() {
        const children = this.iconParent.children;
        for (const child of children) {
            child.active = false;
            const modelNode = child.getChildByName('Sketchfab_model');
            if (modelNode) {
                modelNode.setPosition(0, 0, 0);
            }
        }
    }

    playCameraAnimation() {
        console.log(`play camera animation ...`);
        this.vCamera.body.type = BodyType.Tracked;
        this._anim.play();
        this._anim.on(Animation.EventType.FINISHED, ()=>{
            this.vCamera.body.type = BodyType.None;
        });
    }

    reset() {
        this.resetIconsPosition();
        this._anim.stop();
        this.vCamera.body.type = BodyType.Tracked;
        this.vCamera.body.tracked.progress = 0;
    }
}

