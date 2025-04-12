import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  Dimensions,
  TextInput,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';

import { useUser } from '../components/UserContext';
import { saveLoginInfo } from '../components/SecureStoreUtils';

// 屏幕尺寸常量
const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function Login({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [infoCorrect, setInfoCorrect] = useState(true);
  const { updateState } = useUser();
  
  // 添加键盘状态跟踪
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // 添加键盘事件监听
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // 登录功能
  const loginAttempt = async () => {
    try {
      const response = await fetch('https://backend.faradawn.site:8001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log('Received login data: ', data);
      if (data.status === 'success') {
        setInfoCorrect(true);
        updateState('uid', data.uid);
        updateState('username', username);
        updateState('is_signed_in', true);
        setUsername('');
        setPassword('');
        await saveLoginInfo(data.uid, username, password);
        navigation.navigate('HomeTab');
      } else {
        setInfoCorrect(false);
      }
    } catch (error) {
      console.log('Error fetching data: ', error);
      setInfoCorrect(false);
    }
  };

  // 点击空白区域关闭键盘
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      // 调整键盘弹出时的 offset，使 sign in 区域上移更多
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={[
        styles.backgroundContainer,
        // 根据键盘状态调整布局
        keyboardVisible ? { justifyContent: 'flex-start' } : { justifyContent: 'space-between' }
      ]}>
        {/* 顶部图标区域，可点击关闭键盘 */}
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={[
            styles.iconContainer,
            // 根据键盘状态调整图标区域高度和间距
            keyboardVisible && { 
              height: height * 0.15, 
              paddingTop: height * 0.05 
            }
          ]}>
            <Image
              style={styles.flowerImage}
              resizeMode="contain"
              source={require('../../assets/images/FlowerIcon.jpg')}
            />
            <Text style={styles.appTitle}>Coding Flora</Text>
          </View>
        </TouchableWithoutFeedback>
        
        {/* 登录表单区域 */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInTitle}>Sign In</Text>

          {!infoCorrect && (
            <Text style={styles.errorText}>
              Invalid username or wrong password.
            </Text>
          )}

          <View style={styles.fields}>
            {/* 用户名输入 */}
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
                  // 禁用iOS输入建议
                  autoComplete="off"
                  textContentType="username"
                  secureTextEntry={false}
                  keyboardType="default"
                />
              </View>
            </View>

            {/* 密码输入 */}
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
                  // 禁用iOS输入建议的完整组合
                  autoComplete="off"
                  textContentType="oneTimeCode"
                />
              </View>
            </View>
          </View>

          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation.navigate('SignUp')}>
              Sign up now!
            </Text>
          </Text>

          <View style={styles.button}>
            {/* 登录按钮 */}
            <TouchableOpacity
              style={styles.largeButton}
              onPress={() => {
                // 先关闭键盘，再执行登录
                Keyboard.dismiss();
                setTimeout(loginAttempt, 100);
              }}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            
            {/* 忘记密码文本 */}
            <Text style={styles.forgetPassword}>Forget Password?</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4b7c7b',
  },
  backgroundContainer: {
    flex: 1,
    width: width,
    justifyContent: 'space-between', // 确保图标区域在上，表单区域在下
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
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Baloo2-SemiBold',
    fontWeight: '600',
  },
  forgetPassword: {
    fontSize: 14,
    color: '#515856',
    fontFamily: 'Baloo2-Regular',
    marginBottom: height * 0.05,
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
});