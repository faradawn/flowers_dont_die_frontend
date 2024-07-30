import React, { useState } from 'react';
import { View, Image, ImageBackground, Dimensions, TextInput,
    Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function SignUp({ navigation }){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [infoCorrect, setInfoCorrect] = useState(true);
    const [errorMessage, setErrorMessage] = useState();

    const { updateState } = useUser();

    // handles signup attempts from the user
    const signupAttempt = async() => {
        if(username.length < 3) {
            setInfoCorrect(false);
            setErrorMessage('Username must be at least 3 characters');
            return;
        }

        if(password.length < 4) {
            setInfoCorrect(false);
            setErrorMessage('Password must be at least 4 characters');
            return;
        }

        if(confirmPassword != password) {
            setInfoCorrect(false);
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            const response = await fetch(
				'http://129.114.24.200:8001/create_user', {
					method: 'POST',
					headers: {
					    "Content-Type": "application/json",
					},
					body: JSON.stringify({
						username: username,
						password: password,
					}),
				}
            )

            const data = await response.json();

            if (data.status == 'success') {
                
                setInfoCorrect(true);
                updateState( 'uid', data.uid )
                updateState( 'username', username )
                navigation.navigate('HomeTab')

            } else if (data.message == 'User already exists') {
                setInfoCorrect(false);
                setErrorMessage('Username already taken')
            } else {
                setInfoCorrect(false);
                setErrorMessage('Error creating account')
            }

        } catch(error) {
            console.log('Error fetching data: ', error);
        }
    }

    return ( 
        <ImageBackground 
            source={require('../../assets/images/LoginBackground.jpg')}
            style={{
                height: height,
                width: width,
                ...globalStyles.container
            }}
        >

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{alignItems: "center", justifyContent: "center"}}>
                
                    {/* Signup Icon + Back Button Header */}
                    <View
                        style={ {
                            height: height * 0.4,
                            width: width,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                        } }
                    >
                        {/* Horizontal back button line */}
                        <TouchableOpacity 
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',

                                marginLeft: 40,
                                marginTop: 0.04 * height,
                                alignSelf: 'flex-start' 
                            }}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Ionicons 
                                size={30}
                                name="chevron-back-outline"
                                color='#F8C660'
                            />
                            <Text
                                style={{
                                    fontFamily: 'Baloo2-Bold',
                                    fontSize: 20,
                                    color: '#F8C660'
                                }}
                            > Back </Text>
                        </TouchableOpacity>
                        
                        {/* Circle icon */}
                        <View
                            style= { {
                                height: 150, 
                                width: 150,
                                borderRadius: 150,

                                backgroundColor: 'white',

                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 0.065 * height,
                            } }
                        >
                            <Text
                                style={ { 
                                    fontFamily: 'Baloo2-Bold',
                                    fontSize: 26,
                                } }
                            >
                                Sign Up
                            </Text>
                        </View>   
                    </View>


                    {/* Forms */}
                    <View
                        style={{
                            height: height * 0.3,
                            width: width * 0.8,
                            alignItems: 'flex-start',
                            justifyContent: 'flex-end',
                        }}
                    >
                        
                        {/* Username input field */}
                        <Text style={globalStyles.inputKey}> Enter Username </Text>
                        <TextInput 
                            style={[
                                { 
                                    height: 0.06 * height, 
                                    width: 0.8 * width,
                                    paddingHorizontal: 20, 
                                }, 
                                globalStyles.textInput
                            ]}
                            placeholder='John Smith'
                            placeholderTextColor='rgba(255, 255, 255, 0.5)'
                            onChangeText={(val) => setUsername(val)}
                            
                            textContentType="oneTimeCode"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* Password input field */}
                        <Text style={globalStyles.inputKey}> Enter Password </Text>
                        <TextInput 
                            style={[
                                { 
                                    height: 0.06 * height, 
                                    width: 0.8 * width,
                                    paddingHorizontal: 20, 
                                }, 
                                globalStyles.textInput
                            ]}
                            placeholder="John Smith's Password"
                            placeholderTextColor='rgba(255, 255, 255, 0.5)'
                            onChangeText={(val) => setPassword(val)}

                            textContentType="oneTimeCode"
                            autoCapitalize="none"
                            autoCorrect={false}

                            secureTextEntry={true}
                        />

                        {/* Confirm Password input field */}
                        <Text style={globalStyles.inputKey}> Confirm Password </Text>
                        <TextInput 
                            style={[
                                { 
                                    height: 0.06 * height, 
                                    width: 0.8 * width,
                                    paddingHorizontal: 20, 
                                }, 
                                globalStyles.textInput
                            ]}
                            placeholder="John Smith's Password (again)"
                            placeholderTextColor='rgba(255, 255, 255, 0.5)'
                            onChangeText={(val) => setConfirmPassword(val)}

                            autoCapitalize="none"
                            autoCorrect={false}

                            secureTextEntry={true}
                        />

                        {/* Error message field */}
                        { infoCorrect ?
                            (
                                <View style={{ height: 23 }}>
                                </View>
                            ) 
                            : 
                            (
                                <Text
                                    style={{
                                        fontFamily: 'Baloo2-Bold',
                                        color: '#FFD912',
                                        alignSelf: 'center',
                                    }}
                                >
                                    {errorMessage}
                                </Text>
                            ) 
                        }
                    </View>


                    {/* Sign Up Button */}
                    <View
                        style={{ 
                            height: 0.1 * height,
                            width: 0.8 * width,

                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <TouchableOpacity
                            style={ [
                                { 
                                    backgroundColor: '#F8C660',
                                    height: 0.06 * height,
                                    width: 0.8 * width,
                                }, 
                                globalStyles.button
                            ] }
                            onPress={() => signupAttempt()}
                        >
                            <Text style={globalStyles.buttonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* placeholder for controlling the layout */}
                    <View style={{ height: 0.1 * height }}></View>
                
                
                </KeyboardAvoidingView>            
            </TouchableWithoutFeedback>
        </ImageBackground>
    )
}