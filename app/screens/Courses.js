import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
    View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity, Image
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import SwitchButton from '../components/SwitchButton';
import Card from '../components/CourseCard';
import { useUser } from '../components/UserContext';
import { getLoginInfo, saveLoginInfo } from '../components/SecureStoreUtils';
import { getCourses, initializeLocalDatabase } from '../components/localDb';

import { myImages } from '../globalStyles/globalStyles';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Courses({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [dailyQuestionId, setDailyQuestionId] = useState(null); // daily random question
    const { state, updateState } = useUser();
    const [greeting, setGreeting] = useState('');

    const getGreeting = () => {
        const hour = new Date().getHours();
        const dayOfWeek = new Date().getDay(); // 0 (Sunday) to 6 (Saturday)
        let greetings;

        if (hour >= 6 && hour < 9) {
            greetings = [
                "Rise and shine!",
                "Early bird catches the code!",
                "Good morning! Ready to tackle the day?"
            ];
        } else if (hour >= 9 && hour < 12) {
            greetings = [
                "Let's make today great!",
                "Time for some morning code!",
                "Coffee's ready!"
            ];
        } else if (hour >= 12 && hour < 14) {
            greetings = [
                "Lunch time! Don't skip it!",
                "Refuel and recharge!",
                "Midday munchies calling!"
            ];
        } else if (hour >= 14 && hour < 17) {
            greetings = [
                "Keep up the awesome work!",
                "Afternoon hustle mode: ON!",
                "You're rocking it!"
            ];
        } else if (hour >= 17 && hour < 20) {
            greetings = [
                "Evening already? Time flies!",
                "How was your day?",
                "Great job today!"
            ];
        } else if (hour >= 20 && hour < 22) {
            greetings = [
                "Relax and unwind!",
                "Evening coding session ahead?",
                "You've earned some rest!"
            ];
        } else if (hour >= 22 || hour < 0) {
            greetings = [
                "Burning the midnight oil?",
                "Late-night inspiration strikes!",
                "Time to wrap up, don't you think?"
            ];
        } else {
            greetings = [
                "Night owl mode activated!",
                "Don't forget to rest!",
                "The code can wait till morning!"
            ];
        }

        // Select greeting based on the day of the week
        return greetings[dayOfWeek % greetings.length];
    };

    useFocusEffect(
        useCallback(() => {
            async function checkAndSetupUser() {
                if (!state.uid || !state.username) {
                    const loginInfo = await getLoginInfo();
                    console.log("[Courses] state.uid is not set, printing state info", state);
                    if (loginInfo) {
                        updateState('username', loginInfo.username);
                        updateState('uid', loginInfo.uid);
                        console.log("[Courses] Got secure store login info: ", loginInfo);
                    } else {
                        const guestUid = `guest_${Math.random().toString(36).substr(2, 9)}`;
                        const guestUsername = `Guest_${guestUid.slice(-3)}`;
                        updateState('username', guestUsername);
                        updateState('uid', guestUid);
                        await saveLoginInfo(guestUid, guestUsername, null);
                        console.log("[Courses] No secure store login info. Created and stored guest info", guestUsername, guestUid);
                    }
                } else {
                    console.log("[Courses] User info already in state:", state);
                }

                setGreeting(getGreeting());
            }

            async function fetchCourses() {
                if (!state.uid) return;
                try {
                    await initializeLocalDatabase(); // Initialize database before fetching
                    const data = await getCourses(state.uid);
                    console.log("[Courses] Received from localDb: ", "uid", state.uid, "courses", data.courses);
                    setCourses(data.courses);
                    setDailyQuestionId(data.daily_question_id);
                } catch (error) {
                    console.error('[Courses] Error fetching or parsing data:', error);
                } finally {
                    setIsLoading(false);
                }
            }

            checkAndSetupUser().then(() => fetchCourses());
        }, [state.uid, state.username])
    );

    // navigation through clicking a specific topic
    const coursePress = (course_id) => {
        updateState('course_id', course_id)
        navigation.navigate('Topics')
    }

    // Navigation when selecting the random question
    const randomQuestionPress = () => {
        if (dailyQuestionId) {
            console.log('Daily question: ', dailyQuestionId);
            updateState('course_id', 'Algo Group')
            navigation.navigate('Question_Daily', { 
                question_id: dailyQuestionId,
                fromScreen: 'HomeTab',
            });
        } else {
            console.log("[HomeTab] No daily question ID available");
        }
    };


    return (
        <View
            style={{
                height: height,
                width: width,
                ...globalStyles.container
            }}
        >
            {isLoading ? (<ActivityIndicator />) :
                (
                    <View>

                        {/* Message At The Top */}
                        <View
                            style={{
                                minHeight: height * 0.06,
                                width: width,
                                paddingHorizontal: 30, // Add horizontal padding
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: 'Baloo2-Bold',
                                    fontSize: 22,
                                    textAlign: 'center', // Center-align the text
                                }}
                                numberOfLines={2} // Allow up to 2 lines
                                adjustsFontSizeToFit={true} // Automatically adjust font size if needed
                            >
                                {greeting}{' '}
                                <Text style={{ color: '#26C250' }}>
                                    {state.username}!
                                </Text>
                            </Text>
                        </View>

                        {/* <View
                            style={{
                                height: height * 0.2,
                                width: width,
                                
                                marginBottom: height * 0.03,

                                alignItems: 'center',
                                justifyContent: 'center',
                            }}

                        >

                            <TouchableOpacity
                                style={{
                                    marginTop: 20,
                                    backgroundColor: '#26C250',
                                    padding: 10,
                                    borderRadius: 20, 
                                    
                                }}
                                onPress={randomQuestionPress}
                            >
                                <Image
                                    source={require('../../assets/images/app_icon_v2_fat.png')}  
                                    style={{
                                        width: 160,       
                                        height: 160,      
                                        resizeMode: 'contain',  
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 20, 
                                        
                                    }}
                                />
                                <Text style={{
                                    color: '#fff', fontSize: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginTop: height * 0.008,
                                }}> Random Question</Text>
                            </TouchableOpacity>
                        </View> */}

                        <View style={{ height: 20 }}></View>
                        {/* FlatList Containing Topic Information */}
                        <View
                            style={{
                                height: height * 0.585,
                                width: width,

                                marginBottom: height * 0.03,

                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <FlatList
                                style={{ flex: 1 }}
                                data={courses}
                                keyExtractor={(item) => item.course_id}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <Card
                                        index={index}
                                        title={item.course_title}
                                        id={item.course_id}
                                        height={height * 0.09}
                                        width={width * 0.8}
                                        pressHandler={coursePress}
                                        item={item}
                                        imageSource={myImages.courseIcons[item.course_title]}
                                        logoUrl={item.logo_url}
                                    />
                                )}
                            />
                        </View>

                    </View>
                )}
        </View>
    )
}
