import { useContext, useRef, useEffect, useState } from "react";
import { MYTYSDKContext, mytySDKContext } from "../context/MYTYSDKContext";
import { VideoDeviceContext, videoDeviceContext } from "../context/VideoDeviceContext";
import { Holistic } from '@mediapipe/holistic';

const useHolistic = () => {
  const { processCapturedResult } = useContext(mytySDKContext) as MYTYSDKContext
  const { currentCam, cameraElem } = useContext(videoDeviceContext) as VideoDeviceContext
  const holisticRef = useRef<Holistic | null>(null);
  const [ counter, setCounter ] = useState(0);

  useEffect(() => {
    if (!currentCam || !cameraElem) return;
    holisticRef.current = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
    })

    holisticRef.current.setOptions({
      selfieMode: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      modelComplexity: 1,
      smoothLandmarks: true
    })

    holisticRef.current.onResults((result) => {
      const motionData = {
        face: result.faceLandmarks,
        pose: result.poseLandmarks,
        width: cameraElem.videoWidth,
        height: cameraElem.videoHeight
      }
      setCounter(x => x+1)
      processCapturedResult(JSON.stringify(motionData))
    })
  }, [processCapturedResult, currentCam, cameraElem]);

  useEffect(() => {
    if(counter > 0) updateFunc()
  }, [counter])

  const updateFunc = async () => {
    if (cameraElem && holisticRef.current) {
      await holisticRef.current.send({ image: cameraElem });
    }
  }

  const startLoading = () => {
    setCounter(1);
  }

  return { startLoading }
}

export default useHolistic