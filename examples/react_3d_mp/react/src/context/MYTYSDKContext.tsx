import { createContext } from "react";
import { UnityConfig, useUnityContext } from "react-unity-webgl";
import { UnityContextHook } from "react-unity-webgl/distribution/types/unity-context-hook";

export interface MYTYSDKContext {
    unityContext: UnityContextHook,
    loadAvatar: (avatarCollectionId: number, metadataAssetUri: string, tokenId: string, tokenAssetUri: string) => void,
    selectAvatar: (avatarCollectionId: number, tokenId: string) => void,
    switchMode: () => void,
    processCapturedResult: (data: string) => void,
    takeScreenshot: (dataType?: string, quality?: number) => string | undefined
}

const MESSAGE_HANDLER = 'MessageHandler'

const mytySDKContext = createContext({})
const MYTYSDKContextProvider = ({ config, children }: { config: UnityConfig, children: React.ReactNode }) => {
    const unityContext = useUnityContext(config);

    const loadAvatar = (avatarCollectionId: number, metadataAssetUri: string, tokenId: string, tokenAssetUri: string) => {
        unityContext.sendMessage(MESSAGE_HANDLER, "LoadAvatar", JSON.stringify({
            avatarCollectionId: avatarCollectionId,
            metadataAssetUri: metadataAssetUri,
            tokenId: tokenId,
            tokenAssetUri: tokenAssetUri
        }))
    }

    const selectAvatar = (avatarCollectionId: number, tokenId: string) => {
        unityContext.sendMessage(MESSAGE_HANDLER, "SelectAvatar", JSON.stringify({
            avatarCollectionId: avatarCollectionId,
            tokenId: tokenId
        }))
    }

    const switchMode = () => unityContext.sendMessage(MESSAGE_HANDLER, "SwitchMode", "")

    const processCapturedResult = (data: string) => unityContext.sendMessage(MESSAGE_HANDLER, "ProcessCapturedResult", data)

    const takeScreenshot = unityContext.takeScreenshot

    return <mytySDKContext.Provider value={{ unityContext, loadAvatar, selectAvatar, switchMode, processCapturedResult, takeScreenshot }}>{children}</mytySDKContext.Provider>
}

export { mytySDKContext, MYTYSDKContextProvider }