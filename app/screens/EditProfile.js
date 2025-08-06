import { View, Image, ImageBackground, Dimensions, TextInput, Button, SafeAreaView, Modal, ScrollView,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { SelectList } from 'react-native-dropdown-select-list'
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

// adjusted values are for easier pixel scaling with the figma
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
  const defaultUsername = 'Willa'
  const defaultPassword = '123456789'
  const defaultPhoneNumber = '999-999-9999'
  const [timezone, setTimezone] = useState({key: '9', value: 'GMT-5'});

  // const [infoCorrect, setInfoCorrect] = useState(true);
  // const [errorMessage, setErrorMessage] = useState('');
  // const [loginData, setLoginData] = useState(null);

  const { state, updateState } = useUser();
  const [newUsername, setNewUsername] = useState(state.username);
  const [newPassword, setNewPassword] = useState(state.password);
  const [newPhoneNumber, setNewPhoneNumber] = useState(state.phone_number);
  const [modalVisible, setModalVisible] = useState(!state.is_signed_in);

  const [passwordLength, setPasswordLength] = useState(78 * adjustedWidth);
  const [phoneLength, setPhoneLength] = useState(99 * adjustedWidth);
  const [usernameLength, setUsernameLength] = useState(36 * adjustedWidth);

  console.log("Debug - Profile Component state:", state);
  console.log("Debug - Profile Component state.uid:", state?.uid);
  console.log("Debug - Is showing login screen:", !state?.uid);
  useEffect(() => {
      console.log("Profile: Current user state:", state);
  }, [state]);
  const isLoggedIn = state.is_signed_in; 
  
  const handleDelete = async () => {
      try {
          // Clear local submissions for this user
          const result = await clearSubmissions(state.uid);
          if (result.status !== "success") {
              throw new Error(result.message);
          }

          // Clear login info from secure storage
          await deleteLoginInfo();

          // Clear uid from state
          updateState('uid', '');
          updateState('username', '');

          Alert.alert("Account Deleted", "Your account has been successfully deleted.");
          
          // Navigate to Courses screen
          navigation.navigate('Courses');
      } catch (error) {
          console.log('Error deleting account: ', error);
          Alert.alert("Error", "Failed to delete account. Please try again.");
      }
  };

  const handleLogout = async () => {
    try {
        // 1. 清理安全存储
        await deleteLoginInfo();
        
        // 2. 更新状态
        updateState('username', '');
        updateState('uid', '');
        updateState('is_signed_in', false);
        
        // 3. 立即导航到登录页面
        navigation.replace('Login'); 
        
    } catch (error) {
        console.error('Logout error:', error);
        Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleResetProgress = async () => {
      try {
          const result = await clearSubmissions();
          if (result.status === "success") {
              Alert.alert("Success", result.message);
              // Optionally, you can update any relevant state or trigger a refresh here
          } else {
              Alert.alert("Error", result.message);
          }
      } catch (error) {
          console.log('Error resetting progress:', error);
          Alert.alert("Error", "An unexpected error occurred while resetting progress");
      }
  };

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


  const handleContinueAsGuest = async () => {
      try {
          // 生成访客 ID
          const guestId = `guest_${Date.now()}`;
          
          // 更新状态
          updateState('username', `Guest_${guestId}`);
          updateState('uid', guestId);
          updateState('is_signed_in', false);
          
          // 导航到主页
          navigation.navigate('HomeTab');
      } catch (error) {
          console.error('Guest mode error:', error);
          Alert.alert("Error", "Failed to continue as guest. Please try again.");
      }
  }

  let OriginalImage = require('../../assets/images/DefaultAvatar.png')

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
          overflow: 'hidden'
      }}
    >
      <TouchableOpacity
          style={{flexDirection: 'row', marginLeft: 10 * adjustedWidth}}
          onPress={() => navigation.goBack()}
      >
          <Ionicons name="chevron-back-outline" size={28 * adjustedHeight} color="#11403B" style={{padding: 15}}/>
          <Text style= {{
              fontFamily: 'Baloo2-Regular',
              fontSize: 22 * adjustedHeight,
              color: '#000000',
              marginTop: 12 * adjustedHeight,
              marginHorizontal: -8
          }}> 
              Back
          </Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Your Profile</Text>

      <SafeAreaView style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
          >
            <View style={styles.modalView}>
              <Text style={[styles.text, {marginHorizontal: 0}]}>Guests cannot edit their profile.</Text>
              <Text style={[styles.text, {marginHorizontal: 0}]}>Please login to access this page.</Text>

              <TouchableOpacity
                  style={{flexDirection: 'row'}}
                  onPress={() => {
                    setModalVisible(false);
                    navigation.goBack(); 
                  }}
              >
                  <Ionicons name="chevron-back-outline" size={28 * adjustedHeight} color="#11403B" style={{padding: 15}}/>
                  <Text style= {{
                      fontFamily: 'Baloo2-Regular',
                      fontSize: 22 * adjustedHeight,
                      color: '#000000',
                      marginTop: 12 * adjustedHeight,
                      marginHorizontal: -8
                  }}> 
                      Back
                  </Text>
              </TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{alignItems: "center", justifyContent: "center"}}
          >   
              <ProfilePicture imgSource={OriginalImage} selectedImage={selectedImage} />
              <TouchableOpacity style={styles.upload_button} onPress={() => showImage()}>
                <Image source={require('../../assets/images/pencil.svg')}/>
                <Text style={{ fontFamily: 'Baloo2-Regular', color: '#515856', fontSize: 15 * adjustedWidth, margin: 7 * adjustedWidth }}>Upload New Image</Text>
              </TouchableOpacity>

              <View style={styles.settingsContainer}>
                <View style={styles.setContainer}>
                  <Text style={[styles.text, {marginTop: 16 * adjustedHeight}]}>Username</Text>

                  <View style={[styles.setButton, {height: 36 * adjustedHeight}]}>
                    <TextInput
                        value={newUsername}
                        multiline
                        onContentSizeChange={(event) =>
                          setUsernameLength(event.nativeEvent.contentSize.width)
                        }
                        style={{fontSize: 15 * adjustedHeight, marginLeft: 10 * adjustedWidth, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewUsername}
                        autoFocus
                        onSubmitEditing={handleUsernameUpdate}
                    />
                    <Image style={{marginHorizontal: 8 * adjustedWidth}} source={require('../../assets/images/pencil.svg')}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Password</Text>

                  <View style={[styles.setButton, {height: 36 * adjustedHeight}]}>
                    <TextInput 
                        value={newPassword}
                        multiline
                        onContentSizeChange={(event) =>
                          setPasswordLength(event.nativeEvent.contentSize.width)
                        }
                        style={{fontSize: 15 * adjustedHeight, marginLeft: 10 * adjustedWidth, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewPassword}
                        autoFocus
                        onSubmitEditing={handlePasswordUpdate}
                    />
                    <TouchableOpacity onPress={() => handlePasswordUpdate()}>
                      <Image style={{marginHorizontal: 8 * adjustedWidth}} source={require('../../assets/images/pencil.svg')}/>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Phone Number</Text>

                  <View style={[styles.setButton, {height: 36 * adjustedHeight}]}>
                    <TextInput 
                        placeholder={defaultPhoneNumber}
                        placeholderTextColor='#515856'
                        value={newPhoneNumber}
                        multiline
                        onContentSizeChange={(event) =>
                          setPhoneLength(event.nativeEvent.contentSize.width)
                        }
                        style={{fontSize: 15 * adjustedHeight, marginLeft: 10 * adjustedWidth, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewPhoneNumber}
                        autoFocus
                        onSubmitEditing={handlePhoneUpdate}
                    />
                    <TouchableOpacity onPress={() => handlePhoneUpdate()}>
                      <Image style={{marginHorizontal: 8 * adjustedWidth}} source={require('../../assets/images/pencil.svg')}/>
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
                    arrowicon={<Ionicons name="chevron-down" size={20} color="#515856" style={{padding: 10, marginRight: -17 * adjustedWidth}}/>}
                    defaultOption={{key: '9', value: 'GMT-5'}}
                    boxStyles={[styles.setButton, {height: 36 * adjustedHeight}]}
                    inputStyles={[styles.button_text, {marginLeft: -7 * adjustedWidth}]}
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
    fontSize: 24.5 * adjustedHeight,
    justifyContent: 'flex-start',
    marginLeft: 20 * adjustedWidth,
    marginTop: 11 * adjustedHeight,
    marginBottom: 17 * adjustedHeight
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
    marginVertical: 20 * adjustedHeight,
    height: 40 * adjustedHeight,
    width: 172 * adjustedWidth,
  },
  line: {
    borderColor: '#eeeeee',
    borderBottomColor: '#eeeeee', // Or any color you prefer
    borderBottomWidth: StyleSheet.hairlineWidth, // Creates a thin line
    borderWidth: 1,
    borderRadius: 2,
    marginHorizontal: 15 * adjustedWidth,
    marginVertical: 2 * adjustedHeight, // Adds vertical spacing around the line
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
    marginLeft: 20 * adjustedWidth,
    marginVertical: 12 * adjustedHeight,
    color: '#141917', 
    fontSize: 21 * adjustedHeight, 
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
  },
  button_text: {
    fontSize: 15 * adjustedHeight, 
    color: "#515856" 
  },
  modalView: {
    margin: 20 * adjustedHeight,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35 * adjustedHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    
  }
});