import { Camera, Canvas, game, Light } from "cc";

declare module "cc" {
    export namespace Camera {
        let main: Camera;
    }

    export namespace Light {
        let main: Light;
    }
}

const Camera_prototype = Camera.prototype as any;
let Camera_onEnable = Camera_prototype.onEnable;
Camera_prototype.onEnable = function () {
    Camera_onEnable.call(this);
    if (CC_EDITOR) {
        return;
    }
    if (this.node.name === "Main Camera") {
        Camera.main = this;
    }
}

const Light_prototype = Light.prototype as any;
let Light_onEnable = Light_prototype.onEnable;
Light_prototype.onEnable = function () {
    Light_onEnable.call(this);
    if (CC_EDITOR) {
        return;
    }
    if (this.node.name === "Main Light") {
        Light.main = this;
    }
}