import React, { useState } from 'react';
import { View, Dimensions, SafeAreaView } from 'react-native';

import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

import Ionicons from '@expo/vector-icons/Ionicons';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Login from './screens/Login';
import SignUp from './screens/Signup';
import Courses from './screens/Courses';
import Question from './screens/Question';
import Profile from './screens/Profile';

import { UserProvider } from './components/UserContext';

// Accessing Font
const getFonts = () => Font.loadAsync({
    'Baloo2-Regular': require('../assets/fonts/Baloo2-Regular.ttf'),
    'Baloo2-Bold': require('../assets/fonts/Baloo2-Bold.ttf'),
});

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

                    tabBarStyle: { height: 0.1 * height}
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
                    name="Question" 
                    component={Question}
                    options={{headerShown: false}}
                />
            </RootStack.Navigator>
        </View>
    )
}

export default function App(){
    const [fontsLoaded, setFontsLoaded] = useState(false);

    if(!fontsLoaded){
        return (
            <AppLoading
                startAsync={getFonts}
                onFinish={()=>setFontsLoaded(true)}
                onError={(err) => console.log(err)}
            />
        )
    }

    return (
        <UserProvider>
            <RootStackNavigator/>
        </UserProvider>
    )
}