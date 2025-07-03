import { ImageSourcePropType, StyleSheet, Image} from 'react-native';

export default function ProfileViewer({ imgSource, selectedImage }) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.profile} />;
}

const styles = StyleSheet.create({
  profile: {
    width: 150,
    height: 150,
    borderRadius: 150 / 2,
    overflow: "hidden",
  },
});
