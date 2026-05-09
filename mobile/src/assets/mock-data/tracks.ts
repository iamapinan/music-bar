import { Track } from '../../domain/entities/track';

export const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Midnight Serenade',
    artist: 'Luna Eclipse',
    artwork: 'https://picsum.photos/seed/track1/800/800',
    duration: 312,
  },
  {
    id: '2',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    title: 'Urban Rhythm',
    artist: 'Street Beats',
    artwork: 'https://picsum.photos/seed/track2/800/800',
    duration: 245,
  },
  {
    id: '3',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    title: 'Ocean Breeze',
    artist: 'Nature Sounds',
    artwork: 'https://picsum.photos/seed/track3/800/800',
    duration: 180,
  }
];
