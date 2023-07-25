import { _decorator, Component, ImageAsset, MeshRenderer, Node, Texture2D } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Icon')
@executeInEditMode
export class Icon extends Component {

    @property(Texture2D)
    private _iconTexture: Texture2D;

    @property(Texture2D)
    get iconTexture(): Texture2D {
        return this._iconTexture;
    }

    set iconTexture(icon: Texture2D) {
        console.log(`set iconTexture: ${icon}`);
        this._iconTexture = icon;
        this.updateIcon(this._iconTexture);
    }

    private updateIcon(icon: Texture2D) {
        if (!icon) {
            return;
        }
        const material = this.getComponent(MeshRenderer).materials[0];
        material.setProperty("mainTexture", icon);
    }

    onLoad() {
        this.updateIcon(this._iconTexture);
    }
}

