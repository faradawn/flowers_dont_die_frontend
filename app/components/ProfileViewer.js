import { ImageSourcePropType, StyleSheet, Image, Dimensions,} from 'react-native';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const adjustedHeight = height / 932
const adjustedWidth = width / 430

export default function ProfileViewer({ imgSource, selectedImage }) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.profile} />;
}

const styles = StyleSheet.create({
  profile: {
    width: 150,
    height: 150,
    borderRadius: (150) / 2,
    overflow: "hidden",
  },
});
