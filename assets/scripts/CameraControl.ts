import { _decorator, Component, input, Input, log, EventAcceleration, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraControl')
export class CameraControl extends Component {
    private _counter = 0;

    @property(Node)
    cameraNode: Node;

    onLoad() {
        input.setAccelerometerEnabled(true); 
        input.on(Input.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    onDestroy() {
        input.off(Input.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
    }

    onDeviceMotionEvent (event: EventAcceleration) {
        this._counter++;
        if (this._counter % 10 === 0) {
            log('x: ' + event.acc.x + ", y: " + event.acc.y + ', z: ' + event.acc.z);
        }
    }
}

