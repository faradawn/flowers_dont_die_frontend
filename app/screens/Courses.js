import React, { useState, useEffect } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import {
    View, Dimensions, Text, FlatList, ActivityIndicator,
    TouchableOpacity, Image, StyleSheet, NativeScrollEvent, NativeSyntheticEvent
} from 'react-native';

import Card from '../components/CourseCard';
import { useUser } from '../components/UserContext';
import { getLoginInfo, saveLoginInfo } from '../components/SecureStoreUtils';
import { getTopics } from '../components/localDb';
import { getCourses, initializeLocalDatabase } from '../components/localDb';

import { myImages } from '../globalStyles/globalStyles';

import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { ConsoleSqlOutlined } from '@ant-design/icons';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;


export default function Courses({ navigation, route }) {
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState([]);
    const [dailyQuestionId, setDailyQuestionId] = useState(null); // daily random question
    const { state, updateState } = useUser();
    const [greeting, setGreeting] = useState('');
    const [containerHeight, setContainerHeight] = useState(height * 0.6);
    const [shadowVisible, setShadowVisible] = useState(false);
    const [bottomShadowVisible, setBottomShadowVisible] = useState(false);

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [topics, setTopics] = useState({ topics: [] });
    const [currentTopic, setCurrentTopic] = useState(-1);

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

    useEffect(() => {
        if (courses.length > 0 && state.course_id) {
            const matched = courses.find(c => c.value === state.course_id);
            if (matched) {
                setSelectedCourse(matched);
            }
        }
        fetchTopics();
    }, []);

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
                    console.log("route.params is", route.params);
                }

                setGreeting(getGreeting());
            }

            async function fetchCourses() {
                if (!state.uid) return;
                try {
                    await initializeLocalDatabase(); // Initialize database before fetching
                    const data = await getCourses(state.uid);
                    console.log("[Courses] Received from localDb: ", "uid", state.uid, "courses", data.courses);
                    const mappedCourses = data.courses.map(course => ({
                        label: course.course_title,
                        value: course.course_id,
                        num_total_questions: course.num_total_questions,
                        num_completed_questions: course.num_completed_questions,
                    }))
                    setCourses(mappedCourses);
                    setDailyQuestionId(data.daily_question_id);

                    if (route?.params?.course_id) {
                        console.log("params passed as", route.params.course_id);
                        updateState('course_id', route.params.course_id);

                        const matched = courses.find(c => c.value === route.params.course_id);
                        if (matched) {
                            setSelectedCourse(matched);
                        }                    
                    }
                    else {
                        console.log("no params passed");
                        updateState('course_id', mappedCourses[0].value);
                        setSelectedCourse(mappedCourses[0]);
                    }
                    fetchTopics();
                } catch (error) {
                    console.error('[Courses] Error fetching or parsing data:', error);
                } finally {
                    setIsLoading(false);
                }
            }

            checkAndSetupUser().then(() => fetchCourses());
        }, [state.uid, state.username, route.params])
    );

    // navigation through clicking a specific topic
    const topicPress = (topic) => {
        navigation.navigate('Assignments', { topic: topic })    
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

    // update shadow visibility
    useEffect(() => {
        if (!topics || topics.topics.length === 0) return;    

        const contentHeight = topics.topics.length * height * 0.09;
        setBottomShadowVisible(containerHeight < contentHeight - height * 0.07);
    }, [topics, state.course_id]);

    // update current course
    useEffect(() => {
        for (let i = 0; i < topics.topics.length; i++) {
            if (topics.topics[i].completed_questions < topics.topics[i].total_questions) {
                setCurrentTopic(i);
                break;
            }
        }
    }, [topics]);

    useEffect(() => {
        console.log("course_id: ", state.course_id);
        if (courses.length > 0 && state.course_id) {
            const matched = courses.find(c => c.value === state.course_id);
            if (matched) {
                setSelectedCourse(matched);
            }
        }
        fetchTopics();
    }, [state.course_id]);

    const calculateProgress = (totalQuestions, completedQuestions) => {
        if (totalQuestions > 0) {
          return (completedQuestions / totalQuestions) * 100;
        }
        return 0;
      };

    // fetching the topics from the local database
    const fetchTopics = async() => {
        try {
            const result = await getTopics(state.uid, state.course_id);
            console.log("Got topics", result);
            if (result.status === "success") {
                setTopics(result);
            } else {
                console.log('Error fetching topics:', result.message);
            }
        } catch(error) {
            console.log('Error fetching data: ', error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {isLoading || courses.length === 0 ? (<ActivityIndicator />) :
                (
                    <View >
                        {/* progress bar for selected courses */}
                        <AnimatedCircularProgress
                            style={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                                zIndex: 100,
                            }}
                            size={60}
                            width={9}
                            fill={selectedCourse ? calculateProgress(selectedCourse.num_total_questions, selectedCourse.num_completed_questions) : 0}
                            rotation={0}
                            tintColor="#4B7C7B"
                            backgroundColor="#DEE5E5">
                            {
                                (fill) => (
                                    <Text style={{ fontFamily: 'Nunito-Regular', fontSize: 14 }}>
                                        { `${Math.round(fill)}%` }
                                    </Text>
                                )
                            }
                        </AnimatedCircularProgress>
                        
                        {/* course selector dropdown */}
                        <Dropdown 
                            style={{
                                marginTop: 30,
                                marginLeft: 20,
                                height: 45,
                                width: width*0.5,
                                borderWidth:0.5,
                                borderRadius: 8,
                                borderColor: 'gray',
                                borderBottomWidth: 0.5,
                                backgroundColor: 'white',
                            }}
                            data={courses}
                            value={state.course_id}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            selectedTextStyle = {{ fontFamily: 'Nunito-Regular', fontSize: 14, paddingHorizontal: 10, lineHeight: 16, }}
                            onChange={item => {
                                updateState('course_id', item.value)
                                setSelectedCourse(item);
                                fetchTopics();
                            }}
                            renderRightIcon = {() => (
                                <Ionicons name="caret-down-outline" size={20} color="black" style={{ marginRight: 10 }} />
                            )}
                            renderItem={(item) => {
                                const isSelected = item.value === state.course_id;
                                return (
                                    <View>
                                        <Text style={{
                                            padding: 12,
                                            fontFamily: 'Nunito-Regular',
                                            fontSize: 14,
                                            lineHeight: 16,
                                            backgroundColor: isSelected ? '#EBF2F0' : "white",
                                        }}>
                                            {item.label}
                                        </Text>
                                        <View style={{
                                            height: 1,
                                            backgroundColor: '#515856s',
                                        }} />
                                    </View>
                                );
                            }}
                            containerStyle = {{
                                borderWidth: 0.5,
                                borderColor: '#515856',
                                borderRadius: 12,
                                overflow: 'hidden'
                            }}
                        />

                        {/* Message At The Top */}
                        <View style={styles.greetingContainer}>
                            <Text style={styles.greetingText} numberOfLines={1} adjustsFontSizeToFit>
                                {greeting}{' '}
                                <Text style={styles.usernameText}>
                                    {state.username}!
                                </Text>
                            </Text>
                        </View>

                        {/* FlatList Containing Topic Information */}
                        <View
                            style={{ ...styles.flatListContainer }}
                        >
                        {/* Top Shadow */}
                        {shadowVisible && <View style = {styles.topShadow} />}
                        
                            <FlatList
                                style={styles.flatList}
                                contentContainerStyle={styles.flatListContent}
                                data={topics.topics}
                                keyExtractor={(item) => item.topic}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item, index }) => (
                                    <Card
                                        index={index}
                                        title={item.topic}
                                        id={item.topic}
                                        height={height * 0.1} 
                                        width={width * 0.9} 
                                        borderWidth={index === currentTopic ? 0.7 : 0}
                                        pressHandler={topicPress}
                                        item={item}
                                        imageSource={myImages.flowerIcons[(index % 9) + 1]}
                                    />
                                )}
                                onScroll={handleScroll}
                                scrollEventThrottle={16}
                            />
                            {/* Bottom Shadow */}
                            {bottomShadowVisible && <View style={styles.bottomShadow} />}
                        </View>
                        { !state.is_signed_in && (
                            <View style={styles.signInContainer}>
                                {/* Illustration */}
                                <Image
                                source={require('../../assets/images/notion_avatars/notion_girl_right.png')}
                                style={styles.signInImage}
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
        backgroundColor: '#f6f6f6',
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
    greetingContainer: {
        minHeight: height * 0.09,
        width: width,
        paddingHorizontal: 30,
        marginTop: height * 0.06,
    },
    greetingText: {
        fontFamily: 'Nunito-Regular',
        fontSize: 20,
        lineHeight: 22,
    },
    usernameText: {
        color: '#26C250',
    },
    flatListContainer: {
        width: width,
        height: height * 0.6,
        justifyContent: 'center',
    },
    flatList: {
        top: -28,
        width: '100%',
    },
    flatListContent: {
        paddingBottom: height * 0.05, 
        alignItems: 'center',
    },
    signInContainer: {
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
    },
    signInImage: {
        width: width * 0.15, 
        height: width * 0.15, 
        resizeMode: 'contain',
        marginBottom: 10,
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
    topShadow: {
        position: 'absolute',
        top: -28,
        left: width*0.05,
        right: width*0.05,
        height: 13,
        backgroundColor: '#51585633',
        zIndex: 10,
        borderRadius: 10
    },
    bottomShadow: {
        position: 'absolute',
        bottom: 28,
        left: width*0.05,
        right: width*0.05,
        height: 13,
        backgroundColor: '#51585633',
        zIndex: 10,
        borderRadius: 10
    }
});
