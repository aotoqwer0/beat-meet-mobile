import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useUploadData } from '../context/UploadContext';

const STEPS = ["Audio", "Details", "Publish"];

export default function UploadProgressBar() {
    const { currentStep } = useUploadData();
    const currentStepIndex = currentStep - 1;

    return (
        <View className="px-6 pb-2 pt-4">
        {/* 👇 レイアウトから移動してきたタイトル部分 */}
        <View className="mb-4">
            <Text className="text-amber-400 text-xs font-bold tracking-[4px] uppercase mb-1">
            Creator Studio
            </Text>
            <Text className="text-white text-4xl font-black italic tracking-tighter shadow-md">
            UPLOAD <Text className="text-zinc-700">///</Text>
            </Text>
        </View>

        {/* 👇 プログレスバー部分 */}
        <View className="flex-row justify-between items-center relative mt-2 mb-4">
            {/* 背景線 */}
            {/* <View className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -z-10 rounded-full" /> */}
            {/* 進行線 */}
            {/* <View
            className="absolute top-1/2 left-0 h-1 bg-amber-400 -z-10 rounded-full"
            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
            /> */}

            {STEPS.map((stepName, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
                <View key={index} className="items-center">
                <View
                    className={`w-10 h-10 rounded-full items-center justify-center border-4 ${isActive ? 'bg-black border-amber-400' : 'bg-zinc-900 border-zinc-800'}`}
                    style={isCurrent ? { shadowColor: '#fbbf24', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 } : undefined}
                >
                    {index < currentStepIndex ? (
                    <Ionicons name="checkmark" size={18} color="#fbbf24" />
                    ) : (
                    <Text className={`font-bold ${isActive ? 'text-amber-400' : 'text-gray-500'}`}>
                        {index + 1}
                    </Text>
                    )}
                </View>
                <Text className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${isActive ? 'text-amber-400' : 'text-gray-600'}`}>
                    {stepName}
                </Text>
                </View>
            );
            })}
        </View>
        </View>
    );
}