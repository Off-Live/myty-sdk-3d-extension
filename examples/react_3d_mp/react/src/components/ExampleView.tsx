import '../App.css';
import { useEffect, useState, useContext } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { CalibrationType, MYTYSDKContext, mytySDKContext} from "../context/MYTYSDKContext"
import MYTYSDKView from './MYTYSDKView';
import useCaptureRecord from '../hooks/useCaptureRecord';
import Select from 'react-select';
import { Slider, Typography } from '@mui/material';

export type Asset = {
  tokenId: string,
  assetUri: string
}

function ExampleView() {
  const { loadAvatar, selectAvatar, switchMode, updateCalibration } = useContext(mytySDKContext) as MYTYSDKContext
  const { captureImage, stopRecordingVideo, startRecordingVideo } = useCaptureRecord();
  const [tokens, setTokens] = useState<Asset[]>([]);
  const [selectedToken, setSelectedToken] = useState<number>(0);

  const [syncedBlinkScale, setSyncedBlinkScale] = useState<number>(50);
  const [blinkScale, setBlinkScale] = useState<number>(100);
  const [eyebrowScale, setEyebrowScale] = useState<number>(100);
  const [pupilScale, setPupilScale] = useState<number>(100);
  const [mouthXScale, setMouthXScale] = useState<number>(100);
  const [mouthYScale, setMouthYScale] = useState<number>(100);

  useEffect(() => {
    setTokens(["100", "101"].map((id: string) =>
      ({ tokenId: id, assetUri: `https://3d-asset-test.s3.ap-southeast-1.amazonaws.com/PudgyPenguins/${id}.zip`})
    ))
  }, [])

  const avatarOptions = tokens.map((token, idx) => ({ value: idx, label: `PudgyPenguins${token.tokenId}`}))

  const handleSyncedBlinkSlider = (event: Event, newValue: number | number[]) => {
    setSyncedBlinkScale(newValue as number)
    updateCalibration(CalibrationType.SyncedBlink, newValue as number / 100)
  }

  const handleBlinkSlider = (event: Event, newValue: number | number[]) => {
    setBlinkScale(newValue as number)
    updateCalibration(CalibrationType.Blink, newValue as number / 100)
  };

  const handleEyebrowSlider = (event: Event, newValue: number | number[]) => {
    setEyebrowScale(newValue as number)
    updateCalibration(CalibrationType.Eyebrow, newValue as number / 100)
  };

  const handlePupilSlider = (event: Event, newValue: number | number[]) => {
    setPupilScale(newValue as number)
    updateCalibration(CalibrationType.Pupil, newValue as number / 100)
  };

  const handleMouthXSlider = (event: Event, newValue: number | number[]) => {
    setMouthXScale(newValue as number)
    updateCalibration(CalibrationType.MouthX, newValue as number / 100)
  };

  const handleMouthYSlider = (event: Event, newValue: number | number[]) => {
    setMouthYScale(newValue as number)
    updateCalibration(CalibrationType.MouthY, newValue as number / 100)
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={10}>
        <p> 3D Avatar Loader </p>
      </Grid>
      <Grid item xs={5}>
        <Select options={avatarOptions} onChange={(item) => { if (item != null) { setSelectedToken(item!.value)}}} />
      </Grid>
      <Grid item xs={5}>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button onClick={(item) => loadAvatar(0, "", tokens[selectedToken].tokenId, tokens[selectedToken].assetUri)}>Load Avatar</Button>
          <Button onClick={(item) => switchMode()}>Switch Mode</Button>
          <Button onClick={(item) => selectAvatar(0, tokens[selectedToken].tokenId)}>Select Avatar</Button>
          <Button onClick={(item) => captureImage()}>Capture</Button>
          <Button onClick={(item) => startRecordingVideo(60)}>Start Recording</Button>
          <Button onClick={(item) => stopRecordingVideo()}>Stop Recording</Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={5}>
        <MYTYSDKView />
      </Grid>
      <Grid item xs={5}>
        <Typography>
          Synced Blink Slider
        </Typography>
        <Slider
          value={syncedBlinkScale}
          onChange={handleSyncedBlinkSlider}
          step={1}
          min={0}
          max={100}
        />
        <Typography>
          Blink Slider
        </Typography>
        <Slider
          value={blinkScale}
          onChange={handleBlinkSlider}
          step={1}
          min={0}
          max={200}
        />
        <Typography>
          Eyebrow Slider
        </Typography>
        <Slider
          value={eyebrowScale}
          onChange={handleEyebrowSlider}
          step={1}
          min={0}
          max={200}
        />
        <Typography>
          Pupil Slider
        </Typography>
        <Slider
          value={pupilScale}
          onChange={handlePupilSlider}
          step={1}
          min={0}
          max={200}
        />
        <Typography>
          MouthX Slider
        </Typography>
        <Slider
          value={mouthXScale}
          onChange={handleMouthXSlider}
          step={1}
          min={0}
          max={200}
        />
        <Typography>
          MouthY Slider
        </Typography>
        <Slider
          value={mouthYScale}
          onChange={handleMouthYSlider}
          step={1}
          min={0}
          max={200}
        />
      </Grid>
    </Grid>
  );
}

export default ExampleView;
