import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  onStartListening: () => void;
};

export default function HeroSection({ onStartListening }: Props) {
  return (
    <View className="px-2 mb-8 mt-2">
      <View className="rounded-3xl overflow-hidden h-[340px] relative border border-zinc-800 shadow-lg shadow-amber-900/10">
        {/* 背景画像 */}
        <ImageBackground
          // 雰囲気に合うサイバーパンク/音楽スタジオ風の画像
          source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop' }}
          className="w-full h-full justify-end"
          resizeMode="cover"
        >
          {/* オーバーレイレイヤー（文字を読みやすくするための暗幕） */}
          <View className="absolute inset-0 bg-black/30" />
          <View className="absolute bottom-0 left-0 right-0 h-2/3 bg-black/60" />
          <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-black/80" />

           {/* コンテンツ */}
           <View className="p-6 relative z-10">
              {/* バッジ */}
              <View className="flex-row items-center mb-3">
                 <View className="bg-amber-400/90 px-3 py-1 rounded-full border border-amber-400/50 backdrop-blur-md shadow-sm shadow-amber-400/20">
                   <Text className="text-black text-[10px] font-bold tracking-[2px] uppercase">
                      Trending Now
                   </Text>
                 </View>
              </View>

              {/* キャッチコピー */}
              <Text className="text-white text-4xl font-black italic tracking-tighter leading-none mb-1 shadow-black shadow-lg">
                UNLEASH <Text className="text-zinc-500">///</Text>
              </Text>
              <Text className="text-white text-4xl font-black italic tracking-tighter leading-none mb-4 shadow-black shadow-lg">
                YOUR <Text className="text-amber-400">RHYTHM</Text>
              </Text>

              {/* サブテキスト */}
              <Text className="text-zinc-300 text-sm font-medium mb-8 leading-relaxed w-5/6" numberOfLines={2}>
                Discover the hottest beats, connect with producers, and elevate your sound.
              </Text>

              {/* アクションボタン */}
              <TouchableOpacity
                onPress={onStartListening}
                activeOpacity={0.8}
                className="bg-amber-400 self-start px-8 py-4 rounded-full flex-row items-center shadow-lg shadow-amber-400/40 border-b-4 border-amber-600 active:border-b-0 active:mt-1"
              >
                <Ionicons name="play" size={20} color="black" />
                <Text className="text-black font-bold ml-2 text-sm uppercase tracking-widest">
                  Start Listening
                </Text>
              </TouchableOpacity>
           </View>
        </ImageBackground>
      </View>
    </View>
  );
}