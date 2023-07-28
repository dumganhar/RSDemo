import { _decorator, Component, find, CameraComponent, director, Director, Scene, settings, Settings } from 'cc';
import { carBridge } from './CocosCarBridge';

const { ccclass } = _decorator;

const win = globalThis as any;
const jsb = (win.jsb ? win.jsb : {});

interface SceneLoadedInfo {
    clientId: number,
    clientPid: number,
    sceneName: string,
    notified: boolean,
}
const clientPidMap = new Map<number, Array<SceneLoadedInfo>>();
let currentSceneName: string;

// Render Service 模式不需要 splash screen，设置 totalTime 为 0，相当于强制关闭
settings.overrideSettings(Settings.Category.SPLASH_SCREEN, 'totalTime', 0);

// 监听加载场景成功后的事件
director.on(Director.EVENT_AFTER_SCENE_LAUNCH, (scene: Scene) => {
    console.log(`EVENT_AFTER_SCENE_LAUNCH`);

    currentSceneName = director.getScene().name;

    clientPidMap.forEach((value: Array<SceneLoadedInfo>, clientPid: number) => {
        for (const sceneLoadedInfo of value) {
            sceneLoadedInfo.notified = true;
            sceneLoadedInfo.sceneName = scene.name;
        }

        carBridge.callNative('onSceneLoaded', JSON.stringify({ clientPid, sceneName: currentSceneName }), null, null);
    });
});

// 设置相机状态和关联的 renderWindow
function setCameraActive (cameraPath: string, active: boolean, renderWindow: any) {
    const cameraNode = find(cameraPath);
    if (!cameraNode) {
        console.error(`could not find ${cameraPath}`);
        return;
    }

    cameraNode.active = active;
    const cameraComp = cameraNode?.getComponent(CameraComponent);
    cameraComp?.camera?.changeTargetWindow(renderWindow);
}

// 解析 render-service-config.json 中渲染服务的 extra 字段
function parseExtraArgument (extraArg: string): any {
    try {
        return JSON.parse(extraArg);
    } catch (e) {
        console.error(e);
    }
    return null;
}

function tryInvokeRenderTargetCreated (renderWindow: any, extraArg: string): boolean {
    const extraObj = parseExtraArgument(extraArg);
    if (!extraObj) {
        return false;
    }

    const targetSceneName = extraObj.sceneName;
    if (!targetSceneName) {
        console.error(`onRenderServiceRenderTargetCreated, invalid scene name`);
        return false;
    }

    const currentScene = director.getScene();
    if (!currentScene || currentScene.name !== targetSceneName) {
        console.info(`Created, target scene '${targetSceneName}' is not loaded, current scene is ${currentScene?.name}`);
        return false;
    }

    const cameraList = extraObj.cameraList;
    if (!Array.isArray(cameraList) || cameraList.length === 0) {
        console.error(`onRenderServiceRenderTargetCreated, cameraList is invalid!`);
        return false;
    }

    // 批量激活相机并关联其 targetWindow 为 renderWindow
    for (const cameraPath of cameraList) {
        setCameraActive(cameraPath, true, renderWindow);
    }
    return true;
}

class RenderServiceImpl {
    constructor () {
        // 关联 jsb 下的函数
        jsb.onRenderServiceRenderTargetCreated = this.onRenderServiceRenderTargetCreated.bind(this);
        jsb.onRenderServiceRenderTargetDestroyed = this.onRenderServiceRenderTargetDestroyed.bind(this);
        jsb.onRenderServiceClientConnected = this.onRenderServiceClientConnected.bind(this);
        jsb.onRenderServiceClientDisconnected = this.onRenderServiceClientDisconnected.bind(this);
    }

    // 当使用自定义渲染配置（即，有 extra 字段的渲染服务），Client start 后会触发此函数，extraArg 是透传过来的 render-service-config.json 中的 extra 字段
    // 目前我们用此回调去控制对应相机，激活相机，并关联到对应的 renderWindow
    onRenderServiceRenderTargetCreated (renderWindow: any, extraArg: string): void {
        console.log(`onRenderServiceRenderTargetCreated:renderWindow=${renderWindow}, extraArg=${extraArg}`);

        if (!tryInvokeRenderTargetCreated(renderWindow, extraArg)) {
            console.log(`set setInterval ...`);
            const interval = setInterval(() => {
                console.log(`timer callback ...`);
                if (tryInvokeRenderTargetCreated(renderWindow, extraArg)) {
                    console.log(`clear interval: ${interval}`);
                    clearInterval(interval);
                }
            }, 200);
        }
    }

