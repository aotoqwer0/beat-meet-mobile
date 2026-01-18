import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { API_BASE_URL } from '../../lib/config';
import { UISong } from '../../types/index';

type Props = {
  song: UISong;
  onPlay: (song: UISong) => void;
  containerStyle?: string;
};

export default function SongCard({ song, onPlay, containerStyle = "" }: Props) {
  // 楽観的UIのためのローカルState
  const [isLiked, setIsLiked] = useState(song.liked);
  const [likeCount, setLikeCount] = useState(song.like_count);

  // 👇 フックから「認証ガード関数」と「セッション情報」を受け取る
  const { requireAuth, session } = useRequireAuth();

  useEffect(() => {
    setIsLiked(song.liked);
    setLikeCount(song.like_count);
  }, [song.liked, song.like_count]);

  // 実際にLike処理を行う関数（ログイン済みであることが保証された状態で呼ばれる）
  const executeToggleLike = async () => {
    // 1. 楽観的UI更新 (Optimistic Update)
    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(prev => previousLiked ? prev - 1 : prev + 1);

    try {
      // 2. API通信
      // フックから取得した session を使うため、ここで getSession() する必要なし
      if (!session?.access_token) throw new Error("No access token");

      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, '');
      const res = await fetch(`${cleanBaseUrl}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ songId: song.id }),
      });

      if (!res.ok) {
        throw new Error('Failed to update like');
      }

      const data = await res.json();
      if (typeof data.likeCount === 'number') {
        setLikeCount(data.likeCount);
      }

    } catch (error) {
      console.error("Like Error:", error);
      // 失敗したら元の状態に戻す (Rollback)
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      Alert.alert("Error", "Failed to update like status.");
    }
  };

  return (
    <View className={`flex-1 m-2 mb-6 ${containerStyle}`}>
      <TouchableOpacity
        onPress={() => onPlay(song)}
        activeOpacity={0.7}
        className="w-full"
      >
        {/* ジャケット画像エリア */}
        <View className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-sm mb-3">
          <Image
            source={{ uri: song.cover_image_url || 'https://via.placeholder.com/300' }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* 再生アイコン */}
          <View className="absolute bottom-2 right-2 bg-black/60 rounded-full p-2 backdrop-blur-sm">
              <Ionicons name="play" size={16} color="#fbbf24" />
          </View>
        </View>
      </TouchableOpacity>

      {/* テキスト情報 & アクションエリア */}
      <View className="px-1 flex-row items-start justify-between">
        {/* 左側: 曲情報 */}
        <TouchableOpacity
          onPress={() => onPlay(song)}
          className="flex-1 mr-2"
          activeOpacity={0.7}
        >
          <Text
            className="text-white font-bold text-sm mb-1 leading-tight"
            numberOfLines={1}
          >
            {song.title}
          </Text>
          <Text
            className="text-zinc-400 text-xs font-medium"
            numberOfLines={1}
          >
            {song.artist_name || "Unknown Artist"}
          </Text>
        </TouchableOpacity>

        {/* 右側: Likeボタン */}
        <TouchableOpacity
          // 👇 ここで requireAuth を噛ませることで、ログイン判定を共通化
          onPress={() => requireAuth(executeToggleLike)}
          activeOpacity={0.6}
          className="items-center justify-center p-2 -mt-2 -mr-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={20}
            color={isLiked ? "#fbbf24" : "#71717a"}
          />
          <Text className={`text-[10px] font-bold mt-0.5 ${isLiked ? 'text-amber-400' : 'text-zinc-500'}`}>
            {likeCount || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}