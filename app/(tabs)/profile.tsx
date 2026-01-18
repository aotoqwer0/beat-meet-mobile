import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRequireAuth } from "../../hooks/useRequireAuth";
import { API_BASE_URL } from "../../lib/config";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const router = useRouter();
  const { session } = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Profile Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [planId, setPlanId] = useState("free");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [isEmailProvider, setIsEmailProvider] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      // ▼ 修正: セッションがない場合はログイン画面へ
      supabase.auth
        .getSession()
        .then(({ data: { session: currentSession } }) => {
          if (!currentSession) {
            router.replace("/login");
            return;
          }
          // セッションがあればAPI取得開始
          fetchProfileViaAPI(currentSession.access_token);
        });
    }, []),
  );

  async function fetchProfileViaAPI(token: string) {
    try {
      setLoading(true);
      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");

      const res = await fetch(`${cleanBaseUrl}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      setUsername(data.username || "");
      setAvatarUrl(data.avatar_url);
      setEmail(data.email || "");
      setBio(data.bio || "");
      setWebsiteUrl(data.website_url || "");
      setIsEmailProvider(data.provider === "email");

      if (data.plan_id) setPlanId(data.plan_id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ... (以降の pickImage などのロジックと JSX は変更なし。そのまま維持してください)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadAvatar = async () => {
    if (!imageUri || !session?.user) return null;
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();
      const fileExt = imageUri.split(".").pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, arrayBuffer, {
          contentType: blob.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      return data.publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const updateProfileViaAPI = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    try {
      setUpdating(true);

      let finalAvatarUrl = avatarUrl;
      if (imageUri) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
      const token = session?.access_token;

      const payload: any = {
        username,
        email,
        bio,
        website_url: websiteUrl,
        avatar_url: finalAvatarUrl,
      };
      if (newPassword) payload.password = newPassword;

      const res = await fetch(`${cleanBaseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      Alert.alert("Success", "Profile updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setImageUri(null);

      // 更新後に再取得
      if (token) fetchProfileViaAPI(token);
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#fbbf24" />
      </View>
    );
  }

  const displayImage =
    imageUri || avatarUrl || "https://via.placeholder.com/150";
  const isPro = planId !== "free";

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          {/* Header */}
          <View className="py-6 flex-row justify-between items-center">
            <Text className="text-white text-3xl font-black italic tracking-tighter">
              MY <Text className="text-amber-400">PROFILE</Text>
            </Text>
            <TouchableOpacity onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Avatar Section */}
          <View className="items-center mb-8">
            <TouchableOpacity onPress={pickImage} className="relative">
              <Image
                source={{ uri: displayImage }}
                className={`w-32 h-32 rounded-full border-2 bg-zinc-900 ${isPro ? "border-amber-400" : "border-zinc-800"}`}
              />
              <View className="absolute bottom-0 right-0 bg-amber-400 p-2 rounded-full border-4 border-black">
                <Ionicons name="camera" size={20} color="black" />
              </View>
            </TouchableOpacity>
            <Text className="text-zinc-500 text-xs mt-3 font-medium">
              Tap to change avatar
            </Text>
          </View>

          {/* Form Section */}
          <View className="space-y-6">
            <View>
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Username
              </Text>
              <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons
                  name="person"
                  size={18}
                  color="#71717a"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                  placeholderTextColor="#52525b"
                  className="flex-1 text-white font-medium"
                  autoCapitalize="none"
                />
                {isPro && <Ionicons name="star" size={16} color="#fbbf24" />}
              </View>
            </View>

            <View>
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Bio
              </Text>
              <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-start">
                <Ionicons
                  name="information-circle"
                  size={18}
                  color="#71717a"
                  style={{ marginRight: 10, marginTop: 4 }}
                />
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor="#52525b"
                  className="flex-1 text-white font-medium leading-5"
                  multiline
                  numberOfLines={4}
                  style={{ minHeight: 80, textAlignVertical: "top" }}
                />
              </View>
            </View>

            <View>
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Website
              </Text>
              <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons
                  name="globe-outline"
                  size={18}
                  color="#71717a"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={websiteUrl}
                  onChangeText={setWebsiteUrl}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor="#52525b"
                  className="flex-1 text-white font-medium"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </View>

            <View>
              <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                Email
              </Text>
              <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center">
                <Ionicons
                  name="mail"
                  size={18}
                  color="#71717a"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#52525b"
                  className="flex-1 text-white font-medium"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Subscription Section */}
            <View className="mt-8 pt-6 border-t border-zinc-900">
              <Text className="text-white text-lg font-black italic mb-4">
                SUBSCRIPTION
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/subscription/paywall")}
                activeOpacity={0.9}
                className="overflow-hidden rounded-3xl relative shadow-lg shadow-amber-500/20 border border-white/10"
                style={{ minHeight: 110 }}
              >
                <LinearGradient
                  colors={
                    isPro ? ["#18181b", "#09090b"] : ["#f59e0b", "#b45309"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                  }}
                />
                <View className="absolute -bottom-6 -right-6 opacity-10 rotate-12">
                  <Ionicons
                    name={isPro ? "shield-checkmark" : "diamond"}
                    size={140}
                    color={isPro ? "white" : "black"}
                  />
                </View>
                <View
                  className="absolute top-0 bottom-0 left-10 w-24 bg-white/10 -skew-x-12"
                  style={{ transform: [{ skewX: "-20deg" }] }}
                />

                <View className="p-6 flex-row items-center justify-between relative z-10">
                  <View className="flex-1">
                    <View
                      className={`flex-row items-center px-2 py-1 rounded-md self-start mb-2 ${isPro ? "bg-amber-500/20" : "bg-black/20"}`}
                    >
                      <Ionicons
                        name={isPro ? "star" : "sparkles"}
                        size={10}
                        color={isPro ? "#fbbf24" : "black"}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        className={`${isPro ? "text-amber-400" : "text-black"} text-[10px] font-black uppercase tracking-[1px]`}
                      >
                        {isPro ? "Active Plan" : "Recommended"}
                      </Text>
                    </View>

                    <Text
                      className={`${isPro ? "text-white" : "text-black"} text-3xl font-black italic tracking-tighter shadow-sm leading-8`}
                    >
                      {isPro ? "PRO MEMBER" : "GO PREMIUM"}
                    </Text>

                    <Text
                      className={`${isPro ? "text-zinc-400" : "text-amber-950"} font-bold text-xs mt-1 opacity-80`}
                    >
                      {isPro
                        ? "Manage your subscription"
                        : "Unlimited uploads, analytics & more."}
                    </Text>
                  </View>

                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ${isPro ? "bg-zinc-800 border border-zinc-700" : "bg-white/20 border border-white/20 backdrop-blur-md"}`}
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={24}
                      color={isPro ? "white" : "black"}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Security Section (Email Provider Only) */}
            {isEmailProvider && (
              <View className="mt-8 mb-4">
                <Text className="text-white text-lg font-black italic mb-4">
                  SECURITY
                </Text>
                <View className="space-y-4">
                  <View>
                    <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                      New Password
                    </Text>
                    <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center">
                      <Ionicons
                        name="lock-closed"
                        size={18}
                        color="#71717a"
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Min 6 characters"
                        placeholderTextColor="#52525b"
                        className="flex-1 text-white font-medium"
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <View>
                    <Text className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                      Confirm Password
                    </Text>
                    <View className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex-row items-center">
                      <Ionicons
                        name="lock-closed"
                        size={18}
                        color="#71717a"
                        style={{ marginRight: 10 }}
                      />
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Re-enter new password"
                        placeholderTextColor="#52525b"
                        className="flex-1 text-white font-medium"
                        secureTextEntry
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Save Button */}
          <View className="mt-10 mb-20">
            <TouchableOpacity
              onPress={updateProfileViaAPI}
              disabled={updating}
              className={`w-full py-4 rounded-full items-center justify-center flex-row ${
                updating ? "bg-zinc-800" : "bg-amber-400"
              }`}
            >
              {updating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="black"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-black font-black text-base uppercase tracking-wider">
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
