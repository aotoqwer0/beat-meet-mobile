import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { useUploadData } from '../../../context/UploadContext';
import { API_BASE_URL } from '../../../lib/config';
import { supabase } from '../../../lib/supabase';

export default function Step3Preview() {
  const router = useRouter();
  const {
    file, title, description, coverImage, moods,
    shortsStart, shortsDuration, reset, setCurrentStep
  } = useUploadData();

  const [uploading, setUploading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep(3);
    }, [])
  );

  // PUT送信（ここは変更なし）
  const uploadToSignedUrl = async (signedUrl: string, fileUri: string, mimeType: string) => {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', mimeType);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(true);
        else reject(new Error(`Upload PUT failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Network error during upload PUT'));
      xhr.send(blob);
    });
  };

  const handleFinalUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0.05);
    setProgressLabel("Initializing...");

    try {
      // 1. トークン取得
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error("Missing auth token. Please log in again.");

      // デバッグログ: トークンがあるか確認
      console.log("Using Token:", token.substring(0, 10) + "...");

      // ⚠️ 修正: ヘッダー定義を共通化（これを全てのAPI呼び出しで使い回す）
      const apiHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // --- A. 音声ファイル：署名付きURL ---
      setProgressLabel("Preparing audio...");
      const audioRes = await fetch(`${API_BASE_URL}/api/storage/signed-url`, {
        method: 'POST',
        headers: apiHeaders, // 共通ヘッダーを使用
        body: JSON.stringify({
          filename: file.name,
          content_type: file.mimeType || 'audio/mpeg',
          kind: 'audio'
        })
      });

      if (!audioRes.ok) throw new Error(`Signed URL API error: ${await audioRes.text()}`);
      const audioData = await audioRes.json();
      setUploadProgress(0.2);

      // --- B. 音声ファイル：PUTアップロード ---
      setProgressLabel("Uploading audio...");
      await uploadToSignedUrl(audioData.uploadUrl, file.uri, file.mimeType || 'audio/mpeg');
      setUploadProgress(0.6);

      // --- C. 画像ファイル (あれば) ---
      let artworkPath = null;
      let artworkBucket = null;

      if (coverImage) {
        setProgressLabel("Uploading artwork...");
        const imgName = coverImage.uri.split('/').pop() || 'cover.jpg';

        const imgRes = await fetch(`${API_BASE_URL}/api/storage/signed-url`, {
          method: 'POST',
          headers: apiHeaders, // 共通ヘッダーを使用
          body: JSON.stringify({
            filename: imgName,
            content_type: coverImage.mimeType || 'image/jpeg',
            kind: 'artwork'
          })
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          await uploadToSignedUrl(imgData.uploadUrl, coverImage.uri, coverImage.mimeType || 'image/jpeg');
          artworkPath = imgData.filePath;
          artworkBucket = imgData.bucket;
        }
        setUploadProgress(0.8);
      }

      // --- D. 完了通知 ---
      setProgressLabel("Finalizing...");
      setUploadProgress(0.9);

      // ⚠️ ここで失敗していた箇所
      console.log("Sending Complete Request to:", `${API_BASE_URL}/api/storage/complete-upload`);

      const completeRes = await fetch(`${API_BASE_URL}/api/storage/complete-upload`, {
        method: 'POST',
        headers: apiHeaders, // 共通ヘッダーを確実に使用
        body: JSON.stringify({
          uploadId: audioData.uploadId,
          filePath: audioData.filePath,
          title: title || file.name,
          visibility: 'public',
          content_type: file.mimeType || 'audio/mpeg',
          artwork_path: artworkPath,
          artwork_bucket: artworkBucket,
          tags: moods,
          shorts_start: shortsStart,
          shorts_duration: shortsDuration
        })
      });

      if (!completeRes.ok) {
        const errorText = await completeRes.text();
        console.error("Finalize Error Body:", errorText);
        throw new Error(`Finalize API error: ${errorText}`);
      }

      setUploadProgress(1.0);
      setProgressLabel("Done!");
      Alert.alert("Success!", "Upload completed!");
      reset();
      router.replace('/(tabs)');

    } catch (err: any) {
      console.error("Upload Error:", err);
      Alert.alert("Upload Failed", err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View className="flex-1 bg-black px-6 pt-6">

      {/* プレビューカード */}
      <View className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-sm flex-1 mb-4">
        <Text className="text-gray-400 text-xs font-bold mb-4 tracking-widest uppercase">Preview Your Upload</Text>

        <View className="flex-row items-start mb-6">
          <Image
            source={coverImage ? { uri: coverImage.uri } : { uri: "https://via.placeholder.com/150" }}
            className="w-24 h-24 rounded-lg bg-black"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white text-2xl font-bold leading-tight mb-1">{title}</Text>
            <Text className="text-gray-400 text-xs mb-2">by You</Text>
            <View className="flex-row flex-wrap">
              {moods.map(m => (
                <Text key={m} className="text-amber-400 text-xs border border-amber-400/30 px-2 py-0.5 rounded mr-1 mb-1">{m}</Text>
              ))}
            </View>
          </View>
        </View>

        <View className="bg-black/40 p-4 rounded-xl mb-4 border border-slate-800/50 flex-row items-center">
           <Ionicons name="musical-note" size={20} color="#fbbf24" />
           <Text className="text-gray-300 ml-3 text-sm font-medium" numberOfLines={1}>{file?.name}</Text>
        </View>

        <View className="flex-row items-center">
           <Ionicons name="time-outline" size={14} color="#94a3b8" />
           <Text className="text-gray-400 text-xs ml-1">Shorts: {shortsStart}s - {shortsStart + shortsDuration}s</Text>
        </View>
      </View>

      {/* プログレスバー */}
      {uploading && (
        <View className="mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-300 text-xs font-bold">{progressLabel}</Text>
            <Text className="text-amber-400 text-xs font-bold">{Math.round(uploadProgress * 100)}%</Text>
          </View>
          <View className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <View
              className="h-full bg-amber-400 rounded-full"
              style={{ width: `${uploadProgress * 100}%` }}
            />
          </View>
        </View>
      )}

      {/* ボタン */}
      <View className="mb-10 flex-row space-x-4 gap-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-1 bg-slate-800 py-4 rounded-xl items-center border border-slate-700"
          disabled={uploading}
        >
          <Text className="text-gray-300 font-bold">Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFinalUpload}
          className={`flex-1 py-4 rounded-xl items-center shadow-lg shadow-amber-400/20 ${uploading ? 'bg-amber-600' : 'bg-amber-400'}`}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text className="text-black font-bold text-lg">Upload</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}