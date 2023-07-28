import { _decorator, native, find, Node } from 'cc';
import { JSB } from 'cc/env';
import { carBridge } from './CocosCarBridge';
import { Test } from '../Test';

const bridge = native.bridge;

export type OnOpenDoorListener = (ret: boolean) => void;
export type OnHelloNativeListener = (strArg: string, binArg: Uint8Array) => void;
export type OnCommonNativeListener = (strArg: string, binArg: Uint8Array) => void;

/**
 * 车机业务封装类
 */
export class CocosCarApiImpl {
    constructor () {
        if (JSB) {
            bridge.onNativeEvent = this.onNativeEvent.bind(this);
        }
    }

    // 监听 java 层（app 层）发过来的事件，即 Java 层通过 CocosCarApi.callScript 触发到 TS 层的回调
    private onNativeEvent (eventName: string, strArg: string | null, binArg: Uint8Array | null, tag: bigint) {
        console.log(`[API] onNativeEvent: eventName=${eventName}, strArg=${strArg}, binArg=${binArg}, tag=${tag}`);
        switch (eventName) {
        case 'getCarModelInfo': {
            carBridge.returnToNative(JSON.stringify({ submeshCount: 1234 }), null, tag);
            break;
        }
        case 'helloScript': {
            carBridge.returnToNative('STRING RETURN TO NATIVE', new Uint8Array([100, 200, 222, 234]), tag);
            break;
        }
        case 'carModelPlayAnimation': {
            console.log(`[API] carModelPlayAnimation: strArg=${strArg}, binArg=${binArg}, tag=${tag}`);
            break;
        }
        case 'unlockScreen': {
            this.unlockScreen();
            break;
        }
        default:
            break;
        }
    }

    private unlockScreen(): void {
        const canvas: Node = find('Canvas');
        canvas.getComponent(Test).playCameraAnimation();
    }

    /**
     * 打开车门范例
     * @param doorId 车门 ID
     * @param listener 车门打开成功回调
     */
    openDoor (doorId: number, listener: OnOpenDoorListener): void {
        console.log(`[API] openDoor: doorId=${doorId}`);
        carBridge.callNative('openDoor', JSON.stringify({ doorId }), null, (strArg: string | null, binArg: Uint8Array | null) => {
            const obj = JSON.parse(strArg);
            listener(!!obj.ret);
        });
    }

    /**
     * Hello native 示例
     * @param strArg 字符串参数
     * @param binArg 二进制参数
     * @param listener 从 Native (Java) 返回的数据回调
     */
    helloNative (strArg: string, binArg: Uint8Array, listener: OnHelloNativeListener) {
        console.log(`[API] helloNative: strArg=${strArg}, binArg=${binArg}`);
        carBridge.callNative('helloNative', strArg, binArg, (rStrArg: string | null, rBinArg: Uint8Array | null) => {
            listener(rStrArg, rBinArg);
        });
    }

    /**
     * 向特定 UUID 的客户端发送定向事件
     * @param strArg 字符串参数
     * @param binArg 二进制参数
     * @param listener 从 Native (Java) 返回的数据回调
     */
    testSendEventByUuid (strArg: string, binArg: Uint8Array, listener: OnCommonNativeListener) {
        console.log(`[API] testSendEventByUuid: strArg=${strArg}, binArg=${binArg}`);
        carBridge.callNative('testSendEventByUuid', strArg, binArg, (rStrArg: string | null, rBinArg: Uint8Array | null) => {
            listener(rStrArg, rBinArg);
        });
    }
}

export const carApi = new CocosCarApiImpl();
