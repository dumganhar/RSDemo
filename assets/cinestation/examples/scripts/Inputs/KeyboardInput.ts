import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, Vec3, Camera, director } from 'cc';
const { ccclass, property } = _decorator;

enum Direction {
    UP = 1 << 0,
    DOWN = 1 << 1,
    LEFT = 1 << 2,
    RIGHT = 1 << 3
}

let __dir = new Vec3();
@ccclass('KeyboardInput')
export class KeyboardInput extends Component {
    private _dir: number = 0;

    public onEnable() {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    public onDisable() {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _onKeyDown(e: EventKeyboard) {
        let dir = this._dir;
        switch (e.keyCode) {
            case KeyCode.KEY_W:
                dir |= Direction.UP;
                break;
            case KeyCode.KEY_S:
                dir |= Direction.DOWN;
                break;
            case KeyCode.KEY_A:
                dir |= Direction.LEFT;
                break;
            case KeyCode.KEY_D:
                dir |= Direction.RIGHT;
                break;
        }
        this._updateDir(dir);
    }

    private _onKeyUp(e: EventKeyboard) {
        let dir = this._dir;
        switch (e.keyCode) {
            case KeyCode.KEY_W:
                dir &= ~Direction.UP;
                break;
            case KeyCode.KEY_S:
                dir &= ~Direction.DOWN;
                break;
            case KeyCode.KEY_A:
                dir &= ~Direction.LEFT;
                break;
            case KeyCode.KEY_D:
                dir &= ~Direction.RIGHT;
                break;
        }
        this._updateDir(dir);
    }


    private _updateDir(dir: number) {
        if (this._dir !== dir) {
            this._dir = dir;


            __dir.set(0, 0, 0);
            if (dir & Direction.UP) {
                __dir.add3f(0, 0, -1);
            }
            if (dir & Direction.DOWN) {
                __dir.add3f(0, 0, 1);
            }
            if (dir & Direction.LEFT) {
                __dir.add3f(-1, 0, 0);
            }
            if (dir & Direction.RIGHT) {
                __dir.add3f(1, 0, 0);
            }

            Vec3.transformQuat(__dir, __dir, Camera.main.node.worldRotation);
            __dir.y = 0;
            __dir.normalize();

            if (dir > 0) {
                director.emit("Keyboard.SetDirection", __dir.normalize());
            }
            else {
                director.emit("Keyboard.SetDirection", null);
            }
        }
    }
}



