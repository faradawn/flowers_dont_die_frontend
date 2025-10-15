import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveLoginInfo(uid, username, password) {
  const loginInfo = JSON.stringify({ uid, username, password });
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('login-info', loginInfo);
    } else { // mobile
      await SecureStore.setItemAsync('login-info', loginInfo);
    }
  } catch (error) {
    console.error("Error saving data:", error); 
  }
}

export async function getLoginInfo() {
  try {
    if (Platform.OS === 'web') {
      const loginInfo = await AsyncStorage.getItem('login-info');
      return loginInfo ? JSON.parse(loginInfo) : null;
    } else { // mobile
      const loginInfo = await SecureStore.getItemAsync('login-info');
      return loginInfo ? JSON.parse(loginInfo) : null;
    }
  } catch (error) {
    console.error("Error saving data:", error); 
  }
}

export async function deleteLoginInfo() {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.deleteItem('login-info');
    } else { // mobile
      await SecureStore.deleteItemAsync('login-info');
    }
  } catch (error) {
    console.error("Error saving data:", error); 
  }
}
