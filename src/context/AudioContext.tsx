import React, { createContext, useRef, useState, ReactNode, useEffect } from "react";

interface AudioContextType {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTime: number;
  volume: number;
  playPause: () => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentTrack: HTMLAudioElement | null;
  duration: number;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tracks = ["/antika.mp3", "/srednji_vijek.mp3", "/novi_vijek.mp3"];

  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0); // Start with track 0
  const [currentTime, setCurrentTime] = useState<number>(0); // Store playback time
  const [volume, setVolume] = useState<number>(0.5); // Default volume (50%)
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [fadeInterval, setFadeInterval] = useState<number | null>(null); // To manage crossfade interval

  const audioRef1 = useRef<HTMLAudioElement | null>(null);
  const audioRef2 = useRef<HTMLAudioElement | null>(null);
  const [activeAudio, setActiveAudio] = useState<number>(1); // 1 for audioRef1, 2 for audioRef2

  const getCurrentAudio = () => (activeAudio === 1 ? audioRef1.current : audioRef2.current);
  const getNextAudio = () => (activeAudio === 1 ? audioRef2.current : audioRef1.current);
  const currentTrack = getCurrentAudio();

  // Play/Pause toggle function
  const playPause = () => {
    const currentAudio = getCurrentAudio();
    const nextAudio = getNextAudio();
    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        if (nextAudio) nextAudio.pause();
      } else {
        currentAudio.play();
        if (nextAudio) nextAudio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const updateTimeAndDuration = () => {
    const currentAudio = getCurrentAudio();
    if (!currentAudio) return;

    setCurrentTime(currentAudio.currentTime);
    setDuration(currentAudio.duration || 0);
  };

  useEffect(() => {
    const currentAudio = getCurrentAudio();
    if (!currentAudio) return;

    currentAudio.addEventListener("timeupdate", updateTimeAndDuration);
    currentAudio.addEventListener("loadedmetadata", updateTimeAndDuration);

    return () => {
      if (!currentAudio) return;
      currentAudio.removeEventListener("timeupdate", updateTimeAndDuration);
      currentAudio.removeEventListener("loadmetadata", updateTimeAndDuration);
    };
  }, [activeAudio]);

  // Crossfade logic (same as before)
  const crossfadeTracks = (nextTrackIndex: number) => {
    const currentAudio = getCurrentAudio();
    const nextAudio = getNextAudio();

    if (fadeInterval) clearInterval(fadeInterval); // Clear any ongoing crossfade

    if (currentAudio && nextAudio) {
      setCurrentTrackIndex(nextTrackIndex); // Set the new track index

      const time = currentAudio.currentTime;
      setCurrentTime(time);

      nextAudio.src = tracks[nextTrackIndex];

      nextAudio.onloadedmetadata = () => {
        const newTrackDuration = nextAudio.duration;
        const clampedTime = time > newTrackDuration ? 0 : time; // Reset to 0 if time > duration
        nextAudio.currentTime = clampedTime;

        nextAudio.volume = 0;
        nextAudio.loop = true; // Ensure looping is enabled
        nextAudio.play();
        setIsPlaying(true);

        const fadeDuration = 3000; // 3 seconds
        const fadeStep = 50; // Volume adjustment interval (50ms)
        const volumeStep = volume / (fadeDuration / fadeStep);

        const newFadeInterval = window.setInterval(() => {
          if (currentAudio.volume > 0) {
            currentAudio.volume = Math.max(0, currentAudio.volume - volumeStep); // Fade out
          }

          if (nextAudio.volume < volume) {
            nextAudio.volume = Math.min(volume, nextAudio.volume + volumeStep); // Fade in
          }

          if (currentAudio.volume <= 0 && nextAudio.volume >= volume) {
            clearInterval(newFadeInterval);
            currentAudio.pause();
            setActiveAudio(activeAudio === 1 ? 2 : 1);
          }
        }, fadeStep);

        setFadeInterval(newFadeInterval); // Store the fade interval
      };
    }
  };

  const playNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    crossfadeTracks(nextIndex);
  };

  const playPreviousTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    crossfadeTracks(prevIndex);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    const currentAudio = getCurrentAudio();
    if (currentAudio) {
      currentAudio.volume = newVolume;
    }
  };

  // Provide state and functions
  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrackIndex,
        currentTime,
        volume,
        playPause,
        playNextTrack,
        playPreviousTrack,
        handleVolumeChange,
        currentTrack,
        duration,
      }}
    >
      {/* Audio elements (kept in the provider to handle refs) */}
      <audio ref={audioRef1} src={tracks[0]} loop />
      <audio ref={audioRef2} src={tracks[1]} loop />

      {children}
    </AudioContext.Provider>
  );
};
