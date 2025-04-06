import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
    View, Text, FlatList, ActivityIndicator,
    TouchableOpacity, Image, StyleSheet, NativeScrollEvent, NativeSyntheticEvent, useWindowDimensions
} from 'react-native';

import { globalStyles } from '../globalStyles/globalStyles';
import SwitchButton from '../components/SwitchButton';
import Card from '../components/CourseCard';
import { useUser } from '../components/UserContext';
import { getLoginInfo, saveLoginInfo } from '../components/SecureStoreUtils';
import { getCourses, initializeLocalDatabase } from '../components/localDb';

import { myImages } from '../globalStyles/globalStyles';
import { Button } from 'react-native-web';


export default function Courses({ navigation }) {
    // define height and width
    const {height, width} = useWindowDimensions();

    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [dailyQuestionId, setDailyQuestionId] = useState(null); // daily random question
    const { state, updateState } = useUser();
    const [greeting, setGreeting] = useState('');
    const [containerHeight, setContainerHeight] = useState(height * 0.6);
    const [shadowVisible, setShadowVisible] = useState(false);
    const [bottomShadowVisible, setBottomShadowVisible] = useState(false);

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

    const signInPress = () => {
        navigation.navigate('Login')
    }


    const calculateContainerHeight = useCallback(() => {
        const itemHeight = height * 0.1; // Height of each Card
        const padding = height * 0.01; // Extra padding
        
        if (courses.length >= 3) {
            setContainerHeight(height * 0.4);
        } else {
            setContainerHeight((courses.length * itemHeight) + padding);
        }
    }, [courses, height]);
    
    // Add this effect to update height when courses change
    useEffect(() => {
        calculateContainerHeight();
    }, [courses, calculateContainerHeight]);


    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const contentHeight = event.nativeEvent.contentSize.height;
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;

        setShadowVisible(offsetY > height*0.07);
        setBottomShadowVisible(offsetY + layoutHeight < contentHeight - height*0.07);
    }

    // set initial shadow visibility
    useEffect(() => {
        const contentHeight = courses.length * height*0.09;
        const layoutHeight = containerHeight;

        setBottomShadowVisible(layoutHeight < contentHeight - height*0.07);
    }, [courses]);

    return (
        <View style={styles.container}>
            {isLoading ? (<ActivityIndicator />) :
                (
                    <View >
                        {/* Message At The Top */}
                        <View style={{
                            minHeight: height * 0.09,
                            width: width,
                            paddingHorizontal: 30,
                            marginTop: height * 0.15,
                        }}>
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

                        <View style={{ height: height*0.03 }}></View>
                        {/* FlatList Containing Topic Information */}
                        <View
                            style={{
                                width: width,
                                height: height*0.5,
                                justifyContent: 'center',
                            }}
                        >
                        {/* Top Shadow */}
                        {shadowVisible && <View style = {{
                            position: 'absolute',
                            top: 0,
                            left: width*0.09,
                            right: width*0.09,
                            height: 13,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            zIndex: 10,
                            borderRadius: 10
                        }} />}
                        
                            <FlatList
                                style={styles.flatList}
                                contentContainerStyle={{
                                    paddingBottom: height * 0.05, 
                                    alignItems: 'center',
                                }}
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
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                            />
                            {/* Bottom Shadow */}
                            {bottomShadowVisible && <View style={{
                                position: 'absolute',
                                bottom: 0,
                                left: width*0.09,
                                right: width*0.09,
                                height: 13,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                borderRadius: 10
                            }} />}
                        </View>
                        { !state.is_signed_in && (
                            <View style={{
                                width: width * 0.8,
                                alignItems: 'center',
                                padding: 20,
                                backgroundColor: '#ffffff',
                                borderRadius: 10,
                                alignSelf: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 3.84,
                                marginBottom: 20,
                                marginTop: height * 0.01,   
                            }}>
                                {/* Illustration */}
                                <Image
                                source={require('../../assets/images/notion_avatars/notion_girl_right.png')}
                                style={{
                                    width: width * 0.15, 
                                    height: width * 0.15, 
                                    resizeMode: 'contain',
                                    marginBottom: 10,
                                }}
                                />

                                {/* Text */}
                                <Text style={styles.signInText}>Sign up to unlock more!</Text>

                                {/* Sign In Button */}
                                <TouchableOpacity onPress={signInPress} style={styles.signInButton}>
                                <Text style={styles.signInButtonText}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
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
        alignItems: 'stretch',
        justifyContent: 'start',
        flexDirection: 'column'
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column'
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
        width: '100%',
    },
    signInText: {
        fontSize: 18,
        fontFamily: 'Baloo2-Bold',
        color: '#333333',
        marginBottom: 15,
        textAlign: 'center',
    },
    signInButton: {
        backgroundColor: '#F8C660',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        width: '40%',
    },
    signInButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Baloo2-Bold',
    },
});
