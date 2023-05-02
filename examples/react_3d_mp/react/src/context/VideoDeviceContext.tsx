import { createContext, useState, useEffect } from 'react';
import { from } from 'rxjs';

export type VideoDevice = {
    value: string,
    label: string
}

export interface VideoDeviceContext {
    deviceOptions: VideoDevice[];
    onCameraChanged: (value: string, label: string) => void;
    currentCam: VideoDevice | null;
    cameraElem: HTMLVideoElement | null;
    setCamera: (elem: HTMLVideoElement) => void
}

const videoDeviceContext = createContext({})
const VideoDeviceContextProvider = ({children} : {children:React.ReactNode}) => {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentCam, setCurrentCam] = useState<VideoDevice | null>(null);
    const [cameraElem, setCameraElem] = useState<HTMLVideoElement | null>(null);

    const deviceOptions = devices
        .filter(device => !device.label.includes("MYTY"))
        .map(device => ({ value: device.deviceId, label: device.label }));

    const onCameraChanged = (value: string, label: string) => {
        setCurrentCam({ value, label });
    };

    const setCamera = (cam: HTMLVideoElement) => {
        setCameraElem(cam);
    }

    useEffect(() => {
        const device$ = from(navigator.mediaDevices.enumerateDevices());
        const subs = device$.subscribe((args) => {
            setDevices(args.filter(device => device.kind == "videoinput").filter(device => !device.label.includes("MYTY")))
        })

        return () => {
            subs.unsubscribe();
        }
    }, [setDevices]);

    useEffect(() => {
        if (devices.length == 0) return;
        if (!currentCam || !cameraElem) return;

        const camera = devices.filter(device => device.deviceId == currentCam.value)
        const subs$ = from(
            navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { deviceId: camera[0].deviceId, width: 720, height: 480 }
            })
        ).subscribe((stream) => {
            cameraElem.srcObject = stream;
            cameraElem.play();
        })

        return () => {
            subs$.unsubscribe()
        }
    }, [devices, currentCam, cameraElem])

    useEffect(() => {
      if (devices.length == 0) return;

      var firstDevice = devices[0];
      console.log(firstDevice);
      setCurrentCam({value : firstDevice.deviceId, label : firstDevice.label});
    }, [devices])

    return (
        <videoDeviceContext.Provider value={{ deviceOptions, onCameraChanged, setCamera, currentCam, cameraElem }}>
            {children}
        </videoDeviceContext.Provider>
    );
}

export { videoDeviceContext, VideoDeviceContextProvider }