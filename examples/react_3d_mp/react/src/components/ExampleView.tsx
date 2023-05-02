import '../App.css';
import { useEffect, useState, useContext } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { MYTYSDKContext, mytySDKContext} from "../context/MYTYSDKContext"
import MYTYSDKView from './MYTYSDKView';
import useCaptureRecord from '../hooks/useCaptureRecord';
import Select from 'react-select';

export type Asset = {
  tokenId: string,
  assetUri: string
}

function ExampleView() {
  const { loadAvatar, selectAvatar, switchMode } = useContext(mytySDKContext) as MYTYSDKContext
  const { captureImage, stopRecordingVideo, startRecordingVideo } = useCaptureRecord();
  const [tokens, setTokens] = useState<Asset[]>([]);
  const [selectedToken, setSelectedToken] = useState<number>(0);

  useEffect(() => {
    setTokens(["100", "101"].map((id: string) =>
      ({ tokenId: id, assetUri: `https://3d-asset-test.s3.ap-southeast-1.amazonaws.com/PudgyPenguins/${id}.zip`})
    ))
  }, [])

  const avatarOptions = tokens.map((token, idx) => ({ value: idx, label: `PudgyPenguins${token.tokenId}`}))

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
    </Grid>
  );
}

export default ExampleView;
