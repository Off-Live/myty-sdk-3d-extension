import { useContext, useRef, useEffect } from "react"
import { MYTYSDKContext, mytySDKContext } from "../context/MYTYSDKContext"
import { Unity } from "react-unity-webgl"
import { VideoDeviceContext, videoDeviceContext } from "../context/VideoDeviceContext";
import useHolistic from "../hooks/useHolistic";

const MYTYSDKView = () => {
  const {unityContext} = useContext(mytySDKContext) as MYTYSDKContext;
  const { setCamera } = useContext(videoDeviceContext) as VideoDeviceContext;
  const cameraRef = useRef<HTMLVideoElement>(null);
  const {startLoading} = useHolistic();

  useEffect(() => {
    if(cameraRef.current) {
      setCamera(cameraRef.current);
    }
  }, [cameraRef, setCamera])

  return <div style={{ position: 'relative', width: '720px', height: '480px' }}>
        <Unity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
            visibility: unityContext.isLoaded ? 'visible' : 'hidden',
            width: '720px',
            height: '480px',
          }}
          devicePixelRatio={2}
          unityProvider={unityContext.unityProvider}
        />
        <video
          ref={cameraRef}
          autoPlay={true}
          onLoadedData={startLoading}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -2,
            transform: "scaleX(-1)",
            width: '720px',
            height: '480px',
            visibility: 'hidden'
          }}
        />
      </div>
}

export default MYTYSDKView;