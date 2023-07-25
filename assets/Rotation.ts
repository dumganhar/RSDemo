import { _decorator, Component, director, Node, SceneGlobals, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Rotation')
export class Rotation extends Component {
    @property({type: Node})
    lightPlane: Node;

    @property
    step = 0.1;
    
    globals: SceneGlobals;
    lightAngle: Vec3 = new Vec3(0, 0, 0);

    start() {
        this.globals = director.getScene().globals;
        this.schedule(this.updateRotation, 0.1);
    }

    updateRotation() {
        this.globals.skybox.rotationAngle = (this.globals.skybox.rotationAngle + this.step) % 360;
        this.lightAngle.y = (this.lightAngle.y + this.step) % 360;
        this.lightPlane.eulerAngles = this.lightAngle;
    }
}