    // 当使用自定义渲染配置（即，有 extra 字段的渲染服务），Client stop 后会触发此函数，extraArg 是透传过来的 render-service-config.json 中的 extra 字段
    // 目前我们用此回调去控制对应相机，激活相机，并关联到对应的 renderWindow
    onRenderServiceRenderTargetDestroyed (extraArg: string): void {
        console.log(`onRenderServiceRenderTargetDestroyed: ${extraArg}`);
        const extraObj = parseExtraArgument(extraArg);
        if (!extraObj) {
            return;
        }

        const targetSceneName = extraObj.sceneName;
        if (!targetSceneName) {
            console.error(`onRenderServiceRenderTargetDestroyed, invalid scene name`);
            return;
        }

        const currentScene = director.getScene();
        if (!currentScene || currentScene.name !== targetSceneName) {
            console.error(`Destroyed, target scene '${targetSceneName}' is not loaded, current scene is ${currentScene?.name}`);
            return;
        }

        const cameraList = extraObj.cameraList;
        if (!Array.isArray(cameraList) || cameraList.length === 0) {
            console.error(`onRenderServiceRenderTargetDestroyed, cameraList is invalid!`);
            return;
        }

        // 批量隐藏相机，并关联其 targetWindow 为 null
        for (const cameraPath of cameraList) {
            setCameraActive(cameraPath, false, null);
        }
    }

    /**
     * 客户端连接上的回调
     * @param clientPid 客户端进程 ID
     * @param clientId 客户端唯一 ID
     */
    onRenderServiceClientConnected (clientPid: number, clientId: number): void {
        console.log(`onRenderServiceClientConnected: clientPid=${clientPid}, clientId=${clientId}`);
        const sceneLoadedInfo: SceneLoadedInfo = { clientId, clientPid, sceneName: '', notified: false };
        if (!clientPidMap.has(clientPid)) {
            clientPidMap.set(clientPid, [sceneLoadedInfo]);
        } else {
            clientPidMap.get(clientPid).push(sceneLoadedInfo);
        }
    }

    /**
     * 客户端断开时的回调
     * @param clientPid 客户端进程 ID
     * @param clientId 客户端唯一 ID
     */
    onRenderServiceClientDisconnected (clientPid: number, clientId: number): void {
        console.log(`onRenderServiceClientDisconnected: clientPid=${clientPid}, clientId=${clientId}`);
        if (clientPidMap.has(clientPid)) {
            const infoList = clientPidMap.get(clientPid);
            const index = infoList.findIndex((e) => e.clientId === clientId);
            if (index !== -1) {
                infoList.splice(index, 1);
            }

            if (infoList.length === 0) {
                clientPidMap.delete(clientPid);
            }
        } else {
            console.error(`Could not find pid (${clientPid}) in map!`);
        }
    }

    nop () {
        console.log(`nop`);
    }
}

const rs = new RenderServiceImpl();
rs.nop();

/**
 * 通知客户端「场景加载成功」的消息，每帧检测，如果客户端对应的进程已经被通知过，则不再次通知
 */
function checkSceneLoadTick () {
    if (clientPidMap.size > 0) {
        clientPidMap.forEach((value: Array<SceneLoadedInfo>, clientPid: number) => {
            let needToNotify = false;
            for (const sceneLoadedInfo of value) {
                if (!sceneLoadedInfo.notified || sceneLoadedInfo.sceneName !== currentSceneName) {
                    sceneLoadedInfo.notified = true;
                    sceneLoadedInfo.sceneName = currentSceneName;
                    needToNotify = true;
                }
            }

            if (needToNotify) {
                carBridge.callNative('onSceneLoaded', JSON.stringify({ clientPid, sceneName: currentSceneName }), null, null);
            }
        });
    }
    requestAnimationFrame(checkSceneLoadTick);
}

requestAnimationFrame(checkSceneLoadTick);

@ccclass('RenderService')
export class RenderService extends Component {

}
