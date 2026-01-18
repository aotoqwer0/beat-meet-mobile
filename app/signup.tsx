import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignupScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [agreed, setAgreed] = useState(false); // 利用規約のチェック状態
    const router = useRouter();

    // サインアップ処理
    async function signUp() {
        if (!email || !password) {
        Alert.alert('エラー', 'すべての項目を入力してください');
        return;
        }
        if (!agreed) {
        Alert.alert('確認', '利用規約とプライバシーポリシーへの同意が必要です');
        return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
        email,
        password,
        });

        if (error) {
        Alert.alert('登録失敗', error.message);
        } else {
        Alert.alert(
            '確認メールを送信しました',
            'メール内のリンクをクリックして登録を完了してください。完了後、ログインできます。',
            [{ text: 'OK', onPress: () => router.back() }]
        );
        }
        setLoading(false);
    }

    return (
        <View className="flex-1 bg-black justify-center items-center p-4">
        <StatusBar style="light" />

        {/* カードコンテナ */}
        <View className="w-full max-w-sm bg-slate-900 p-6 rounded-2xl border border-slate-800">

            <Text className="text-white text-2xl font-bold mb-6">サインアップ</Text>

            {/* メールアドレス */}
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

            {/* パスワード */}
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

            {/* 利用規約チェックボックスエリア */}
            <TouchableOpacity
            className="flex-row items-center mb-6"
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
            >
            <View className={`w-5 h-5 rounded border border-gray-500 mr-3 items-center justify-center ${agreed ? 'bg-amber-400 border-amber-400' : 'bg-transparent'}`}>
                {agreed && <Ionicons name="checkmark" size={16} color="black" />}
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 text-xs">
                <Text className="text-amber-400 font-bold" onPress={() => router.push('/terms')}>利用規約</Text> と <Text className="text-amber-400 font-bold" onPress={() => router.push('/privacy')}>プライバシーポリシー</Text> に同意します
                </Text>
            </View>
            </TouchableOpacity>

            {/* 登録ボタン (黄色) - 同意していない場合はグレーアウト */}
            <TouchableOpacity
            onPress={signUp}
            disabled={loading || !agreed}
            className={`p-4 rounded-lg items-center mb-4 ${agreed ? 'bg-amber-400 active:bg-amber-500' : 'bg-slate-700'}`}
            >
            {loading ? (
                <ActivityIndicator color="#000" />
            ) : (
                <Text className={`font-bold text-base ${agreed ? 'text-black' : 'text-gray-400'}`}>
                メールで登録
                </Text>
            )}
            </TouchableOpacity>

            {/* 確認メール再送ボタン (枠線のみ) */}
            <TouchableOpacity
            className="p-3 rounded-lg items-center mb-4 border border-slate-600"
            onPress={() => Alert.alert('info', 'メールアドレスを入力して再送処理を行います（未実装）')}
            >
            <Text className="text-gray-400 text-xs">確認メールが届かない場合は再送できます</Text>
            </TouchableOpacity>

            {/* Google登録ボタン (白) */}
            <TouchableOpacity
            className="bg-white p-4 rounded-lg items-center mb-6 flex-row justify-center active:bg-gray-200"
            onPress={() => Alert.alert('通知', 'Google連携は別途設定が必要です')}
            >
            <AntDesign name="google" size={20} color="black" style={{ marginRight: 8 }} />
            <Text className="text-black font-bold text-base">Googleで登録</Text>
            </TouchableOpacity>

            {/* フッターリンク */}
            <View className="items-center flex-row justify-center">
            <Text className="text-gray-400 text-xs">すでにアカウントをお持ちですか？ </Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-amber-400 text-xs font-bold">ログイン</Text>
            </TouchableOpacity>
            </View>

        </View>
        </View>
    );
}