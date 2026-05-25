import TrackPlayer, { 
  AppKilledPlaybackBehavior, 
  Capability, 
  RepeatMode,
  Event
} from 'react-native-track-player';
import { MusicRepositoryImpl } from '../repositories/music-repository-impl';

const musicRepo = new MusicRepositoryImpl();

export const PlaybackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());

  // เมื่อเพลงเปลี่ยน ให้ตรวจสอบและอัปเดตสถานะใน API
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (event) => {
    if (event.nextTrack === undefined && event.track !== undefined && event.track !== null) {
      // เพลงจบและไม่มีเพลงถัดไป (หรือจบรายการ)
      const track = await TrackPlayer.getTrack(event.track);
      if (track) {
        await musicRepo.updateRequestStatus(track.id, 'played');
      }
    } else if (event.track !== undefined && event.track !== null) {
      // เพลงเปลี่ยนเป็นเพลงใหม่
      const track = await TrackPlayer.getTrack(event.track);
      if (track) {
        await musicRepo.updateRequestStatus(track.id, 'played');
      }
    }
  });
};

export const setupPlayer = async () => {
  let isSetup = false;
  try {
    await TrackPlayer.getCurrentTrack();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
    });
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    isSetup = true;
  } finally {
    return isSetup;
  }
};
