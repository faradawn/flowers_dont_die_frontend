import { ImageSourcePropType, StyleSheet, Image, Dimensions,} from 'react-native';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const adjustedHeight = height / 932
const adjustedWidth = width / 430

export default function ProfilePicture({ imgSource, selectedImage }) {
  const imageSource = selectedImage ? { uri: selectedImage } : imgSource;

  return <Image source={imageSource} style={styles.profile} />;
}

const styles = StyleSheet.create({
  profile: {
    width: 155,
    height: 155,
    borderRadius: (155) / 2,
    overflow: "hidden",
  },
});
