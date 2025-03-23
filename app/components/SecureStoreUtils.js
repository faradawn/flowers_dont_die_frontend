import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveLoginInfo(uid, username, password) {
  const loginInfo = JSON.stringify({ uid, username, password });
  await AsyncStorage.setItem('login-info', loginInfo);
}

export async function getLoginInfo() {
  const loginInfo = await AsyncStorage.getItem('login-info');
  return loginInfo ? JSON.parse(loginInfo) : null;
}

export async function deleteLoginInfo() {
  await AsyncStorage.removeItem('login-info');
}
