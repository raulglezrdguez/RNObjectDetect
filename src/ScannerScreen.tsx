import React, { useEffect, useState } from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedProps,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { labelImage } from 'vision-camera-image-labeler';

import styles from './styles';

export default function ScannerScreen() {
  const [hasPermission, setHasPermission] = useState(false);

  const devices = useCameraDevices('wide-angle-camera');
  const device = devices.back;

  const currentLabel = useSharedValue('');

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
    return () => {
      console.log('unmounted');
    };
  }, []);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const labels = labelImage(frame);

      console.log('Labels: ', labels);
      currentLabel.value = labels[0]?.label;
    },
    [currentLabel],
  );

  const AnimatedText = Animated.createAnimatedComponent(TextInput);

  const labelText = useAnimatedProps(
    () => ({
      text: currentLabel.value,
    }),
    [currentLabel.value],
  );

  return (
    <View style={styles.container}>
      {device != null && hasPermission ? (
        <>
          <Camera
            device={device}
            isActive={true}
            style={styles.camera}
            frameProcessor={frameProcessor}
            frameProcessorFps={1}
          />

          <AnimatedText
            style={styles.text}
            //@ts-expect-error native `text` prop isn't exposed in `TextInputProps`
            animatedProps={labelText}
            editable={false}
            multiline={true}
          />
        </>
      ) : (
        <ActivityIndicator size="small" />
      )}
    </View>
  );
}
