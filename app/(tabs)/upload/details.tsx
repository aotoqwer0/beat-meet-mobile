import { APP_MOODS } from '@/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUploadData } from '../../../context/UploadContext';

export default function Step2Details() {
    const router = useRouter();
    const { title, setTitle, description, setDescription, coverImage, setCoverImage, moods, setMoods, shortsStart, setShortsStart, shortsDuration, setShortsDuration, setCurrentStep } = useUploadData();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        if (!result.canceled) setCoverImage(result.assets[0]);
    };

    const toggleMood = (tag: string) => {
        if (moods.includes(tag)) setMoods(moods.filter(m => m !== tag));
        else if (moods.length < 5) setMoods([...moods, tag]);
    };

    useFocusEffect(
        useCallback(() => {
        setCurrentStep(2);
        }, [])
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>

            {/* Cover Image */}
            <Text className="text-gray-400 mb-2 font-bold mt-4">Cover Artwork</Text>
            <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={pickImage} className="w-28 h-28 bg-slate-900 rounded-xl border border-dashed border-slate-700 items-center justify-center overflow-hidden">
                {coverImage ? (
                <Image source={{ uri: coverImage.uri }} className="w-full h-full" />
                ) : (
                <Ionicons name="image-outline" size={30} color="#475569" />
                )}
            </TouchableOpacity>
            <View className="ml-4 flex-1">
                <Text className="text-white font-bold text-base">Select Image</Text>
                <Text className="text-gray-500 text-xs mt-1">Recommend 1:1 square ratio.{'\n'}JPG or PNG.</Text>
            </View>
            </View>

            {/* Inputs */}
            <Text className="text-gray-400 mb-2 font-bold">Track Title *</Text>
            <TextInput
            className="bg-slate-900 text-white p-4 rounded-xl mb-6 border border-slate-800"
            placeholder="e.g. Midnight City"
            placeholderTextColor="#475569"
            value={title}
            onChangeText={setTitle}
            />

            <Text className="text-gray-400 mb-2 font-bold">Description</Text>
            <TextInput
            className="bg-slate-900 text-white p-4 rounded-xl mb-6 border border-slate-800 min-h-[100px]"
            placeholder="Tell the story behind this track..."
            placeholderTextColor="#475569"
            multiline textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            />

            {/* Tags */}
            <Text className="text-gray-400 mb-3 font-bold">Mood Tags (Select up to 5)</Text>
            <View className="flex-row flex-wrap mb-10">
            {APP_MOODS.map((item) => (
                <TouchableOpacity
                key={item.label}
                onPress={() => toggleMood(item.label)}
                className={`flex-row items-center px-4 py-3 rounded-lg mr-2 mb-2 border ${
                    moods.includes(item.label) ? 'bg-amber-400 border-amber-400' : 'bg-slate-900 border-slate-800'
                }`}
                >
                {/* 選択時はアイコンを黒に、未選択時はグレーに */}
                <Ionicons
                    name={item.icon}
                    size={14}
                    color={moods.includes(item.label) ? "black" : "#94a3b8"}
                    style={{ marginRight: 6 }}
                />
                <Text className={`font-bold text-xs ${moods.includes(item.label) ? 'text-black' : 'text-gray-400'}`}>
                    {item.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>

            <View className="mb-10">
            <Text className="text-white text-lg font-bold mb-4">Shorts Preview Settings</Text>
            <View className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <View className="flex-row space-x-4 gap-4">
                <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-2">Start (sec)</Text>
                    <TextInput
                    className="bg-black text-white p-3 rounded-lg border border-slate-700 text-center"
                    keyboardType="numeric"
                    value={String(shortsStart)}
                    onChangeText={(text) => setShortsStart(Number(text) || 0)}
                    />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-400 text-xs mb-2">Duration (sec)</Text>
                    <TextInput
                    className="bg-black text-white p-3 rounded-lg border border-slate-700 text-center"
                    keyboardType="numeric"
                    value={String(shortsDuration)}
                    onChangeText={(text) => setShortsDuration(Number(text) || 0)}
                    />
                </View>
                </View>
                <Text className="text-gray-500 text-xs mt-3 text-center">
                Controls the preview segment in the Shorts feed.
                </Text>
            </View>
            </View>

            {/* Nav Buttons */}
            <View className="flex-row space-x-4 mb-10 gap-6">
            <TouchableOpacity onPress={() => router.back()} className="flex-1 bg-slate-800 py-4 rounded-xl items-center">
                <Text className="text-gray-400 font-bold">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push('/(tabs)/upload/preview')}
                className={`flex-1 py-4 rounded-xl items-center ${title ? 'bg-amber-400' : 'bg-slate-800'}`}
                disabled={!title}
            >
                <Text className={`font-bold ${title ? 'text-black' : 'text-gray-500'}`}>Review</Text>
            </TouchableOpacity>
            </View>

        </ScrollView>
        </KeyboardAvoidingView>
    );
}