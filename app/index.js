import React, { useState, useEffect } from 'react';
import { View, Dimensions, SafeAreaView } from 'react-native';

import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

import Ionicons from '@expo/vector-icons/Ionicons';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from './screens/Login';
import SignUp from './screens/Signup';
import Courses from './screens/Courses';
import Topics from './screens/Topic';
import Question_MC from './screens/Question_MultipleChoice';
import Profile from './screens/Profile';
import Assignments from './screens/Assignments';
import Question_Daily from './screens/Question_Daily';
import Video from './screens/Videos';
import TeacherDashboard from './screens/TeacherDashboard';

import { UserProvider, useUser } from './components/UserContext';
import { getLoginInfo } from './components/SecureStoreUtils';


const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

// Creating Home Tab Navigator
const HomeTab = createBottomTabNavigator();
function HomeTabNavigator() {
    return (
        <SafeAreaView style={{ width: width, height: height}}>
            <HomeTab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    if (route.name === 'Courses') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    // You can return any component that you like here!
                    return <Ionicons name={iconName} size={30} color={color} />;
                    },

                    tabBarActiveTintColor: '#004643',
                    tabBarInactiveTintColor: 'grey',
                    headerShown: false,

                    tabBarStyle: { 
                        height: 0.1 * height + 10,
                        marginBottom: 5,
                    },
                    
                    tabBarIconStyle: {
                        marginTop: 7,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        paddingBottom: 15,
                    },
                })}
                initialRouteName='Courses'
            >
            <HomeTab.Screen name='Courses' component={Courses}/>
            <HomeTab.Screen name='Profile' component={Profile}/>
        </HomeTab.Navigator>
      </SafeAreaView>
    );
}

// Creating Stack Navigator
const RootStack = createNativeStackNavigator();
function RootStackNavigator() {
    return (
        <View style={{ height: height, width: width }}>
            <RootStack.Navigator
                detachPreviousScreen={true}
                initialRouteName="Login"
            >
                <RootStack.Screen 
                    name="Login" 
                    component={Login}
                    options={{headerShown: false}}
                />
                <RootStack.Screen 
                    name="SignUp" 
                    component={SignUp}
                    options={{headerShown: false}}
                />
                <RootStack.Screen 
                    name="HomeTab" 
                    component={HomeTabNavigator}
                    options={{headerShown: false}}
                />
                <RootStack.Screen 
                    name="Topics" 
                    component={Topics}
                    options={{headerShown: false}}
                />
                <RootStack.Screen 
                    name="Assignments" 
                    component={Assignments}
                    options={{headerShown: false}}
                />
               
                <RootStack.Screen 
                    name="Question_MC" 
                    component={Question_MC}
                    options={{headerShown: false}}
                />
                <RootStack.Screen
                    name="Question_Daily"
                    component={Question_Daily}
                    options={{headerShown: false}}
                />
                <RootStack.Screen 
                    name="Videos" 
                    component={Video}
                    options={{headerShown: false}}
                />
                <RootStack.Screen 
                    name="TeacherDashboard" 
                    component={TeacherDashboard}
                    options={{headerShown: false}}
                />
            </RootStack.Navigator>
        </View>
    )
}

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    const loadFontsAndInitDb = async () => {
        console.log("Loading fonts");
        await Font.loadAsync({
            'Baloo2-Regular': require('../assets/fonts/Baloo2-Regular.ttf'),
            'Baloo2-Bold': require('../assets/fonts/Baloo2-Bold.ttf'),
        });
    };

    if (!fontsLoaded) {
        return (
            <AppLoading
                startAsync={loadFontsAndInitDb}
                onFinish={() => setFontsLoaded(true)}
                onError={(err) => console.log(err)}
            />
        );
    }

    return (
        <UserProvider>
            <RootStackNavigator />
        </UserProvider>
    );
}
