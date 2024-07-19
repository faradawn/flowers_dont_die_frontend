import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, View, 
    Dimensions, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

import { Ionicons, AntDesign } from '@expo/vector-icons';

import { globalStyles } from '../globalStyles/globalStyles';
import Card from '../components/QuestionCard';
import { useUser } from '../components/UserContext';

import RenderHtml from 'react-native-render-html';


const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;


export default function Question_MC({ navigation, route }){
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const { state } = useUser();
    const topic = route.params?.topic;

    const TOTAL_SECONDS = 90
    const [seconds, setSeconds] = useState(TOTAL_SECONDS);
    const [intervalId, setIntervalId] = useState(null);

    // function for fetching data
    const fetchQuestions = async () => {
        try {
            const response = await fetch(
              'http://129.114.24.200:8001/get_question', {
                method: 'POST',
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uid: state.uid,
                    course_id: state.course_id,
                    topic: topic,
                }),
              }
            );
            
            const response_data = await response.json();
            setData(response_data);
            console.log("Got data question", response_data.question)
            //Set default pressed value to "A"
            setCurrentPressed("A");
            setSeconds(response_data.time_limit)
        } catch(error) {
            console.log('Error fetching data: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    // runs fetchQuestions upon loading screen
    useEffect(() => {
        setTimeout(fetchQuestions, 10);
    }, []);

    

    // implementing timer, runs upon loading screen
    useEffect(() => {
        let interval;
        if (!submitted) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => {
                    if(prevSeconds > 0) return prevSeconds - 1;
                    return 0;
                });
            }, 1000)
        }

        setIntervalId(interval);

        return () => clearInterval(interval);
    }, [submitted]);

    const [currentPressed, setCurrentPressed] = useState("A");

    // handling selection of choice
    const handleChooseOption = (option) => { 
        if(currentPressed == 'Time ran out' || submitted ){
            return;
        }
        setCurrentPressed(option);
    }

    // function called when time runs out
    useEffect(() => {
        if(seconds == 0){ 
            setCurrentPressed('Time ran out');
            setModalOpen(true);
            setSubmitted(true);
        }
    }, [seconds]);

    const [submitted, setSubmitted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // handling selection submit
    const handleNext = async() => {
        if(submitted){ navigation.navigate('HomeTab'); return; }

        try {
            const response = await fetch(
                'http://129.114.24.200:8001/submit_answer', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: state.uid,
                        course_id: state.course_id,
                        topic: topic,
                        question_id: data.question_id,
                        response_time: (seconds),
                        user_answer: currentPressed,
                        correct_answer: data.answer,
                    })
                }
            );

            const response_data = await response.json();

            setSubmitted(true);
            setModalOpen(true);
            if (intervalId) { 
                clearInterval(intervalId); // Clear the interval
            }

        } catch(error) {
            console.log('Error fetching data', error);
        }
    };

    
    const handleScroll = (event) => {
        const xOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(xOffset / (width * 0.88)); // Calculate the index based on scroll position
        const options = ['A', 'B', 'C'];
        if (index >= 0 && index < options.length) {
            handleChooseOption(options[index]);
        }
    };

    const sampleHtmlContent = `
        <p>Given an array of integers <code>nums</code>&nbsp;and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
        <img alt="" src="https://assets.leetcode.com/uploads/2021/01/18/pathsum1.jpg" style="width: 500px; height: 356px;" />
        <pre>
        <strong>Input:</strong> nums = [2,7,11,15], target = 9
        <strong>Output:</strong> [0,1]
        <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
        </pre>
        `;

    const TopBar = () => (
        <View 
            style={{
                width: width,
                height: height * 0.0625,
                justifyContent: 'flex-end',
            }}
        >
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
                onPress={() => navigation.navigate('HomeTab')}
            >
                <Ionicons
                    name='chevron-back'
                    size={16}
                    color='#004643'
                    style={{ 
                        marginLeft: width / 12,
                    }}
                />
                <Text 
                    style={{ 
                        color: '#004643', 
                        marginLeft: 3, 
                        fontSize: 16,
                        fontFamily: 'Baloo2-Bold',
                    }}
                > 
                    Back
                </Text>
            </TouchableOpacity>
        </View>
    );

    const NoQuestionView = () => (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Text style={{
                fontFamily: 'Baloo2-Bold',
                fontSize: 24,
                textAlign: 'center',
                color: '#004643',
                padding: 20,
            }}>
                Yay, you have done all the questions!
            </Text>
        </View>
    );

    const ModalComponent = () => (
        // {/* Pop-up notification upon successfully submitting */}
        <Modal
            visible={modalOpen}
            transparent={true}
            animationType="slide"
            backdropColor="black"
            backdropOpacity={ 0.8 }
        >
            {/* Outer View used for darkening tbe backdrop */}
            <View
                style={{
                    flex: 1,    
                    justifyContent: 'center',    
                    alignItems: 'center',    
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken backdrop
                }}
            >
                {/* Inner View for Styling */}
                <View
                    style={{
                        width: width * 0.8,
                        paddingTop: height * 0.05,
                        paddingBottom: height * 0.1,

                        backgroundColor: 'white',

                        justifyContent: 'center',
                        alignItems: 'center',

                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                    }}    
                >
                    {/* Top Bar for close icon */}
                    <View
                        style={{
                            height: height * 0.05,
                            width: width * 0.8,
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Ionicons 
                            name="close-outline"
                            size={25}
                            onPress={() => {setModalOpen(false)}}
                            style={{ marginRight: 0.08 * width, }}
                        />
                    </View>

                    {/* Title Text */}
                    <Text
                        style={{
                            fontFamily: 'Baloo2-Bold',
                            fontSize: 30,
                        }}
                    >
                        { currentPressed == data.answer ? 'Congratulations!' : 'Sorry!' }
                    </Text>

                    {/* Body Text */}
                    <Text
                        style={{
                            fontFamily: 'Baloo2-Regular',
                            fontSize: 16,
                            padding: 0.05 * width,
                        }}
                    >
                        { currentPressed == 'Time ran out' ? 'Your time ran out.' : 
                            (currentPressed == data.answer ? 'You are correct!' : `The correct answer is ${data.answer || 'not available'}`)}
                    </Text>

                </View>

            </View>
        </Modal>
    );

    const QuestionComponent = () => (
        // {/* Question Component */}
        <View
            style = { { 
                width: width,
                height: height * 0.35,

                justifyContent: 'center',
                alignItems: 'center',
            } } 
        >
            {/* Countdown Timer */}
            <View
                style = { {
                    width: 70,
                    height: 70,

                    marginTop: 10,
                    borderRadius: 50,
                    borderWidth: 6,
                    borderColor: '#ABD1C6',
                    zIndex: 1,

                    backgroundColor: 'white',
                    
                    alignItems: 'center',
                    justifyContent: 'center',
                } }
            >
                <Text
                    style = { { 
                        color: '#0c2d1c',
                        fontSize: 20,
                        fontWeight: 'bold',
                        fontFamily: 'Baloo2-Bold' 
                    } }
                > 
                    { seconds } 
                </Text>
            </View>

            {/* Question Card */}
            <View
                style={{
                    height: height * 0.30,
                    width: width * 0.85,
                    borderRadius: 20,
                    backgroundColor: 'white',
                    marginTop: -0.04 * height,
                    // styling shadow
                    shadowColor: '#000', // black shadow color
                    shadowOffset: { width: 0, height: 20 },
                    shadowOpacity: 0.2,
                    shadowRadius: 30,
                    elevation: 10, // for Android shadow
                }}
                >
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'flex-start',
                    }}
                    >
                    <RenderHtml
                        contentWidth={width - 50}  // Adjust based on your padding/margin
                        source={{ html: data.question }}
                        tagsStyles={{
                        body: {
                            marginTop: height * 0.03,
                            marginHorizontal: 5,
                            padding: 20,
                            fontFamily: 'Baloo2-Bold',
                            fontSize: 14,
                        },
                        code: {
                            backgroundColor: '#f0f0f0',
                            padding: 2,
                            borderRadius: 4,
                        },
                        pre: {
                            backgroundColor: '#f0f0f0',
                            padding: 10,
                            borderRadius: 4,
                        },
                        }}
                    />
                    </ScrollView>
            </View>
        </View>
    );

    const AnswerComponent = () => (
        // {/* Answer Component */}
        <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal={true}
            snapToOffsets={[0, 0.88 * width, 1.76 * width, 2.64 * width]}
            snapToEnd={false}
            decelerationRate='fast'
            style={{
                width: width,
                height: height * 0.4,
            }}
            contentContainerStyle={{
                alignItems: 'center',
                paddingLeft: 0.1 * width,
            }}
            onScroll={handleScroll} // Add onScroll listener here
            scrollEventThrottle={16} // Control how often the scroll event will be sent while scrolling (milliseconds)
        >
            <Card
                option={'A'}
                text={data.options[0]} 
                width={width * 0.8} 
                height={height * 0.35}
                isSelected={currentPressed === "A"}
            />
            <Card
                option={'B'}
                text={data.options[1]} 
                width={width * 0.8} 
                height={height * 0.35}
                isSelected={currentPressed === "B"}
            />
            <Card
                option={'C'}
                text={data.options[2]} 
                width={width * 0.8} 
                height={height * 0.35}
                isSelected={currentPressed === "C"}
            />
        </ScrollView>
    );


    const NextButtonComponent = () => (
        //  {/* Next Button */}
         <View
            style = { { 
                width: width,
                height: height * 0.08,
                alignItems: 'center',
                justifyContent: 'center',

                marginTop: height * -0.04,
                marginBottom: height * 0.08,
            } }
        >
            <TouchableOpacity
                activeOpacity={ currentPressed == "Not Touched" && !submitted ? 1 : 0.7 }
                style = { {
                    backgroundColor: currentPressed == 'Not Touched' && !submitted ? '#3c716f' : '#004643',

                    height: height * 0.06,
                    width: width * 0.75,

                    ...globalStyles.button
                } }
                onPress={() => handleNext()}
            >
                <Text style = {globalStyles.buttonText}> { submitted ? 'Next' : 'Submit' } </Text>
            </TouchableOpacity>
        </View>
    );


    return (
        <View 
            style={{
                width: width, 
                height: height,
                alignItems: 'center',
                justifyContent: 'center', 
            }}
        >
            {isLoading ? (
                <ActivityIndicator size="large" color="gray" />
            ) : (
                <View 
                    style={{
                        width: width,
                        height: height,
                        ...globalStyles.container,
                    }}
                >   
                    <TopBar />
                    {data.message === "No questions" ? (
                        <NoQuestionView />
                    ) : (
                        <>
                            <ModalComponent />
                            <QuestionComponent />
                            <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            alwaysBounceHorizontal={true}
            snapToOffsets={[0, 0.88 * width, 1.76 * width, 2.64 * width]}
            snapToEnd={false}
            decelerationRate='fast'
            style={{
                width: width,
                height: height * 0.4,
            }}
            contentContainerStyle={{
                alignItems: 'center',
                paddingLeft: 0.1 * width,
            }}
            onScroll={handleScroll} // Add onScroll listener here
            scrollEventThrottle={16} // Control how often the scroll event will be sent while scrolling (milliseconds)
        >
            <Card
                option={'A'}
                text={data.options[0]} 
                width={width * 0.8} 
                height={height * 0.35}
                isSelected={currentPressed === "A"}
            />
            <Card
                option={'B'}
                text={data.options[1]} 
                width={width * 0.8} 
                height={height * 0.35}
                isSelected={currentPressed === "B"}
            />
            <Card
                option={'C'}
                text={data.options[2]} 
                width={width * 0.8} 
                height={height * 0.35}
                isSelected={currentPressed === "C"}
            />
        </ScrollView>
                            <NextButtonComponent />
                        </>
                    )}
                </View> 
            )}
        </View>
    );
}