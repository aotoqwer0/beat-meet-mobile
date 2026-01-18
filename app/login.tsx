import { AntDesign } from '@expo/vector-icons'; // Googleアイコン用
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // ログイン処理
    async function signIn() {
        if (!email || !password) {
        Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
        return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        });

        if (error) {
        Alert.alert('ログイン失敗\nメールアドレスもしくはパスワードが違います.');
        } else {
        router.replace('/(tabs)');
        }
        setLoading(false);
    }

    return (
        <View className="flex-1 bg-black justify-center items-center p-4">
        <StatusBar style="light" />

        {/* カードコンテナ */}
        <View className="w-full max-w-sm bg-slate-900 p-6 rounded-2xl border border-slate-800">

            <Text className="text-white text-2xl font-bold mb-8">ログイン</Text>

            {/* メールアドレス入力 */}
            <View className="mb-4">
            <Text className="text-gray-400 mb-2 text-xs">メールアドレス</Text>
            <TextInput
                className="bg-black text-white p-4 rounded-lg border border-slate-700"
                placeholder="you@example.com"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            </View>

            {/* パスワード入力 */}
            <View className="mb-6">
            <Text className="text-gray-400 mb-2 text-xs">パスワード</Text>
            <TextInput
                className="bg-black text-white p-4 rounded-lg border border-slate-700"
                placeholder="••••••••"
                placeholderTextColor="#555"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            </View>

            {/* ログインボタン (黄色) */}
            <TouchableOpacity
            onPress={signIn}
            disabled={loading}
            className="bg-amber-400 p-4 rounded-lg items-center mb-4 active:bg-amber-500"
            >
            {loading ? (
                <ActivityIndicator color="#000" />
            ) : (
                <Text className="text-black font-bold text-base">ログイン</Text>
            )}
            </TouchableOpacity>

            {/* Googleログインボタン (白) */}
            <TouchableOpacity
            className="bg-white p-4 rounded-lg items-center mb-6 flex-row justify-center active:bg-gray-200"
            onPress={() => Alert.alert('通知', 'Googleログインは別途設定が必要です')}
            >
            <AntDesign name="google" size={20} color="black" style={{ marginRight: 8 }} />
            <Text className="text-black font-bold text-base">Googleで続行</Text>
            </TouchableOpacity>

            {/* フッターリンク */}
            <View className="items-center space-y-4">
            <View className="flex-row">
                <Text className="text-gray-400 text-xs">初めての方は </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-amber-400 text-xs font-bold">サインアップ</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
                <Text className="text-gray-500 text-xs">ホームへ戻る</Text>
            </TouchableOpacity>
            </View>

        </View>
        </View>
    );
}