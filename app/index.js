import "@expo/metro-runtime";
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

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

import { UserProvider } from './components/UserContext';

SplashScreen.preventAutoHideAsync();

const HomeTab = createBottomTabNavigator();
function HomeTabNavigator() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <HomeTab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color }) => {
                        let iconName = route.name === 'Courses' ? (focused ? 'home' : 'home-outline') : (focused ? 'settings' : 'settings-outline');
                        return <Ionicons name={iconName} size={30} color={color} />;
                    },
                    tabBarActiveTintColor: '#004643',
                    tabBarInactiveTintColor: 'grey',
                    headerShown: false,
                    tabBarStyle: { height: 70, marginBottom: 5 },
                    tabBarLabelStyle: { fontSize: 12, paddingBottom: 15 },
                })}
                initialRouteName="Courses"
            >
                <HomeTab.Screen name="Courses" component={Courses} />
                <HomeTab.Screen name="Profile" component={Profile} />
            </HomeTab.Navigator>
        </SafeAreaView>
    );
}

const RootStack = createNativeStackNavigator();
function RootStackNavigator() {
    return (
        <View style={{ flex: 1 }}>
            <RootStack.Navigator initialRouteName="HomeTab">
                <RootStack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <RootStack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
                <RootStack.Screen name="HomeTab" component={HomeTabNavigator} options={{ headerShown: false }} />
                <RootStack.Screen name="Topics" component={Topics} options={{ headerShown: false }} />
                <RootStack.Screen name="Assignments" component={Assignments} options={{ headerShown: false }} />
                <RootStack.Screen name="Question_MC" component={Question_MC} options={{ headerShown: false }} />
                <RootStack.Screen name="Question_Daily" component={Question_Daily} options={{ headerShown: false }} />
                <RootStack.Screen name="Videos" component={Video} options={{ headerShown: false }} />
            </RootStack.Navigator>
        </View>
    );
}

export default function App() {
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        const loadResources = async () => {
            try {
                await Font.loadAsync({
                    'Baloo2-Regular': require('./assets/fonts/Baloo2-Regular.ttf'),
                    'Baloo2-Bold': require('./assets/fonts/Baloo2-Bold.ttf'),
                });
            } catch (e) {
                console.warn(e);
            } finally {
                setFontsLoaded(true);
                SplashScreen.hideAsync();
            }
        };
        loadResources();
    }, []);

    if (!fontsLoaded) {
        return null;
    }

    return (
        <UserProvider>
            <RootStackNavigator />
        </UserProvider>
    );
}