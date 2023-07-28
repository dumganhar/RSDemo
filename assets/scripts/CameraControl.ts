import { Vec3, Animation } from 'cc';
import { _decorator, Component, input, Input, log, EventAcceleration, Node } from 'cc';
import { VirtualCamera } from '../cinestation/runtime/VirtualCamera';
import { BodyType } from '../cinestation/runtime/Datas/VCamBody';
import { tween } from 'cc';
import { Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraControl')
export class CameraControl extends Component {
    private _counter = 0;

    private _virtualCamera: VirtualCamera;
    private _tmpPosition: Vec3 = new Vec3();
    private _vCameraOriginalPos: Vec3 = new Vec3(0, 1.9, 1.3);
    private _ready = false;
    private _currentTween: Tween<Node> | null = null;

    onLoad() {
        this._virtualCamera = this.getComponent(VirtualCamera);
        this.subscribeAcc();
        const animComp = this.getComponent(Animation);
        animComp.on(Animation.EventType.PAUSE, () => this._ready = false);
        animComp.on(Animation.EventType.PLAY, () => this._ready = false);
        animComp.on(Animation.EventType.STOP, () => this._ready = false);
        animComp.on(Animation.EventType.RESUME, () => this._ready = false);
        animComp.on(Animation.EventType.FINISHED, ()=>{
            // this.node.getPosition(this._vCameraOriginalPos);
            console.log(`vCamera end position: x: ${this._vCameraOriginalPos.x}, y: ${this._vCameraOriginalPos.y}, z: ${this._vCameraOriginalPos.z}`)
            this._ready = true;
        });
    }

    onDestroy() {
        input.off(Input.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    subscribeAcc() {
        input.setAccelerometerEnabled(true); 
        input.setAccelerometerInterval(50);
        input.on(Input.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    onDeviceMotionEvent (event: EventAcceleration) {
        if (!this._ready || this._virtualCamera.body.type === BodyType.Tracked) {
            return;
        }

        this._counter++;
        // if (this._counter % 10 === 0) {
        //     log('x: ' + event.acc.x + ", y: " + event.acc.y + ', z: ' + event.acc.z);
        // }
        const ACC_VALUE_SCALE = 0.1;
        Vec3.copy(this._tmpPosition, this._vCameraOriginalPos);
        this._tmpPosition.x += event.acc.x * ACC_VALUE_SCALE;
        this._tmpPosition.y += event.acc.y * ACC_VALUE_SCALE;
        // this._virtualCamera.node.setPosition(this._tmpPosition);
        if (this._currentTween) {
            this._currentTween.stop();
        }
        this._currentTween = this.animateTo(this._virtualCamera.node, this._tmpPosition);
    }

    private animateTo(node: Node, pos: Vec3): Tween<Node> {
        let tweenDuration: number = 0.16;
        const r = tween(node)
            .to(tweenDuration, { position: pos }, {
                easing: "linear",
            })
            .start();
        return r;
    }
}

