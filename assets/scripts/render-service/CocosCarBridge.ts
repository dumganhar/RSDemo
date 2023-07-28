import { _decorator, native } from 'cc';
import { JSB } from 'cc/env';

const win = globalThis as any;
const jsb = (win.jsb ? win.jsb : {});
const bridge = native.bridge;

type OnNativeReturnListener = (strArg: string | null, binArg: Uint8Array | null) => void;

const tagListenerMap = new Map<bigint, OnNativeReturnListener>();
let pid = BigInt(0);
if (jsb.process) {
    pid = BigInt(jsb.process.pid);
}

const pidLeftShiftBits = BigInt(32);
const idLow32BitMask = BigInt(0xFFFFFFFF);

// 获取系统级的唯一 ID，通过 32 位的进程 ID 与 32 位的索引组成 64 位 bigint 类型，对应 Java 的 long 类型
function getUniqueEventId (): bigint {
    let idCounter = 0;
    return (() => (pid << pidLeftShiftBits) | (BigInt(++idCounter) & idLow32BitMask))();
}

/**
 * 用于车机的数据通信类
 */
export class CocosCarBridge {
    constructor () {
        if (JSB) {
            bridge.onNativeReturn = this.onNativeReturn.bind(this);
        }
    }

    /**
     * 调用原生（Java）功能
     * @param eventName 事件名称，跟业务相关，比如 'openDoor'
     * @param strArg 字符串参数列表，如果需要多个参数，建议使用 JSON 格式的字符串
     * @param binArg 二进制参数
     * @param listener 原生 (Java) 返回结果的回调函数
     */
    callNative (eventName: string, strArg: string | null, binArg: Uint8Array | null, listener: OnNativeReturnListener): void {
        if (JSB) {
            let tag = BigInt(0);
            if (listener) {
                tag = getUniqueEventId();
                tagListenerMap.set(tag, listener);
            }
            bridge.sendToNative(eventName, strArg, binArg, tag);
        }
    }

    /**
     * 返回数据给原生层（Java）
     * @param strArg 字符串参数列表，如果需要多个参数，建议使用 JSON 格式的字符串
     * @param binArg 二进制参数
     * @param tag 此次调用的唯一标识，透传即可，切勿修改
     */
    returnToNative (strArg: string | null, binArg: Uint8Array | null, tag: bigint): void {
        if (JSB) {
            bridge.returnToNative(strArg, binArg, tag);
        }
    }

    /**
     * 调用 callNative 后，Java 返回给 TS 层的数据回调函数，内部函数，调用者无需关注
     * @param strArg 字符串参数列表，如果需要多个参数，建议使用 JSON 格式的字符串
     * @param binArg 二进制参数
     * @param tag 此次调用的唯一标识，透传即可，切勿修改
     */
    private onNativeReturn (strArg: string | null, binArg: Uint8Array | null, tag: bigint): void {
        // console.log(`onNativeReturn: strArg=${strArg}, binArg=${binArg}, tag=${tag}`);
        if (tag > 0) {
            if (tagListenerMap.has(tag)) {
                const listener = tagListenerMap.get(tag);
                listener(strArg, binArg);
                tagListenerMap.delete(tag);
            } else {
                console.error(`Could not find tag (${tag}) in map`);
            }
        } else {
            console.error(`Invalid tag(0) for onNativeReturn`);
        }
    }
}

export const carBridge = new CocosCarBridge();
