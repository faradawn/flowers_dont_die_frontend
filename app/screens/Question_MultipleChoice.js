import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, View, Dimensions, TouchableOpacity, Modal, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import { globalStyles } from '../globalStyles/globalStyles';
import Card from '../components/QuestionCard';
import { useUser } from '../components/UserContext';
import RenderHtml from 'react-native-render-html';
import SwitchButton from '../components/SwitchButton';

const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;

export default function Question_Combined({ navigation, route }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { state } = useUser();
    const [mode, setMode] = useState(0); // 0 for voice, 1 for multiple choice
    const topic = route.params?.topic;

    // Multiple choice state
    const [currentPressed, setCurrentPressed] = useState("A");

    // Voice state
    const [recording, setRecording] = useState();
    const [outputURI, setOutputURI] = useState('');
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [allowSubmit, setAllowSubmit] = useState(false);
    const [transcribedText, setTranscribedText] = useState({ status: '', message: '', transcribed_text: '' });

    // Common state
    const [submitted, setSubmitted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [seconds, setSeconds] = useState(90);
    const [intervalId, setIntervalId] = useState(null);
    const [answerResponse, setAnswerResponse] = useState('');

    // Fetch questions
    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://129.114.24.200:8001/get_question', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: state.uid,
                    course_id: state.course_id,
                    topic: topic,
                }),
            });
            const response_data = await response.json();
            setData(response_data);
            setCurrentPressed("A");
        } catch(error) {
            console.log('Error fetching data: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setTimeout(fetchQuestions, 10);
    }, []);

    // Timer logic
    useEffect(() => {
        let interval;
        if (!submitted) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => {
                    if(prevSeconds > 0) return prevSeconds - 1;
                    return 0;
                });
            }, 1000);
        }
        setIntervalId(interval);
        return () => clearInterval(interval);
    }, [submitted]);

    useEffect(() => {
        if(seconds === 0){ 
            setCurrentPressed('Time ran out');
            setModalOpen(true);
            setSubmitted(true);
        }
    }, [seconds]);

    // === MC
    const handleChooseOption = (option) => { 
        if(currentPressed == 'Time ran out' || submitted ){
            return;
        }
        setCurrentPressed(option);
    }
    
    const handleScroll = (event) => {
        const xOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(xOffset / (width * 0.88)); // Calculate the index based on scroll position
        const options = ['A', 'B', 'C'];
        if (index >= 0 && index < options.length) {
            handleChooseOption(options[index]);
        }
    };

    // === Voice recording functions
    const startRecording = async () => {
        if(outputURI != ''){
            await FileSystem.deleteAsync(outputURI, { idempotent: true });
        }
        try {
            if (permissionResponse.status !== 'granted') {
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        const uri = recording.getURI();
        setIsLoading(true);
        setOutputURI(uri);
    };

    const handleRecord = () => {
        if(submitted) return;
        if(recording) stopRecording();
        else startRecording();
    };

    const transcribeText = async () => {
        const file = {
            uri: outputURI,
            name: 'user_recording.m4a',
            type: 'audio/m4a'
        };
        const formData = new FormData();
        formData.append('uid', state.uid);
        formData.append('question_id', data.question_id);
        formData.append('audio_file', file);
        try {
            const response = await fetch('http://129.114.24.200:8001/transcribe', {
                method: 'POST',
                headers: { "Content-Type": "multipart/form-data" },
                body: formData
            });
            const response_data = await response.json();
            setTranscribedText(response_data);
        } catch(error) {
            console.log('Error transcribing text: ', error);
        }
    };

    useEffect(() => {
        if(outputURI != '') transcribeText();
    }, [outputURI]);

    useEffect(() => {
        if(transcribedText.status == '') return;
        setIsLoading(false);
        setAllowSubmit(true);
    }, [transcribedText]);

    // Handle submission
    const handleNext = async () => {
        if(submitted) { 
            navigation.navigate('HomeTab'); 
            return; 
        }
        
        setIsLoading(true);

        if(mode === 0) {
            // Voice submission
            try {
                const response = await fetch('http://129.114.24.200:8001/submit_text_response', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: state.uid,
                        question_id: data.question_id,
                        question: data.question,
                        transcribed_text: transcribedText.transcribed_text,
                    })
                });
                const response_data = await response.json();
                setAnswerResponse(response_data);
            } catch(error) {
                console.log("Error sending data: ", error);
            }
        } else {
            // Multiple choice submission
            try {
                const response = await fetch('http://129.114.24.200:8001/submit_answer', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: state.uid,
                        course_id: state.course_id,
                        topic: topic,
                        question_id: data.question_id,
                        response_time: (90 - seconds),
                        user_answer: currentPressed,
                        correct_answer: data.answer,
                    })
                });
                const response_data = await response.json();
                setAnswerResponse(response_data);
            } catch(error) {
                console.log('Error fetching data', error);
            }
        }

        setIsLoading(false);
        setSubmitted(true);
        setModalOpen(true);
        if (intervalId) { 
            clearInterval(intervalId);
        }
    };

    // Components
    const TopBar = () => (
        <View 
            style={{
                width: width,
                height: height * 0.0625,
                justifyContent: 'flex-end',
                marginTop: 20,
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
                {data.question}
            </Text>
        </View>
    );

    const ModalComponent = () => (
        <Modal
            visible={modalOpen}
            transparent={true}
            animationType="slide"
            backdropColor="black"
            backdropOpacity={0.8}
        >
            <View style={{
                flex: 1,    
                justifyContent: 'center',    
                alignItems: 'center',    
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
                <View style={{
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
                }}>
                    <View style={{
                        height: height * 0.05,
                        width: width * 0.8,
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                    }}>
                        <Ionicons 
                            name="close-outline"
                            size={25}
                            onPress={() => {setModalOpen(false)}}
                            style={{ marginRight: 0.08 * width }}
                        />
                    </View>
                    <Text style={{
                        fontFamily: 'Baloo2-Bold',
                        fontSize: 30,
                    }}>
                        {mode === 0 ? answerResponse.feedback_title : 
                            (currentPressed == data.answer ? 'Congratulations!' : 'Sorry!')}
                    </Text>
                    <Text style={{
                        fontFamily: 'Baloo2-Regular',
                        fontSize: 16,
                        padding: 0.05 * width,
                    }}>
                        {mode === 0 ? answerResponse.feedback_body :
                            (currentPressed == 'Time ran out' ? 'Your time ran out.' : 
                            (currentPressed == data.answer ? 'You are correct!' : `The correct answer is ${data.answer || 'not available'}`))}
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

    const NextButtonComponent = () => (
        <View style={{ 
            width: width,
            height: height * 0.08,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: height * -0.04,
            marginBottom: height * 0.08,
        }}>
            <TouchableOpacity
                activeOpacity={(mode === 0 && !allowSubmit) || (mode === 1 && currentPressed == "Not Touched" && !submitted) ? 1 : 0.7}
                style={{
                    backgroundColor: (mode === 0 && !allowSubmit) || (mode === 1 && currentPressed == 'Not Touched' && !submitted) ? '#3c716f' : '#004643',
                    height: height * 0.06,
                    width: width * 0.75,
                    ...globalStyles.button
                }}
                onPress={() => handleNext()}
            >
                <Text style={globalStyles.buttonText}>{submitted ? 'Next' : 'Submit'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{
          width: width,
          height: height,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isLoading ? (
            <ActivityIndicator size="large" color="gray" />
          ) : (
            <View style={{
              width: width,
              height: height,
              ...globalStyles.container,
            }}>
              <TopBar />
              {data.message === "No questions" ? (
                <NoQuestionView />
              ) : (
                <>
                  <ModalComponent />
                  <QuestionComponent />

                  <View style={{height: 20}} />
    

                  <SwitchButton
                    FirstText="Voice"
                    SecondText="Multiple Choice"
                    width={width * 0.68}
                    height={0.045 * height}
                    mode={mode}
                    setMode={setMode}
                  />

                    {/* <View style={{height: 10}} /> */}

                  {/* Answer component */}
                  {mode === 0 ? ( 
                    // Voice answer card
                    <View style={{
                      height: height * 0.45,
                      width: width, // originally width
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <View style={{
                        height: height * 0.35,
                        width: width * 0.8,
                        borderRadius: 20,
                        backgroundColor: 'white',
                        marginTop: -0.08 * height,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.2,
                        shadowRadius: 30,
                        elevation: 10,
                      }}>
                        <TextInput
                          style={{
                            fontFamily: 'Baloo2-Regular',
                            fontSize: 15,
                            padding: 0.05 * width,
                          }}
                          multiline={true}
                          scrollEnabled={true}
                          value={transcribedText.transcribed_text}
                        />
                      </View>
                      <TouchableOpacity
                        activeOpacity={submitted ? 1 : 0.7}
                        style={{
                          height: 60,
                          width: 60,
                          borderRadius: 60,
                          marginTop: -80,
                          backgroundColor: recording ? 'red' : 'black',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => handleRecord()}
                      >   
                        {isLoading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <MaterialIcons 
                            name={recording ? 'square' : 'keyboard-voice'}
                            color='white'
                            size={recording ? 30 : 35}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // MC answer component 
                    <View style={{
                        height: height * 0.45,
                        width: width,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                    <ScrollView
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        alwaysBounceHorizontal={true}
                        snapToOffsets={data.options.map((_, index) => index * 0.88 * width)}
                        snapToEnd={false}
                        decelerationRate='fast'
                        style={{
                            width: width,
                        }}
                        contentContainerStyle={{
                            paddingLeft: 0.1 * width,
                            paddingRight: 0.1 * width, // Add right padding for better UX
                            height: height * 0.45, // adjust spacing above
                            alignItems: 'center',
                        }}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        >
                        {data.options.map((option, index) => {
                            const optionLetter = String.fromCharCode(65 + index); // Convert 0, 1, 2, etc. to A, B, C, etc.
                            return (
                            <Card
                                key={optionLetter}
                                option={optionLetter}
                                text={option}
                                width={width * 0.8}
                                height={height * 0.35}
                                isSelected={currentPressed === optionLetter}
                                isCardSubmitted={submitted}
                                isCardCorrectAnswer={optionLetter == data.answer}
                            />
                            );
                        })}
                        </ScrollView>
                        </View>
                  )}
                  <NextButtonComponent />
                </>
              )}
            </View>
          )}
        </View>
      );
}