import { useEffect, useState } from 'react';
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    Event,
    State,
    Track,
    usePlaybackState,
    useProgress,
    useTrackPlayerEvents
} from 'react-native-track-player';

// 👇 忘れずに追加！これがないと動きません
import { API_BASE_URL } from '../lib/config';
import { supabase } from '../lib/supabase';

let isSetup = false;

export function useMusicPlayer() {
    const playbackState = usePlaybackState();
    const progress = useProgress();

    // 現在の曲を管理するステート
    const [currentTrack, setCurrentTrack] = useState<any>(null);

    // 👇 トラック変更イベントを監視して、全コンポーネントで同期させる
    useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
        if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
            // 次の曲があれば情報を取得
            const track = await TrackPlayer.getTrack(event.nextTrack);
            updateCurrentTrack(track);
        } else {
            // 再生停止などで曲がない場合
            setCurrentTrack(null);
        }
    });

    // マウント時にも現在の曲を取得（アプリ起動直後や画面遷移時用）
    useEffect(() => {
        async function fetchCurrentTrack() {
            try {
                const index = await TrackPlayer.getActiveTrackIndex();
                if (index !== undefined && index !== null) {
                    const track = await TrackPlayer.getTrack(index);
                    updateCurrentTrack(track);
                }
            } catch (e) {
                // まだ再生されていない場合はここに来る
            }
        }
        fetchCurrentTrack();
    }, []);

    // TrackPlayerの形式をアプリのUI用に変換するヘルパー
    const updateCurrentTrack = (track: Track | null) => {
        if (!track) {
            setCurrentTrack(null);
            return;
        }
        setCurrentTrack({
            ...track,
            cover_image_url: track.artwork,
            artist_name: track.artist,
            liked: track.liked,
            like_count: track.like_count
        });
    };

    // プレイヤーの初期設定
    useEffect(() => {
        async function setup() {
            if(isSetup) return;

            try {
                await TrackPlayer.setupPlayer();
                await TrackPlayer.updateOptions({
                    android: {
                        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                    },
                    capabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                        Capability.SeekTo,
                    ],
                    compactCapabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                    ],
                    progressUpdateEventInterval: 2,
                });
                console.log("✅ Player Setup Complete");
            } catch(e) {
                console.log("Player setup error:", e);
            } finally {
                isSetup = true;
            }
        }

        setup();
    },  []);

    // 👇 再生数をカウントする内部関数 (playSongの外に出してスッキリさせました)
    const incrementPlayCount = async (songId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');

            await fetch(`${cleanBaseUrl}/api/increment-play-count`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || ''}`
                },
                body: JSON.stringify({ songId }),
            });
            console.log("✅ Play count incremented");
        } catch (error) {
            console.error("❌ Failed to increment play count:", error);
        }
    };

    const playSong = async (song: any) => {
        try{
            if (!song.song_url) {
                console.error("❌ Song has no URL! Cannot play.");
                return;
            }

            console.log("Attempting to play:", song.title);

            // キューをリセットして追加
            await TrackPlayer.reset();
            await TrackPlayer.add({
                id: song.id,
                url: song.song_url,
                title: song.title,
                artist: song.artist_name || "Unknown Artist",
                artwork: song.cover_image_url || "https://via.placeholder.com/400",
                duration: song.duration_seconds || 0,
                liked: song.liked,
                like_count: song.like_count
            });

            await TrackPlayer.play();

            // 👇 再生開始と同時にカウントアップ（awaitしないことで再生を阻害しない）
            incrementPlayCount(song.id);

        } catch (error) {
            console.error("Error playing song:", error);
        }
    };

    const togglePlayPause = async () => {
        const current = await TrackPlayer.getState();
        if (current === State.Playing) {
            await TrackPlayer.pause();
        } else {
            await TrackPlayer.play();
        }
    };

    const skipToNext = async () => {
        try { await TrackPlayer.skipToNext(); } catch (_) {}
    };

    const skipToPrevious = async () => {
        try { await TrackPlayer.skipToPrevious(); } catch (_) {}
    };

    const seekTo = async (position: number) => {
        await TrackPlayer.seekTo(position);
    };

    const isPlaying =
        playbackState.state === State.Playing ||
        playbackState.state === State.Buffering;

    return {
        playSong,
        togglePlayPause,
        skipToNext,
        skipToPrevious,
        seekTo,
        isPlaying,
        currentTrack,
        position: progress.position,
        duration: progress.duration,
    };
}