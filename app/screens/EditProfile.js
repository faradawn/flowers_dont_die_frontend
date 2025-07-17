import { View, Image, ImageBackground, Dimensions, TextInput, Button, SafeAreaView,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { SelectList } from 'react-native-dropdown-select-list'
import {Calendar, LocaleConfig} from 'react-native-calendars';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const adjustedHeight = height / 932
const adjustedWidth = width / 430
const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const username = 'Name Name'
const joinDate = '2024-01-24'

const joinMonth = months[parseInt(joinDate.slice(5,7))]
const joinDay = joinDate.slice(8)
const joinYear = joinDate.slice(0,4)

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

// const ProfileTab = createBottomTabNavigator();
// function ProfileTabNavigator() {
//     return (
//         <SafeAreaView style={{ width: width, height: height}}>
//             <ProfileTab.Navigator
//                 screenOptions={({ route }) => ({
//                     tabBarIcon: ({ focused, color }) => {
//                     let iconName;

//                     if (route.name === 'Edit Profile') {
//                         iconName = focused ? 'home' : 'home-outline';
//                     } else if (route.name === 'View Profile') {
//                         iconName = focused ? 'settings' : 'settings-outline';
//                     }

//                     // You can return any component that you like here!
//                     return <Ionicons name={iconName} size={30} color={color} />;
//                     },

//                     tabBarActiveTintColor: '#004643',
//                     tabBarInactiveTintColor: 'grey',
//                     headerShown: false,

//                     tabBarStyle: { 
//                         height: 0.1 * height + 10,
//                         marginBottom: 5,
//                     },
                    
//                     tabBarIconStyle: {
//                         marginTop: 7,
//                     },
//                     tabBarLabelStyle: {
//                         fontSize: 12,
//                         paddingBottom: 15,
//                     },
//                 })}
//                 initialRouteName='Edit Profile'
//             >
//             <ProfileTab.Screen name='Edit Profile' component={EditProfile}/>
//             <ProfileTab.Screen name='View Profile' component={ProfileView}/>
//         </ProfileTab.Navigator>
//       </SafeAreaView>
//     );
// }

export default function EditProfile({ navigation }) {
  const defaultUsername = 'Willa'
  const defaultPassword = '123456789'
  const [phoneNumber, setPhoneNumber] = useState('999-999-9999');
  const [timezone, setTimezone] = useState({key: '9', value: 'GMT-5'});

  const [infoCorrect, setInfoCorrect] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginData, setLoginData] = useState(null);

  const [passwordLength, setPasswordLength] = useState(78 * adjustedWidth);
  const [phoneLength, setPhoneLength] = useState(99 * adjustedWidth);
  const [usernameLength, setUsernameLength] = useState(36 * adjustedWidth);

  const { state, updateState } = useUser();
  const [newUsername, setNewUsername] = useState(state.username);
  const [newPassword, setNewPassword] = useState(state.password);

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
              fontSize: 22 * adjustedHeight,
              color: '#000000',
              marginTop: 10,
              marginHorizontal: -8
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
                <Text style={{ fontFamily: 'Baloo2-Regular', color: '#515856', fontSize: 15, margin: 15 }}>Upload New Image</Text>
              </TouchableOpacity>

              <View style={styles.settingsContainer}>
                <View style={styles.setContainer}>
                  <Text style={[styles.text, {marginTop: 25 * adjustedHeight}]}>Username</Text>

                  <View style={styles.setButton}>
                    <TextInput
                        placeholder={defaultUsername}
                        placeholderTextColor='#515856'
                        value={newUsername}
                        multiline
                        onContentSizeChange={(event) =>
                          setUsernameLength(event.nativeEvent.contentSize.width)
                        }
                        style={{ width: usernameLength, fontSize: 15 * adjustedHeight, marginLeft: 10, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewUsername}
                        autoFocus
                        onSubmitEditing={handleUsernameUpdate}
                    />
                    <Ionicons name="pencil" size={20} color="#515856" style={{padding: 10}}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Password</Text>

                  <View style={styles.setButton}>
                    <TextInput 
                        placeholder={defaultPassword}
                        placeholderTextColor='#515856'
                        value={newPassword}
                        multiline
                        onContentSizeChange={(event) =>
                          setPasswordLength(event.nativeEvent.contentSize.width)
                        }
                        style={{ width: passwordLength, fontSize: 15 * adjustedHeight, marginLeft: 10, color: "#515856" }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setNewPassword}
                        autoFocus
                        onSubmitEditing={handlePasswordUpdate}
                    />
                    <Ionicons name="pencil" size={20} color="#515856" style={{padding: 10}}/>
                  </View>
                </View>
                <View style={styles.line}></View>

                <View style={styles.setContainer}>
                  <Text style={styles.text}>Phone Number</Text>

                  <View style={styles.setButton}>
                    <TextInput 
                        placeholder={phoneNumber}
                        placeholderTextColor='#515856'
                        onChangeText={(val) => setPhoneNumber(val)}
                        value={phoneNumber}
                        multiline
                        onContentSizeChange={(event) =>
                          setPhoneLength(event.nativeEvent.contentSize.width)
                        }
                        style={{ width: phoneLength, fontSize: 15 * adjustedHeight, marginLeft: 10, color: "#515856" }}
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
                      color="#515856"
                      fontFamily='Baloo2-Regular'
                      arrowicon={<Ionicons name="chevron-down" size={20} color="#000000" style={{padding: 10}}/>}
                      defaultOption={timezone}
                      boxStyles={[styles.setButton, styles.text]}
                      dropdownStyles={[styles.setButton, styles.text]}
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
    fontSize: 25 * adjustedHeight,
    justifyContent: 'flex-start',
    padding: 15,
    marginBottom: 30 * adjustedHeight
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
    width: 172 * adjustedWidth,
  },
  line: {
    borderColor: '#dcdcdc',
    borderBottomColor: '#dcdcdc', // Or any color you prefer
    borderBottomWidth: StyleSheet.hairlineWidth, // Creates a thin line
    borderWidth: 1,
    borderRadius: 2,
    marginHorizontal: 15 * adjustedWidth,
    marginVertical: 6 * adjustedHeight, // Adds vertical spacing around the line
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
    marginVertical: 10 * adjustedHeight,
    color: '#141917', 
    fontSize: 22 * adjustedHeight, 
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