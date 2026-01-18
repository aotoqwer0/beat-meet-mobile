import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import React, { createContext, useContext, useState } from 'react';

type UploadContextType = {
    file: DocumentPicker.DocumentPickerAsset | null;
    setFile: (f: DocumentPicker.DocumentPickerAsset | null) => void;
    coverImage: ImagePicker.ImagePickerAsset | null;
    setCoverImage: (i: ImagePicker.ImagePickerAsset | null) => void;
    title: string;
    setTitle: (s: string) => void;
    description: string;
    setDescription: (s: string) => void;
    moods: string[];
    setMoods: (m: string[]) => void;
    shortsStart: number;
    setShortsStart: (n: number) => void;
    shortsDuration: number;
    setShortsDuration: (n: number) => void;
    currentStep: number;
    setCurrentStep: (n: number) => void;

    reset: () => void;
    };

    const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: React.ReactNode }) {
    // ...既存のstate...
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [coverImage, setCoverImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [moods, setMoods] = useState<string[]>([]);
    const [shortsStart, setShortsStart] = useState(30);
    const [shortsDuration, setShortsDuration] = useState(30);


    const [currentStep, setCurrentStep] = useState(1);

    const reset = () => {
        setFile(null); setCoverImage(null); setTitle(''); setDescription(''); setMoods([]);
        setShortsStart(30); setShortsDuration(30);
        setCurrentStep(1); // リセット時は1に戻す
    };

    return (
        <UploadContext.Provider value={{
        file, setFile,
        coverImage, setCoverImage,
        title, setTitle,
        description, setDescription,
        moods, setMoods,
        shortsStart, setShortsStart,
        shortsDuration, setShortsDuration,
        currentStep, setCurrentStep,
        reset
        }}>
        {children}
        </UploadContext.Provider>
    );
    }

    export const useUploadData = () => {
    const context = useContext(UploadContext);
    if (!context) throw new Error('useUploadData must be used within UploadProvider');
  return context;
};