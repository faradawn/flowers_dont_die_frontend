import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
    View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity, Image, StyleSheet
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import SwitchButton from '../components/SwitchButton';
import Card from '../components/CourseCard';
import { useUser } from '../components/UserContext';
import { getLoginInfo, saveLoginInfo } from '../components/SecureStoreUtils';
import { getCourses, initializeLocalDatabase } from '../components/localDb';

import { myImages } from '../globalStyles/globalStyles';
import { Button } from 'react-native-web';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default function Courses({ navigation }) {
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [dailyQuestionId, setDailyQuestionId] = useState(null); // daily random question
    const { state, updateState } = useUser();
    const [greeting, setGreeting] = useState('');
    const [isSignedIn, setIsSignedIn] = useState(false);

    const fetchIsSignedIn = async (uid) => {
        try {
            const response = await fetch('https://backend.faradawn.site:8001/get_courses', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uid }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                console.log("[Courses/Get isSigned] is_signed_in:", data.is_signed_in);
                setIsSignedIn(data.is_signed_in);
            } else {
                console.error('Error checking sign-in status:', data.message);
                setIsSignedIn(false);
            }
        } catch (error) {
            console.error('Error checking sign-in status:', error);
            setIsSignedIn(false);
        }
    };

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

                // Check if user is signed in
                if (state.uid) {
                    await fetchIsSignedIn(state.uid);
                }

            }

            async function fetchCourses() {
                if (!state.uid) return;
                try {
                    await initializeLocalDatabase(); // Initialize database before fetching
                    const data = await getCourses(state.uid);
                    console.log("[Courses] Received from localDb: ", "uid", state.uid, "courses", data.courses, );
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

    useEffect(() => {
        if (state.uid) {
            fetchIsSignedIn(state.uid);
        }
    }, [state.uid]);

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
        <View style={styles.container}>
            {isLoading ? (<ActivityIndicator />) :
                (
                    <View>

                        {/* Message At The Top */}
                        <View style={styles.greetingContainer}>
                            <Text
                                style={styles.greetingText}
                                numberOfLines={2}
                                adjustsFontSizeToFit={true}
                            >
                                {greeting}{' '}
                                <Text style={styles.usernameText}>
                                    {state.username}!
                                </Text>
                            </Text>
                        </View>

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

                        {isSignedIn === false && (
                        <TouchableOpacity
                            style={styles.signUpButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.signUpButtonText}>
                                Sign up to unlock more
                            </Text>
                        </TouchableOpacity>
                        )}


                    </View>
                )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    greetingContainer: {
        minHeight: height * 0.09,
        width: width,
        paddingHorizontal: 30,
        marginTop: height * 0.1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    greetingText: {
        fontFamily: 'Baloo2-Bold',
        fontSize: 22,
        textAlign: 'center',
    },
    usernameText: {
        color: '#26C250',
    },
    flatList: {
        flex: 1,
        width: '100%',
    },
    flatListContent: {
        paddingBottom: height * 0.3, 
        alignItems: 'center',
    },
    signUpButton: {
        backgroundColor: '#0FBB16',
        padding: 25,
        borderRadius: 25,
        width: width * 0.6,
        alignItems: 'center',
        position: 'absolute',
        bottom: height * 0.1, 
        alignSelf: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 6, 
        elevation: 5, // Add elevation for Android shadow
    },
    signUpButtonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'Baloo2-Bold',
    },
});
