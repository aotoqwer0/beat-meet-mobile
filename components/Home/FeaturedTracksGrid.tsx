import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { UISong } from '../../types';
import SongCard from './SongCard';

type Props = {
  songs: UISong[];
  onPlay: (song: UISong) => void;
  onRefresh: () => void; // 👈 追加: 更新用関数を受け取る
  refreshing?: boolean;  // 👈 追加: ローディング状態を受け取る
};

export default function FeaturedTracksGrid({ songs, onPlay, onRefresh, refreshing = false }: Props) {
  return (
    <View className="px-2 pb-20">
      {/* セクションヘッダー */}
      <View className="px-2 mb-4 flex-row items-center justify-between">
        <Text className="text-white text-xl font-black italic tracking-tighter">
            FEATURED <Text className="text-amber-400">TRACKS</Text>
        </Text>

        {/* 👇 更新ボタンを追加 */}
        <TouchableOpacity
          onPress={onRefresh}
          className="p-2 bg-zinc-900 rounded-full border border-zinc-800 active:bg-zinc-800"
          activeOpacity={0.7}
          disabled={refreshing}
        >
          <Ionicons
            name="reload"
            size={16}
            color={refreshing ? "#71717a" : "#fbbf24"} // 読み込み中はグレーアウト
            style={{ opacity: refreshing ? 0.5 : 1 }}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        renderItem={({ item }) => <SongCard song={item} onPlay={onPlay} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={
            <Text className="text-zinc-500 text-center py-10">No tracks found.</Text>
        }
      />
    </View>
  );
}