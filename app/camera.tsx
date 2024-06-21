import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CameraCapturedPicture,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getPixelMatrix } from "@/utils/image";

const { width: screenWidth } = Dimensions.get("window");
const BUTTON_SIZE = screenWidth * 0.2;
const BUTTON_BORDER_RADIUS = BUTTON_SIZE / 2;

export default function HomeScreen() {
  const { back, canGoBack } = useRouter();
  const insets = useSafeAreaInsets();

  const ref = useRef<CameraView>(null);
  const [imageResult, setImageResult] = useState<CameraCapturedPicture | null>(
    null
  );
  const [permission, requestPermission] = useCameraPermissions();

  const goBack = () => {
    if (imageResult !== null) {
      setImageResult(null);
      return;
    }

    if (canGoBack()) {
      back();
    }
  };

  const gesture = Gesture.Pan()
    .onBegin(() => console.log("Gesture started"))
    .onChange((e) => {
      console.log(
        `Gesture X: ${e.x}, Y: ${e.y}, AbsoluteX: ${e.absoluteX}, AbsoluteY: ${e.absoluteY}`
      );
    })
    .onEnd(() => console.log("Gesture ended"));

  if (!permission) {
    // Camera permissions are still loading.
    return (
      <ThemedView style={styles.loadingView}>
        <ActivityIndicator color="white" size="small" />
      </ThemedView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default" style={styles.permissionText}>
          We need your permission to show the camera
        </ThemedText>
        <Button onPress={requestPermission} title="Grant permission" />
      </ThemedView>
    );
  }

  const takePicture = async () => {
    try {
      console.log("Taking picture");

      const photoResult = await ref.current?.takePictureAsync();
      if (!photoResult) throw new Error("No photo result returned");

      // We need to grab the photo result and create a matrix of its colors.
      setImageResult(photoResult);
      console.log("Set image result");
    } catch (error) {
      console.log("Error occurred: ", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <CameraView ref={ref} style={styles.camera} />

      <ThemedView style={[styles.headerContainer, { top: insets.top }]}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Ionicons name="close" color="white" size={30} />
        </Pressable>
      </ThemedView>

      {/* Snapshot Container */}
      <ThemedView
        style={[
          StyleSheet.absoluteFill,
          styles.controls,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Pressable onPress={takePicture} style={styles.snapshotButton} />
      </ThemedView>

      {imageResult !== null && (
        <GestureDetector gesture={gesture}>
          <ThemedView style={[StyleSheet.absoluteFill, styles.preview]}>
            <Image
              source={{ uri: imageResult.uri }}
              style={styles.previewImage}
            />
          </ThemedView>
        </GestureDetector>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  controls: {
    backgroundColor: "transparent",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  preview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    zIndex: 10,
    backgroundColor: "transparent",
    position: "absolute",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: "100%",
    alignItems: "flex-start",
  },
  snapshotButton: {
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "transparent",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  permissionText: {
    textAlign: "center",
  },
  backButton: {},
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
