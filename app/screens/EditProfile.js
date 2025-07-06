import * as ImagePicker from 'expo-image-picker';
import { View, Image, ImageBackground, Dimensions, TextInput, Button,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import { SelectList } from 'react-native-dropdown-select-list'

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

const ProfilePath = FileSystem.documentDirectory + "username" + "pfp"
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const adjustedHeight = height / 932
const adjustedWidth = width / 430

const timezones = [
  {key: '1', value: 'GMT-12'},
  {key: '2', value: 'GMT-11'},
  {key: '3', value: 'GMT-10'},
  {key: '4', value: 'GMT-9:30'},
  {key: '5', value: 'GMT-9'},
  {key: '6', value: 'GMT-8'},
  {key: '7', value: 'GMT-7'},
  {key: '8', value: 'GMT-6'},
  {key: '9', value: 'GMT-5'},
  {key: '10', value: 'GMT-4'},
  {key: '11', value: 'GMT-3:30'},
  {key: '12', value: 'GMT-3'},
  {key: '13', value: 'GMT-2'},
  {key: '14', value: 'GMT-1'},
  {key: '15', value: 'GMT'},
  {key: '16', value: 'GMT+1'},
  {key: '17', value: 'GMT+2'},
  {key: '18', value: 'GMT+3'},
  {key: '19', value: 'GMT+3:30'},
  {key: '20', value: 'GMT+4'},
  {key: '21', value: 'GMT+4:30'},
  {key: '22', value: 'GMT+5'},
  {key: '23', value: 'GMT+5:30'},
  {key: '24', value: 'GMT+5:45'},
  {key: '25', value: 'GMT+6'},
  {key: '26', value: 'GMT+6:30'},
  {key: '27', value: 'GMT+7'},
  {key: '28', value: 'GMT+8'},
  {key: '29', value: 'GMT+8:45'},
  {key: '30', value: 'GMT+9'},
  {key: '31', value: 'GMT+9:30'},
  {key: '32', value: 'GMT+10'},
  {key: '33', value: 'GMT+10:30'},
  {key: '34', value: 'GMT+11'},
  {key: '35', value: 'GMT+12'},
  {key: '36', value: 'GMT+12:45'},
  {key: '37', value: 'GMT+13'},
  {key: '38', value: 'GMT+14'},
  ]

export default function EditProfile({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timezone, setTimezone] = useState('GMT-5');
  const [infoCorrect, setInfoCorrect] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginData, setLoginData] = useState(null);
  const [passwordLength, setPasswordLength] = useState(78 * adjustedWidth);
  const [phoneLength, setPhoneLength] = useState(99 * adjustedWidth);
  const [usernameLength, setUsernameLength] = useState(36 * adjustedWidth);

  const { updateState } = useUser();

  let OriginalImage = require('../../assets/images/notion_avatars/notion_02.png')

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
    <View
      style={{
          height: height,
          width: width,
          ...globalStyles.container,
          flexDirection: 'column',
      }}
    >
      <TouchableOpacity
          style={{flexDirection: 'row'}}
          onPress={() => navigation.navigate('ProfileView')}
      >
          <Ionicons name="chevron-back" size={24} color="#000000" style={{padding: 15}}/>
          <Text style= {{
              fontFamily: 'Baloo2-Regular',
              fontSize: 20 * adjustedHeight,
              color: '#000000',
              marginTop: 10
          }}> 
              Back
          </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Your Profile</Text>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{flex: 1, alignItems: "center", justifyContent: "center"}}
          >   
              <ProfilePicture imgSource={OriginalImage} selectedImage={selectedImage} />
              <TouchableOpacity style={styles.upload_button} onPress={() => showImage()}>
                <Ionicons name='pencil' size={20} color='#515856'/>
                <Text style={{ fontFamily: 'Baloo2-Regular', color: '#515856', fontSize: 16, margin: 15 }}>Upload New Image</Text>
              </TouchableOpacity>

              <View style={styles.settingsContainer}>
                <View style={styles.setContainer}>
                  <Text style={styles.text}>Username</Text>

                  <View style={styles.setButton}>
                    <TextInput
                        placeholder='Willa'
                        placeholderTextColor='#515856'
                        onChangeText={(val) => setUsername(val)}
                        value={username}
                        multiline
                        onContentSizeChange={(event) =>
                          setUsernameLength(event.nativeEvent.contentSize.width)
                        }
                        style={{ width: usernameLength, fontSize: 16 * adjustedHeight, marginLeft: 10 }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Ionicons name="pencil" size={20} color="#515856" style={{padding: 10}}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Password</Text>

                  <View style={styles.setButton}>
                    <TextInput 
                        placeholder='123456789'
                        placeholderTextColor='#515856'
                        onChangeText={(val) => setPassword(val)}
                        value={password}
                        multiline
                        onContentSizeChange={(event) =>
                          setPasswordLength(event.nativeEvent.contentSize.width)
                        }
                        style={{ width: passwordLength, fontSize: 16 * adjustedHeight, marginLeft: 10 }}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Ionicons name="pencil" size={20} color="#515856" style={{padding: 10}}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Phone Number</Text>

                  <View style={styles.setButton}>
                    <TextInput 
                        placeholder='999-999-9999'
                        placeholderTextColor='#515856'
                        onChangeText={(val) => setPhoneNumber(val)}
                        value={phoneNumber}
                        multiline
                        onContentSizeChange={(event) =>
                          setPhoneLength(event.nativeEvent.contentSize.width)
                        }
                        style={{ width: phoneLength, fontSize: 16 * adjustedHeight, marginLeft: 10}}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Ionicons name="pencil" size={20} color="#515856" style={{padding: 10}}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Time Zone</Text>

                  <SelectList 
                      setSelected={(val) => setTimezone(val)} 
                      data={timezones} 
                      save="value"
                      defaultOption={{timezone}}
                      boxStyles={[styles.setButton, {fontFamily: 'Baloo2-Regular',}]}
                      dropdownStyles={[styles.setButton, {fontFamily: 'Baloo2-Regular',}]}
                  />
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Other</Text>
                  <Ionicons name="chevron-forward" size={20} color="#11403B" style={{padding: 15}}/>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Other</Text>
                  <Ionicons name="chevron-forward" size={20} color="#11403B" style={{padding: 15}}/>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Other</Text>
                  <Ionicons name="chevron-forward" size={20} color="#11403B" style={{padding: 15}}/>
                </View>
                <View style={styles.line}></View>
              </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#141917',
    fontFamily: 'Baloo2-Regular',
    fontSize: 24 * adjustedHeight,
    justifyContent: 'flex-start',
    padding: 15
  },
  upload_button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#4b7c7b',
    borderBottomColor: '#4b7c7b',
    backgroundColor: "#fff",
    borderWidth: 1, 
    borderRadius: 15,
    marginVertical: 30 * adjustedHeight,
    height: 40 * adjustedHeight,
    width: 177 * adjustedWidth,
  },
  line: {
    borderColor: '#dcdcdc',
    borderBottomColor: '#dcdcdc', // Or any color you prefer
    borderBottomWidth: StyleSheet.hairlineWidth, // Creates a thin line
    borderWidth: 1,
    borderRadius: 2,
    marginHorizontal: 15 * adjustedWidth,
    marginVertical: 7 * adjustedHeight, // Adds vertical spacing around the line
  },
  settingsContainer: {
    flex: 3,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 0.91 * width,
  },
  setContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center'
  },
  text: {
    marginLeft: 20 * adjustedWidth,
    marginVertical: 10 * adjustedHeight,
    color: '#141917', 
    fontSize: 20 * adjustedHeight, 
    fontFamily: 'Baloo2-Regular',
  },
  setButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#4b7c7b',
    borderBottomColor: '#4b7c7b',
    backgroundColor: "#f6f6f6",
    borderWidth: 1, 
    borderRadius: 5,
    marginRight: 20 * adjustedWidth,
    marginVertical: 10 * adjustedHeight,
    height: 36 * adjustedHeight
  }
});
