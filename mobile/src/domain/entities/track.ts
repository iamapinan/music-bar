export interface Track {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork: string;
  duration?: number;
}

export interface PlaybackState {
  state: 'playing' | 'paused' | 'buffering' | 'stopped' | 'none';
  currentTrack?: Track;
  position: number;
  duration: number;
}
