import { Stack } from "expo-router";
import { View } from "react-native";
import UploadProgressBar from "../../../components/UploadProgressBar";
import { UploadProvider } from "./../../../context/UploadContext";

export default function UploadLayout() {
  return (
    <UploadProvider>
      <View className="flex-1 bg-black">
        {/* プログレスバーを常駐させてシームレスにする */}
        <UploadProgressBar />

        <Stack screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 250,
          contentStyle: { backgroundColor: 'black' }
        }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="details" />
          <Stack.Screen name="preview" />
        </Stack>
      </View>
    </UploadProvider>
  );
}