import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { globalStyles } from '../globalStyles/globalStyles';
import Card from '../components/QuestionCard';
import { useUser } from '../components/UserContext';

const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;

export default function Question_MC({ navigation, route }){
    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(true);
    const { state } = useUser();
    const topic = route.params?.topic;

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
            console.log(response_data);
            setData(response_data);
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

    const [seconds, setSeconds] = useState(60);

    // implementing timer, runs upon loading screen
    useEffect(() => {
        let interval;
        interval = setInterval(() => {
            setSeconds(prevSeconds => prevSeconds > 0 ? prevSeconds - 1 : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const [currentPressed, setCurrentPressed] = useState('Not Touched');

    // handling selection of choice
    const handleChooseOption = (option) => { 
        if(currentPressed == 'Time ran out'){
            return;
        }

        if(option == currentPressed) {
            setCurrentPressed('Not Touched');
        } else {
            setCurrentPressed(option) 
        }
    }

    // function called when time runs out
    useEffect(() => {
        if(seconds == 0){ 
            setCurrentPressed('Time ran out');
        }
    }, [seconds]);

    // handling selection submit
    const handleNext = async() => {
        if(seconds <= 0){ navigation.navigate('HomeTab'); return; }

        try {
            console.log("user answer", currentPressed, "correct answer", data.answer)
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
                        response_time: (60 - seconds),
                        user_answer: currentPressed,
                        correct_answer: data.answer,
                    })
                }
            );

            const response_data = await response.json();
            console.log(response_data);
        } catch(error) {
            console.log('Error fetching data', error);
        } finally {
            navigation.navigate('HomeTab')
        }
    }

    return (
        <View 
            style={ { 
                width: width, 
                height: height,
                alignItems: 'center',
                justifyContent: 'center', 
            } } 
        >
            {
                isLoading ? 
                ( <ActivityIndicator /> ) : 
                ( 
                    <View 
                        style={ {
                            width: width,
                            height: height,
                            ...globalStyles.container,
                        } }
                    >   
                        {/* Top Bar */}
                        { seconds == 0 ? 
                        (   
                            <View 
                                style={{
                                    width: width,
                                    height: height * 0.0625,
                                }}
                            /> 
                        ) : ( 
                            <View 
                                style = {{
                                    width: width,
                                    height: height * 0.0625,
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <TouchableOpacity
                                    style = {{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => navigation.navigate('HomeTab')}
                                >
                                    <Ionicons
                                        name='chevron-back'
                                        size={16}
                                        color='#004643'
                                        style = {{ 
                                            marginLeft: width / 12,
                                        }}
                                    />
                                    <Text 
                                        style = { { 
                                            color: '#004643', 
                                            marginLeft: 3, 
                                            fontSize: 16,
                                            fontFamily: 'Baloo2-Bold',
                                        } }
                                    > 
                                        Back
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) }

                        {/* Question Component */}
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
                                style = { {
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
                                } }
                            >
                                <Text 
                                    style = { { 
                                        marginTop: height * 0.03,
                                        marginHorizontal: 5,
                                        padding: 20,
                                        fontFamily: 'Baloo2-Bold',
                                        fontSize: 14,
                                    } }
                                > 
                                    { data.question } 
                                </Text>
                            </View>
                        </View>

                        {/* Answer Component */}
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}

                            alwaysBounceHorizontal={true}
                            snapToOffsets={[0, 0.88*width, 1.76*width, 2.64*width]}
                            snapToEnd={false}
                            decelerationRate='fast'

                            style = { {
                                width: width,
                                height: height * 0.4,
                            } }

                            contentContainerStyle = { { 
                                alignItems: 'center',
                                paddingLeft: 0.1*width,
                            } }
                        >
                            <Card
                                handlePress={handleChooseOption}
                                currentPressed={currentPressed}
                                option={'A'}
                                text={data.options[0]} 
                                width={width * 0.8} 
                                height={height * 0.35}
                            />
                            <Card
                                handlePress={handleChooseOption}
                                currentPressed={currentPressed}
                                option={'B'}
                                text={data.options[1]} 
                                width={width * 0.8} 
                                height={height * 0.35}
                            />
                            <Card
                                handlePress={handleChooseOption}
                                currentPressed={currentPressed}
                                option={'C'}
                                text={data.options[2]} 
                                width={width * 0.8} 
                                height={height * 0.35}
                            />
                        </ScrollView>

                        {/* Next Button */}
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
                                activeOpacity={ currentPressed == "Not Touched" ? 1 : 0.7 }
                                style = { {
                                    backgroundColor: currentPressed == 'Not Touched' ? '#3c716f' : '#004643',

                                    height: height * 0.06,
                                    width: width * 0.75,

                                    ...globalStyles.button
                                } }
                                onPress={() => handleNext()}
                            >
                                <Text style = {globalStyles.buttonText}> Next </Text>
                            </TouchableOpacity>
                        </View>

                    </View> 
                )
            }
        </View>
        
    )
}
