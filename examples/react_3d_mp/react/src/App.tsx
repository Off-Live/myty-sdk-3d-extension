import './App.css';
import { MYTYSDKContextProvider} from "./context/MYTYSDKContext"
import ExampleView from './components/ExampleView';
import { VideoDeviceContextProvider } from './context/VideoDeviceContext';

function App() {
  return (
    <MYTYSDKContextProvider config={{
      loaderUrl: "WebGL/Build/WebGL.loader.js",
      dataUrl: "WebGL/Build/WebGL.data.unityweb",
      frameworkUrl: "WebGL/Build/WebGL.framework.js.unityweb",
      codeUrl: "WebGL/Build/WebGL.wasm.unityweb",
      webglContextAttributes: { preserveDrawingBuffer: true }
    }}>
      <VideoDeviceContextProvider>
        <ExampleView/ >
      </VideoDeviceContextProvider>
    </MYTYSDKContextProvider>
  );
}

export default App;
