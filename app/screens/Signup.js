import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Dimensions,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import { useUser } from '../components/UserContext';
import { saveLoginInfo } from '../components/SecureStoreUtils';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function SignUp({ navigation }) {
  // 本地状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [infoCorrect, setInfoCorrect] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 键盘显示/隐藏状态
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 从 UserContext 获取更新全局状态的方法
  const { updateState } = useUser();

  // 监听键盘事件
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // 点击空白处隐藏键盘
  const dismissKeyboard = () => Keyboard.dismiss();

  // 提交注册
  const signupAttempt = async () => {
    // 简单的本地校验
    if (username.length < 3) {
      setInfoCorrect(false);
      setErrorMessage('Username must be at least 3 characters');
      return;
    }
    if (password.length < 4) {
      setInfoCorrect(false);
      setErrorMessage('Password must be at least 4 characters');
      return;
    }
    if (confirmPassword !== password) {
      setInfoCorrect(false);
      setErrorMessage('Passwords do not match');
      return;
    }

    // 向后端发出请求
    try {
      const response = await fetch('https://backend.faradawn.site:8001/create_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        setInfoCorrect(true);
        // 更新全局用户信息
        updateState('uid', data.uid);
        updateState('username', username);
        updateState('is_signed_in', true);

        // 保存登录信息
        await saveLoginInfo(data.uid, username, password);

        // 跳转到主界面（或其他页面）
        navigation.navigate('HomeTab');
      } else if (data.message === 'User already exists') {
        setInfoCorrect(false);
        setErrorMessage('Username already taken');
      } else {
        setInfoCorrect(false);
        setErrorMessage('Error creating account');
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
      setInfoCorrect(false);
      setErrorMessage('Network error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View
        style={[
          styles.backgroundContainer,
          keyboardVisible ? { justifyContent: 'flex-start' } : { justifyContent: 'space-between' },
        ]}
      >
        {/* 顶部花朵Logo和标题 */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View
            style={[
              styles.iconContainer,
              keyboardVisible && {
                height: height * 0.15,
                paddingTop: height * 0.05,
              },
            ]}
          >
            <Image
              style={styles.flowerImage}
              resizeMode="contain"
              source={require('../../assets/images/FlowerIcon.jpg')} 
            />
            <Text style={styles.appTitle}>Coding Flora</Text>
          </View>
        </TouchableWithoutFeedback>

        {/* 注册表单区域 */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>Sign Up</Text>

          {/* 如果有错误，显示提示 */}
          {!infoCorrect && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* 用户名输入框 */}
          <View style={styles.fields}>
            <View style={styles.textInputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Input"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  onChangeText={setUsername}
                  value={username}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="username"
                />
              </View>
            </View>

            {/* 密码输入框 */}
            <View style={styles.textInputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Input"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  onChangeText={setPassword}
                  value={password}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="oneTimeCode"
                />
              </View>
            </View>

            {/* 确认密码输入框 */}
            <View style={styles.textInputGroup}>
              <Text style={styles.inputLabel}>Confirm your password</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.input}
                  placeholder="Input"
                  placeholderTextColor="rgba(0, 0, 0, 0.5)"
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="oneTimeCode"
                />
              </View>
            </View>
          </View>

          {/* 已有账号? 链接到登录 */}
          <Text style={styles.signupText}>
            Already have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation.navigate('Login')}>
              Sign in here
            </Text>
          </Text>

          {/* 注册按钮 */}
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.largeButton}
              onPress={() => {
                Keyboard.dismiss();
                setTimeout(signupAttempt, 100);
              }}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// 与 login 保持相同配色与布局风格
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b7c7b',
  },
  backgroundContainer: {
    flex: 1,
    width: width,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height * 0.20,
    height: height * 0.3,
  },
  flowerImage: {
    height: height * 0.12,
    width: height * 0.12,
    borderRadius: height * 0.06,
    backgroundColor: 'white',
    padding: 10,
  },
  appTitle: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: Math.min(36, height * 0.043),
    color: 'white',
    letterSpacing: 0.3,
    marginTop: 15,
  },
  signInContainer: {
    width: width,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: height * 0.03,
  },
  signInTitle: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    alignSelf: 'center',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'Baloo2-Bold',
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  fields: {
    gap: 18,
    width: '100%',
    marginBottom: height * 0.02,
  },
  textInputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Baloo2-Regular',
  },
  inputBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8c9391',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Baloo2-Regular',
    padding: 0,
  },
  signupText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#515856',
    marginBottom: 15,
    marginTop: 5,
    letterSpacing: 0.2,
    lineHeight: 20,
    alignSelf: 'flex-start',
  },
  signupLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#f8a101',
    fontWeight: '700',
  },
  button: {
    gap: 10,
    alignItems: 'center',
    width: '100%',
  },
  largeButton: {
    backgroundColor: '#4b7c7b',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    width: '100%',
    marginBottom: height * 0.068,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Baloo2-SemiBold',
    fontWeight: '600',
  },
});