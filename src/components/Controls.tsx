import { useAudio } from "../hooks/useAudio";

import styles from "./Controls.module.css";

const Controls = () => {
  const audioContext = useAudio();

  if (!audioContext) return null;

  const { playNextTrack, playPreviousTrack, currentTrackIndex, playPause, isPlaying } = audioContext;

  const stop = <div className={styles.stop}></div>;
  const play = <div className={styles.play}></div>;

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={playPreviousTrack} disabled={currentTrackIndex === 0}>
        Previous track
      </button>
      <button className={styles.button} onClick={playPause}>
        {isPlaying ? stop : play}
      </button>
      <button className={styles.button} onClick={playNextTrack} disabled={currentTrackIndex === 2}>
        Next track
      </button>
    </div>
  );
};

export default Controls;
