import * as SecureStore from 'expo-secure-store';

export async function saveLoginInfo(uid, username, password) {
  const loginInfo = JSON.stringify({ uid, username, password });
  await SecureStore.setItemAsync('login-info', loginInfo);
}

export async function getLoginInfo() {
  const loginInfo = await SecureStore.getItemAsync('login-info');
  return loginInfo ? JSON.parse(loginInfo) : null;
}

export async function deleteLoginInfo() {
  await SecureStore.deleteItemAsync('login-info');
}
