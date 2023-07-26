import { Enum, Vec3, _decorator } from "cc";
import { VCamComposer } from "./VCamComposer";
import { VCamHardLook } from "./VCamHardLook";
const { ccclass, property } = _decorator;

export enum AimType {
    None = 0,
    Composer = 1,
    HardLookAt = 2,
}

@ccclass("VCamAim")
export class VCamAim {

    @property({ type: Enum(AimType) })
    type: AimType = AimType.Composer;

    @property({
        tooltip: "从LookAt目标的中心作局部空间的位置偏移。 \n所需区域不是跟踪目标的中心时，微调跟踪目标的位置",
    })
    trackedObjectOffset: Vec3 = new Vec3();

    @property({ type: VCamComposer, visible() { return this.type === AimType.Composer } })
    composer: VCamComposer = new VCamComposer();
}