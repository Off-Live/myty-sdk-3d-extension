import { useCallback, useContext, useRef } from 'react'
import { VideoDeviceContext, videoDeviceContext } from '../context/VideoDeviceContext'
import { MYTYSDKContext, mytySDKContext } from '../context/MYTYSDKContext'

const useCaptureRecord = () => {
  const { cameraElem } = useContext(videoDeviceContext) as VideoDeviceContext
  const { takeScreenshot } = useContext(mytySDKContext) as MYTYSDKContext
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const captureImage = useCallback(() => {
    saveImage(takeScreenshot("image/png", 1.0) as string)
  }, [cameraElem, takeScreenshot])

  const startRecordingVideo = useCallback(async (frameRate: number) => {
    if(!cameraElem) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 720;
    canvas.height = 480;

    const stream = canvas.captureStream(frameRate);

    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const combinedStream = new MediaStream([...stream.getVideoTracks(), ...audioStream.getAudioTracks()]);

    mediaRecorder.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    mediaRecorder.current.ondataavailable = (e) => {
      saveVideo([e.data]);
    };

    mediaRecorder.current.start();

    const drawFrame = () => {
      if (!mediaRecorder.current || mediaRecorder.current.state !== 'recording') {
        return;
      }

      if (context) {
        const captured = takeScreenshot('image/png', 1.0);

        const image = new Image();
        
        image.src = captured as string;
        
        image.onload = function () {
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        }
      }
    };

    drawFrame();    
    
  }, [mediaRecorder, cameraElem, takeScreenshot])

  const stopRecordingVideo = useCallback(() => {
    if(mediaRecorder.current) {
      mediaRecorder.current.stop();
    }
  }, [mediaRecorder])

  const saveImage = (encoded: string) => {
    const a = document.createElement('a');
    a.href = encoded;
    a.download = 'captured.png';
    a.click();
  }

  const saveVideo = (chunks: Blob[]) => {
    if (chunks.length === 0) {
      console.error('No video data to save')
      return
    }

    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    URL.revokeObjectURL(url);
  }

  const takeScreenshotWithWebCam = () => {
    return new Promise<string>((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context is null'));
        return;
      }

      if (!cameraElem) {
        reject(new Error('No Camera element'));
        return;
      }

      canvas.width = cameraElem.videoWidth;
      canvas.height = cameraElem.videoHeight;

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(cameraElem!, 0, 0, canvas.width, canvas.height);

      var unityCaptured = takeScreenshot("image/png", 1.0);

      if (!unityCaptured) {
        reject(new Error('Failed to capture Unity screen'));
        return;
      }

      const image = new Image();
      image.src = unityCaptured;
      image.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;

        if (!tempCtx) {
          reject(new Error('Temporary canvas context is null'));
          return;
        }

        tempCtx.translate(tempCanvas.width, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);

        const captured = canvas.toDataURL('image/png');

        canvas.remove();
        tempCanvas.remove();

        resolve(captured);
      };
    });
  }

  return {
    captureImage,
    startRecordingVideo,
    stopRecordingVideo
  }
}

export default useCaptureRecord