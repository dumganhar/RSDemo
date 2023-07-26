import { isValid, Quat, Vec3 } from "cc";
import { Vec4_closeTo } from "../Common/Math";
import { IVCam } from "../Datas/IVCam";
import { CameraHandler } from "./CameraHandler";

let __worldPos = new Vec3();
let __rotation = new Quat();

export class HardLookAtHandler extends CameraHandler<IVCam> {

    public updateCamera(deltaTime: number) {
        let vcam = this._vcam;
        if (isValid(vcam.lookAt)) {
            Vec3.add(__worldPos, vcam.lookAt.position, vcam.aim.trackedObjectOffset);
            if (vcam.lookAt.parent) {
                __worldPos.add(vcam.lookAt.parent.worldPosition);
            }
            vcam.lookaheadPosition.set(__worldPos);
            Quat.fromViewUp(__rotation, Vec3.subtract(__worldPos, vcam.node.worldPosition, __worldPos).normalize());
            if (!Vec4_closeTo(__rotation, vcam.node.worldRotation)) {
                vcam.node.worldRotation = __rotation;
            }
        }
    }
}