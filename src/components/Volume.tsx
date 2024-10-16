import { useAudio } from "../hooks/useAudio";

const Volume = () => {
  const audioContext = useAudio();

  if (!audioContext) return null;

  const { volume, handleVolumeChange } = audioContext;

  return (
    <div>
      <input id="volumeControl" type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} />
    </div>
  );
};

export default Volume;
