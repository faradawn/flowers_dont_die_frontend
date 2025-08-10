import { View, Image, ImageBackground, Dimensions, TextInput, Button, SafeAreaView, Modal, ScrollView,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
// import { SelectList } from 'react-native-dropdown-select-list'
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function EditProfile({ navigation }) {
  // const [infoCorrect, setInfoCorrect] = useState(true);
  // const [errorMessage, setErrorMessage] = useState('');
  // const [loginData, setLoginData] = useState(null);

  const { state, updateState } = useUser();
  const [newUsername, setNewUsername] = useState(state.username);
  const [newPassword, setNewPassword] = useState(state.password);
  const [newPhoneNumber, setNewPhoneNumber] = useState(state.phone_number);

  console.log("Debug - Profile Component state:", state);
  console.log("Debug - Profile Component state.uid:", state?.uid);
  console.log("Debug - Is showing login screen:", !state?.uid);
  useEffect(() => {
      console.log("Profile: Current user state:", state);
  }, [state]);
  
  // const handleDelete = async () => {
  //     try {
  //         // Clear local submissions for this user
  //         const result = await clearSubmissions(state.uid);
  //         if (result.status !== "success") {
  //             throw new Error(result.message);
  //         }

  //         // Clear login info from secure storage
  //         await deleteLoginInfo();

  //         // Clear uid from state
  //         updateState('uid', '');
  //         updateState('username', '');

  //         Alert.alert("Account Deleted", "Your account has been successfully deleted.");
          
  //         // Navigate to Courses screen
  //         navigation.navigate('Courses');
  //     } catch (error) {
  //         console.log('Error deleting account: ', error);
  //         Alert.alert("Error", "Failed to delete account. Please try again.");
  //     }
  // };

  // const handleLogout = async () => {
  //   try {
  //       // 1. 清理安全存储
  //       await deleteLoginInfo();
        
  //       // 2. 更新状态
  //       updateState('username', '');
  //       updateState('uid', '');
  //       updateState('is_signed_in', false);
        
  //       // 3. 立即导航到登录页面
  //       navigation.replace('Login'); 
        
  //   } catch (error) {
  //       console.error('Logout error:', error);
  //       Alert.alert("Error", "Failed to sign out. Please try again.");
  //   }
  // };

  const handleUsernameUpdate = async () => {
      if (newUsername.trim() === '') {
          Alert.alert('Error', 'Username cannot be empty');
          return;
      }

      try {
          await updateState('username', newUsername);
          const currentLoginInfo = await getLoginInfo();
          if (currentLoginInfo) {
              await saveLoginInfo(state.uid, newUsername, currentLoginInfo.password);
          } else {
              await saveLoginInfo(state.uid, newUsername, null);
          }

          const newlogin = await getLoginInfo();
          console.log('[Profile] Updated useranme and saved to state and secure storage', newlogin);
      } catch (error) {
          console.error('[Profile] Error updating username:', error);
      }
  };

  const handlePasswordUpdate = async () => {
      if (newPassword.trim() === '') {
          Alert.alert('Error', 'Password cannot be empty');
          return;
      }

      try {
          await updateState('password', newPassword);
          const currentLoginInfo = await getLoginInfo();
          if (currentLoginInfo) {
              await saveLoginInfo(state.uid, currentLoginInfo.username, newPassword);
          } else {
              await saveLoginInfo(state.uid, newPassword, null);
          }

          const newlogin = await getLoginInfo();
          console.log('[Profile] Updated useranme and saved to state and secure storage', newlogin);
      } catch (error) {
          console.error('[Profile] Error updating password:', error);
      }

  };

  const handlePhoneUpdate = async () => {
      if (newPhoneNumber.trim() === '') {
          Alert.alert('Error', 'PhoneNumber cannot be empty');
          return;
      }

      try {
          await updateState('phone_number', newPhoneNumber);
          const currentLoginInfo = await getLoginInfo();
          if (currentLoginInfo) {
              await saveLoginInfo(state.uid, currentLoginInfo.username, newPhoneNumber);
          } else {
              await saveLoginInfo(state.uid, newPhoneNumber, null);
          }

          const newlogin = await getLoginInfo();
          console.log('[Profile] Updated useranme and saved to state and secure storage', newlogin);
      } catch (error) {
          console.error('[Profile] Error updating PhoneNumber:', error);
      }

  };

  let OriginalImage = require('../../assets/images/DefaultAvatar.png')
  
  const ProfilePath = FileSystem.documentDirectory + 'profile.png'

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

  if (!state.is_signed_in) {
      return ( 
        <View
          style={{
              height: height,
              width: width,
              ...globalStyles.container,
              flexDirection: 'column',
              overflow: 'hidden'
          }}
        >
          <TouchableOpacity
              style={{flexDirection: 'row', marginLeft: 0.005 * width}}
              onPress={() => navigation.goBack()}
          >
              <Ionicons name="chevron-back-outline" size={0.032 * height} color="#11403B" style={{padding: 15}}/>
              <Text style= {{
                  fontFamily: 'Baloo2-Regular',
                  fontSize: 0.024 * height,
                  color: '#000000',
                  marginTop: 0.013 * height,
                  marginHorizontal: -8
              }}> 
                  Back
              </Text>
          </TouchableOpacity>

          <Text style={styles.title}>Guest Profile (Uneditable)</Text>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <KeyboardAvoidingView 
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                  style={{alignItems: "center", justifyContent: "center"}}
              >   
                  <ProfilePicture imgSource={OriginalImage} selectedImage={selectedImage} />

                  <View style={[styles.settingsContainer, {marginTop: 0.03 * height}]}>
                    <View style={styles.setContainer}>
                      <Text style={[styles.text, {marginVertical: 0.015 * height}]}>Username</Text>

                      <View style={[styles.setButton, {height: 0.038 * height}]}>
                        <Text style={{fontSize: 0.016 * height, marginLeft: 0.022 * width, color: "#515856" }}>
                            Guest123
                        </Text>
                        <Image style={{marginHorizontal: 0.019 * width}} source={require('../../assets/images/pencil.svg')}/>
                      </View>
                    </View>
                    <View style={styles.line}></View>

                    <View style={styles.setContainer}>
                      <Text style={styles.text}>Password</Text>

                      <View style={[styles.setButton, {height: 0.038 * height}]}>
                        <Text style={{fontSize: 0.016 * height, marginLeft: 0.022 * width, color: "#515856" }}>
                            123456789
                        </Text>
                        <TouchableOpacity onPress={() => handlePasswordUpdate()}>
                          <Image style={{marginHorizontal: 0.019 * width}} source={require('../../assets/images/pencil.svg')}/>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.line}></View>

                    <View style={styles.setContainer}>
                      <Text style={styles.text}>Phone Number</Text>

                      <View style={[styles.setButton, {height: 0.038 * height}]}>
                        <Text style={{fontSize: 0.016 * height, marginLeft: 0.022 * width, color: "#515856" }}>
                            999-999-9999
                        </Text>
                        <TouchableOpacity>
                          <Image style={{marginHorizontal: 0.019 * width}} source={require('../../assets/images/pencil.svg')}/>
                        </TouchableOpacity>                   
                      </View>
                    </View>
                    <View style={[styles.line, {borderColor: 'white', borderBottomColor: 'white'}]}></View>
                  </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
      );
  }



  return ( 
    <View
      style={{
          height: height,
          width: width,
          ...globalStyles.container,
          flexDirection: 'column',
          overflow: 'hidden'
      }}
    >
      <TouchableOpacity
          style={{flexDirection: 'row', marginLeft: 0.005 * width}}
          onPress={() => navigation.goBack()}
      >
          <Ionicons name="chevron-back-outline" size={0.032 * height} color="#11403B" style={{padding: 15}}/>
          <Text style= {{
              fontFamily: 'Baloo2-Regular',
              fontSize: 0.024 * height,
              color: '#000000',
              marginTop: 0.013 * height,
              marginHorizontal: -8
          }}> 
              Back
          </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Your Profile</Text>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{alignItems: "center", justifyContent: "center"}}
          >   
              <ProfilePicture imgSource={OriginalImage} selectedImage={selectedImage} />
              <TouchableOpacity style={styles.upload_button} onPress={() => showImage()}>
                <Image source={require('../../assets/images/pencil.svg')}/>
                <Text style={{ fontFamily: 'Baloo2-Regular', color: '#515856', fontSize: 0.016 * height, margin: 0.014 * width }}>Upload New Image</Text>
              </TouchableOpacity>

              <View style={styles.settingsContainer}>
                <View style={styles.setContainer}>
                  <Text style={[styles.text, {marginVertical: 0.015 * height}]}>Username</Text>

                  <View style={[styles.setButton, {height: 0.038 * height}]}>
                    <TextInput
                        value={newUsername}
                        multiline
                        style={{fontSize: 0.016 * height, marginLeft: 0.022 * width, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewUsername}
                        autoFocus
                        onSubmitEditing={handleUsernameUpdate}
                    />
                    <Image style={{marginHorizontal: 0.019 * width}} source={require('../../assets/images/pencil.svg')}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Password</Text>

                  <View style={[styles.setButton, {height: 0.038 * height}]}>
                    <TextInput 
                        value={state.password}
                        multiline
                        style={{fontSize: 0.016 * height, marginLeft: 0.022 * width, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewPassword}
                        autoFocus
                        onSubmitEditing={handlePasswordUpdate}
                    />
                    <TouchableOpacity onPress={() => handlePasswordUpdate()}>
                      <Image style={{marginHorizontal: 0.019 * width}} source={require('../../assets/images/pencil.svg')}/>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Phone Number</Text>

                  <View style={[styles.setButton, {height: 0.038 * height}]}>
                    <TextInput 
                        value={newPhoneNumber}
                        multiline
                        style={{fontSize: 0.016 * height, marginLeft: 0.022 * width, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewPhoneNumber}
                        autoFocus
                        onSubmitEditing={handlePhoneUpdate}
                    />
                    <TouchableOpacity onPress={() => handlePhoneUpdate()}>
                      <Image style={{marginHorizontal: 0.019 * width}} source={require('../../assets/images/pencil.svg')}/>
                    </TouchableOpacity>                   
                  </View>
                </View>
                {/* <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Time Zone</Text>
                  <SelectList 
                    setSelected={(val) => setTimezone(val)} 
                    data={timezones} 
                    save="value"
                    color="#515856"
                    fontFamily='Baloo2-Regular'
                    arrowicon={<Ionicons name="chevron-down" size={20} color="#515856" style={{padding: 10, marginRight: -0.04 * width}}/>}
                    defaultOption={{key: '9', value: 'GMT-5'}}
                    boxStyles={[styles.setButton, {height: 0.038 * height}]}
                    inputStyles={[styles.button_text, {marginLeft: -0.015 * width}]}
                    dropdownStyles={{backgroundColor: "#f6f6f6"}}
                    dropdownTextStyles={styles.button_text}
                  />
                </View>
                <View style={styles.line}></View> */}

                {/* <View style={styles.setContainer}>
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
                </View>  */}
                <View style={[styles.line, {borderColor: 'white', borderBottomColor: 'white'}]}></View>
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
    fontSize: 0.026 * height,
    justifyContent: 'flex-start',
    marginLeft: 0.05 * width,
    marginTop: 0.01 * height,
    marginBottom: 0.012 * height
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
    marginVertical: 0.02 * height,
    height: 0.04 * height,
    width: 0.39 * width,
  },
  line: {
    borderColor: '#eeeeee',
    borderBottomColor: '#eeeeee', 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderWidth: 1,
    borderRadius: 2,
    marginHorizontal: 0.035 * width,
    marginVertical: 0.0015 * height,
  },
  settingsContainer: {
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
    marginLeft: 0.048 * width,
    marginVertical: 0.014 * height,
    color: '#141917', 
    fontSize: 0.022 * height, 
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
    marginRight: 0.048 * width,
  },
  button_text: {
    fontSize: 0.016 * height, 
    color: "#515856" 
  },
});