import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Play, Pause, SkipForward, SkipBack, ListMusic } from 'lucide-react-native';
import { usePlayback } from '../hooks/use-playback';
import { setupPlayer } from '../../data/services/playback-service';
import { Colors, Spacing } from '../theme';
import TrackPlayer from 'react-native-track-player';
import { MusicRepositoryImpl } from '../../data/repositories/music-repository-impl';

const { width } = Dimensions.get('window');
const ARTWORK_SIZE = width * 0.8;
const musicRepo = new MusicRepositoryImpl();

export const PlayerScreen = () => {
  const { 
    activeTrack, 
    isPlaying, 
    progress, 
    togglePlayback, 
    skipToNext, 
    skipToPrevious 
  } = usePlayback();
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const ready = await setupPlayer();
      if (ready) {
        await loadInitialData();
        setIsReady(true);
      }
    };
    init();

    // Polling สำหรับคิวเพลงใหม่
    const interval = setInterval(async () => {
      const requests = await musicRepo.getPendingRequests();
      if (requests.length > 0) {
        const queue = await TrackPlayer.getQueue();
        // เพิ่มเฉพาะเพลงที่ยังไม่มีในคิว
        const newRequests = requests.filter(req => !queue.some(q => q.id === req.id));
        if (newRequests.length > 0) {
          await TrackPlayer.add(newRequests);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    // 1. ดึงคิวเพลงก่อน
    const requests = await musicRepo.getPendingRequests();
    if (requests.length > 0) {
      await TrackPlayer.add(requests);
    }

    // 2. ถ้าคิวน้อยเกินไป ให้ดึงเพลย์ลิสต์หลักมาเสริม
    const playlistId = await musicRepo.getDefaultPlaylistId();
    const playlistSongs = await musicRepo.getSongsByPlaylist(playlistId);
    
    // กรองเพลงที่อาจจะซ้ำกับคิว
    const filteredPlaylist = playlistSongs.filter(
      song => !requests.some(req => req.id === song.id)
    );
    
    await TrackPlayer.add(filteredPlaylist);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isReady) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.surface, Colors.background]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity>
            <ListMusic color={Colors.textSecondary} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.artworkContainer}>
            <Image
              source={{ uri: activeTrack?.artwork || MOCK_TRACKS[0].artwork }}
              style={styles.artwork}
              resizeMode="cover"
            />
          </View>

          <View style={styles.trackInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {activeTrack?.title || MOCK_TRACKS[0].title}
            </Text>
            <Text style={styles.artist}>
              {activeTrack?.artist || MOCK_TRACKS[0].artist}
            </Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${(progress.position / progress.duration) * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
              <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
            </View>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={skipToPrevious}>
              <SkipBack color={Colors.text} size={32} fill={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.playButton}
              onPress={togglePlayback}
            >
              {isPlaying ? (
                <Pause color="#FFF" size={40} fill="#FFF" />
              ) : (
                <Play color="#FFF" size={40} fill="#FFF" style={{ marginLeft: 4 }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipToNext}>
              <SkipForward color={Colors.text} size={32} fill={Colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    marginBottom: Spacing.xl * 1.5,
  },
  artwork: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    width: '100%',
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
  },
  progressSection: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
