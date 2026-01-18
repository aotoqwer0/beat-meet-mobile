// Ioniconsの型定義用
import { Ionicons } from '@expo/vector-icons';

export type MoodItem = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

export const APP_MOODS: MoodItem[] = [
    { label: "Chill", icon: "cafe-outline" },
    { label: "Trap", icon: "flame-outline" },
    { label: "Lo-Fi", icon: "radio-outline" },
    { label: "Drill", icon: "hammer-outline" },
    { label: "R&B", icon: "heart-outline" },
    { label: "Hip Hop", icon: "mic-outline" },
    { label: "Electronic", icon: "hardware-chip-outline" },
    { label: "Ambient", icon: "cloud-outline" },
    { label: "Phonk", icon: "car-sport-outline" },
    { label: "Jazz", icon: "musical-notes-outline" },
    { label: "Dark", icon: "moon-outline" },
    { label: "Energetic", icon: "flash-outline" },
    { label: "Uplifting", icon: "sunny-outline" },
];