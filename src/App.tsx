import "./App.css";
import AudioDetails from "./components/AudioDetails";
import Controls from "./components/Controls";
import Volume from "./components/Volume";
import { useAudio } from "./hooks/useAudio";

function App() {
  const audioContext = useAudio();

  if (!audioContext) return null;

  const { currentTrack } = audioContext;
  console.log(currentTrack);

  return (
    <main>
      <h1>Audio Controller Demo</h1>
      <Controls />
      <Volume />
      {currentTrack && <AudioDetails audio={currentTrack} />}
    </main>
  );
}

export default App;
