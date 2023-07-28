import { geometry } from 'cc';
import { PhysicsSystem } from 'cc';
import { BoxCollider } from 'cc';
import { tween } from 'cc';
import { Vec3 } from 'cc';
import { Collider } from 'cc';
import { Camera } from 'cc';
import { Vec2 } from 'cc';
import { _decorator, Component, Node, input, Input, EventTouch } from 'cc';
const { ccclass, property } = _decorator;


const DEFAULT_ICON_Z = -8.279881;

@ccclass('IconTouchControl')
export class IconTouchControl extends Component {
    private _icons: Node[];
    private _hitNodeIndex = -1;

    @property(Camera)
    camera: Camera;

    onLoad () {
        this._icons = this.node.children;
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDestroy () {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart(event: EventTouch) {
        this._hitNodeIndex = this.rayTest(event.getLocation(), true);
    }

    onTouchMove(event: EventTouch) {
        // console.log(event.getLocation());  // Location on screen space
        // console.log(event.getUILocation());  // Location on UI space
    }
    
    onTouchEnd(event: EventTouch) {
        if (this._hitNodeIndex !== -1) {
            const animateNode = this._icons[this._hitNodeIndex].getChildByName('Sketchfab_model');
            this.playIconUpAnimation(animateNode);
            this._hitNodeIndex = -1;
        }
    }

    onTouchCancel(event: EventTouch) {
        // console.log(event.getLocation());  // Location on screen space
        // console.log(event.getUILocation());  // Location on UI space
        // this.rayTest(event.getLocation(), false);
        this.onTouchEnd(event);
    }

    private rayTest(point: Vec2, isDown: boolean) {
        let ray = new geometry.Ray();
        this.camera.screenPointToRay(point.x, point.y, ray);
        // 以下参数可选
        const mask = 0xffffffff;
        const maxDistance = 10000000;
        const queryTrigger = true;

        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            console.log(`hit...`);
            const raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = raycastClosestResult.hitPoint
            const hitNormal = raycastClosestResult.hitNormal;
            const collider = raycastClosestResult.collider;
            const distance = raycastClosestResult.distance;

            const hitNodeIndex = this.getHitNode(collider);
            if (hitNodeIndex !== -1) {
                const hitNode = this._icons[hitNodeIndex];
                const animateNode = hitNode.getChildByName('Sketchfab_model');
                if (isDown) {
                    this.playIconDownAnimation(animateNode);
                } else {
                    this.playIconUpAnimation(animateNode);
                }
            }
            return hitNodeIndex;
        }
        return -1;
    }

    private getHitNode(collider: Collider): number {
        for (let i = 0; i < this._icons.length; ++i) {
            const icon = this._icons[i];
            const obj = icon.getChildByPath('Sketchfab_model/root/GLTF_SceneRootNode/Icosphere_0/Object_4');
            const boxCollider = obj.getComponent(BoxCollider);
            if (boxCollider === collider) {
                return i;
            }
        }
        return -1;
    }

    private playIconDownAnimation(node: Node) {
        let newPos = node.position.clone();
        newPos.z = DEFAULT_ICON_Z + 0.5;
        this.animateTo(node, newPos);
    }

    private playIconUpAnimation(node: Node) {
        let newPos = node.position.clone();
        newPos.z = DEFAULT_ICON_Z;
        this.animateTo(node, newPos);
    }

    private animateTo(node: Node, pos: Vec3) {
        let tweenDuration: number = 0.2;
        tween(node)
            .to(tweenDuration, { position: pos }, {
                easing: "linear",
            })
            .start();
    }
}

