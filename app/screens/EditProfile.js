import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import {Text, StyleSheet, View, Image} from 'react-native';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';

import ProfileViewer from '../components/ProfileViewer';

const ProfilePath = FileSystem.documentDirectory + "username" + "pfp"

export default function AboutScreen() {
  let OriginalImage = require('../../assets/images/FlowerIcon.jpg')
  console.log('hi')
  try {
    OriginalImage = FileSystem.getContentUriAsync(ProfilePath)
  } catch (error) {
    OriginalImage = require('../../assets/images/FlowerIcon.jpg');
  }

  const [selectedImage, setSelectedImage] = useState(null);

  const saveImageLocally = async (uri) => {
    try {
      await FileSystem.copyAsync({
        from: uri,
        to: ProfilePath,
      });
      console.log('Image saved');
      return ProfilePath;
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const showImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      saveImageLocally(result.assets[0].uri);
      setSelectedImage(result.assets[0].uri);
    } else {
      alert('You did not select any image.');
    }
  };
  
  return ( 
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ProfileViewer imgSource={OriginalImage} selectedImage={selectedImage} />
      </View>
      <View style={styles.footerContainer}>
        <FontAwesome.Button name="pencil" fontFamily='Baloo2-Bold' color="#696969" backgroundColor="#fff" onPress={showImage} style={styles.upload_button}>
          Upload New Image
        </FontAwesome.Button>
        {/* <Button label="Use this photo" /> */}
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.setContainer}>
          <Text style={styles.text}>Username</Text>
          <FontAwesome.Button name="pencil" fontFamily='Baloo2-Bold' color="#dcdcdc" backgroundColor="#696969" onPress={showImage} style={styles.upload_button}>
            Willia
          </FontAwesome.Button>
        </View>
        <View style={styles.line}></View>

        <View style={styles.setContainer}>
          <Text style={styles.text}>Password</Text>
          <FontAwesome.Button name="pencil" fontFamily='Baloo2-Bold' color="#dcdcdc" backgroundColor="#696969" onPress={showImage} style={styles.upload_button}>
            123456789
          </FontAwesome.Button>
        </View>
        <View style={styles.line}></View>

        <View style={styles.setContainer}>
          <Text style={styles.text}>Phone Number</Text>
          <FontAwesome.Button name="pencil" fontFamily='Baloo2-Bold' color="#dcdcdc" backgroundColor="#696969" onPress={showImage} style={styles.upload_button}>
            999-999-9999
          </FontAwesome.Button>
        </View>
        <View style={styles.line}></View>

        <View style={styles.setContainer}>
          <Text style={styles.text}>Time Zone</Text>
          <Text style={styles.text}>GMT +5</Text>
        </View>
        <View style={styles.line}></View>

        <View style={styles.setContainer}>
          <Text style={styles.text}>Other</Text>
          <Text style={styles.text}>arrow</Text>
        </View>
        <View style={styles.line}></View>

        <View style={styles.setContainer}>
          <Text style={styles.text}>Other</Text>
          <Text style={styles.text}>arrow</Text>
        </View>
        <View style={styles.line}></View>

        <View style={styles.setContainer}>
          <Text style={styles.text}>Other</Text>
          <Text style={styles.text}>arrow</Text>
        </View>
        <View style={styles.line}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#000',
    fontWeight: "bold",
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  upload_button: {
    borderColor: '#d3d3d3',
    borderBottomColor: '#d3d3d3',
    borderWidth: 2, 
    width: 170,
  },
  line: {
    borderColor: '#d3d3d3',
    borderBottomColor: '#d3d3d3', // Or any color you prefer
    borderBottomWidth: StyleSheet.hairlineWidth, // Creates a thin line
    borderWidth: 2,
    borderRadius: 2,
    marginHorizontal: 20,
    marginVertical: 10, // Adds vertical spacing around the line
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginTop: -20,
    width: 300,
  },
  setContainer: {
    justifyContent: 'space-between',
  },
  text: {
    marginLeft: 15,
    marginVertical: 5,
    color: '#696969', 
    fontSize: 20, 
    fontFamily: 'Baloo2-Bold',
  }
});
