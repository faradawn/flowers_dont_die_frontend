// import * as SecureStore from 'expo-secure-store';

// This mock version is provided so that we have a functioning deployed version

export async function saveLoginInfo(uid, username, password) {
  console.log('Mock saveLoginInfo called');
  // No operation performed
}

export async function getLoginInfo() {
  console.log('Mock getLoginInfo called');
  // Return null to indicate no login info
  return null;
}

export async function deleteLoginInfo() {
  console.log('Mock deleteLoginInfo called');
  // No operation performed
}

// export async function saveLoginInfo(uid, username, password) {
//   const loginInfo = JSON.stringify({ uid, username, password });
//   await SecureStore.setItemAsync('login-info', loginInfo);
// }

// export async function getLoginInfo() {
//   const loginInfo = await SecureStore.getItemAsync('login-info');
//   return loginInfo ? JSON.parse(loginInfo) : null;
// }

// export async function deleteLoginInfo() {
//   await SecureStore.deleteItemAsync('login-info');
// }
