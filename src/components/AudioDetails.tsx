import React from "react";

import styles from "./AudioDetails.module.css";

type AudioDetailsProps = {
  audio: HTMLAudioElement;
};

const AudioDetails: React.FC<AudioDetailsProps> = ({ audio }) => {
  const { duration, currentTime } = audio;
  console.log(currentTime, duration);

  const progressBarWidth = (currentTime / duration) * 100;
  console.log(progressBarWidth);

  return (
    <div>
      <div className={styles.bar}>
        <div style={{ width: `${progressBarWidth}%` }} className={styles.progress}></div>
      </div>
    </div>
  );
};

export default AudioDetails;
