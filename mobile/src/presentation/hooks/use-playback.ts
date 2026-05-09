import { useEffect, useState } from 'react';
import TrackPlayer, { 
  usePlaybackState as useRNPlaybackState, 
  useProgress,
  State,
  useActiveTrack,
  Event,
  useTrackPlayerEvents
} from 'react-native-track-player';
import { useKeepAwake } from 'react-native-keep-awake';

export const usePlayback = () => {
  const playbackState = useRNPlaybackState();
  const progress = useProgress();
  const activeTrack = useActiveTrack();
  const [isPlaying, setIsPlaying] = useState(false);

  // ป้องกันเครื่องหลับเมื่อมีการเล่นเพลง
  useKeepAwake();

  useEffect(() => {
    setIsPlaying(playbackState.state === State.Playing);
  }, [playbackState.state]);

  const togglePlayback = async () => {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = () => TrackPlayer.skipToNext();
  const skipToPrevious = () => TrackPlayer.skipToPrevious();
  const seekTo = (position: number) => TrackPlayer.seekTo(position);

  return {
    isPlaying,
    progress,
    activeTrack,
    playbackState,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    seekTo
  };
};
