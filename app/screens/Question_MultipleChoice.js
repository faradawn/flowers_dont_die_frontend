import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, View, Dimensions, TouchableOpacity, Modal, ActivityIndicator, TextInput, Image, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import { globalStyles, stars } from '../globalStyles/globalStyles';
import Card from '../components/QuestionCard';
import { useUser } from '../components/UserContext';
import RenderHtml from 'react-native-render-html';
import SwitchButton from '../components/SwitchButton';
import { Feather } from '@expo/vector-icons';

import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';

import TopBar from '../components/TopBar';


const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;

export default function Question_Combined({ navigation, route }) {
    const [text, setText] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { state } = useUser();
    const [mode, setMode] = useState(0); // 0 for voice, 1 for multiple choice
    const {question_id, fromScreen }= route.params;

    // Multiple choice state
    const [currentPressed, setCurrentPressed] = useState("A");

    // Voice state
    const [recording, setRecording] = useState();
    const [outputURI, setOutputURI] = useState('');
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [allowSubmit, setAllowSubmit] = useState(false);
    const [transcribedText, setTranscribedText] = useState({ status: '', message: '', transcribed_text: '' });

    // Common state
    const [voiceSubmitted, setVoiceSubmitted] = useState(false);
    const [mcSubmitted, setMcSubmitted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [seconds, setSeconds] = useState(90);
    const [intervalId, setIntervalId] = useState(null);
    const [answerResponse, setAnswerResponse] = useState('');

    const animation = useRef(null);

    const triggerConfetti = () => {
        if (animation.current) {
          animation.current.play(0);
        }
      };


    // Fetch questions
    const fetchQuestions = async () => {
        try {
            const response = await fetch('https://backend.faradawn.site:8001/get_question', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: state.uid,
                    course_id: state.course_id,
                    question_id: state.question_id,
                }),
            });

            const response_data = await response.json();
            console.log('Question Data Received: ', response_data);

            
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

    // // Timer logic
    // useEffect(() => {
    //     let interval;
    //     if (!mcSubmitted && !voiceSubmitted) { // if user has not submit
    //         interval = setInterval(() => {
    //             setSeconds((prevSeconds) => {
    //                 if(prevSeconds > 0) return prevSeconds - 1;
    //                 return 0;
    //             });
    //         }, 1000);
    //     }
    //     setIntervalId(interval);
    //     return () => clearInterval(interval);
    // }, [mcSubmitted, voiceSubmitted]);


    // === MC
    const handleChooseOption = (option) => { 
        if(mcSubmitted){
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
            const response = await fetch('https://backend.faradawn.site:8001/transcribe', {
                method: 'POST',
                headers: { "Content-Type": "multipart/form-data" },
                body: formData
            });
            const response_data = await response.json();
            setTranscribedText(response_data);
            setText((prevText) => `${prevText} ${response_data.transcribed_text}`);
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

    useEffect(() => {
        if (fromScreen) {
            console.log('Navigated from:', fromScreen);
        }
        fetchQuestions();
    }, [fromScreen]);

    // Handle submission
    const handleNext = async () => {
        // If button displays "Submit"
        setIsLoading(true);

        if(mode === 0) {
            // Voice submission
            try {
                const response = await fetch('https://backend.faradawn.site:8001/submit_text_response', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        uid: state.uid,
                        question_id: data.question_id,
                        question: data.question,
                        transcribed_text: text,
                    })
                });
                const response_data = await response.json();
                setAnswerResponse(response_data);
            } catch(error) {
                console.log("Error sending data: ", error);
            }
            setVoiceSubmitted(true);

        } else {
            // Multiple choice submission
            try {
                const response = await fetch('https://backend.faradawn.site:8001/submit_answer', {
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
            setMcSubmitted(true);
        }

        setIsLoading(false);
        setModalOpen(true);
        if (intervalId) { 
            clearInterval(intervalId);
        }
    };

    // handle erase ansswer 
    const handleErase = () => {
        setText('');
    };
    

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

    const triggerLongHapticFeedback = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(resolve => setTimeout(resolve, 900));
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      };

    const ModalComponent = () => {
        useEffect(() => {
            if (modalOpen) {
                if ((mode === 1 && currentPressed === data.answer) || (mode === 0 && answerResponse && answerResponse.grade > 1)) {
                    triggerLongHapticFeedback();
                    triggerConfetti();
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                } 
            }
        }, [modalOpen]);

        const voiceModalTitle =  answerResponse.feedback_title || 'Not Submitted';

        return (
            <>
            
            
            
            <Modal
                visible={modalOpen}
                transparent={true}
                animationType="fade"
            >
                

                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <View style={{
                        width: width * 0.8,
                        paddingVertical: height * 0.05,
                        paddingHorizontal: width * 0.05,
                        backgroundColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                        elevation: 5,
                        position: 'relative',
                    }}>

                        <LottieView
                            ref={animation}
                            source={require('../../assets/animations/confettie_bottom.json')}
                            loop={false}
                            style={{position: 'absolute', top:0, bottom: 0, left: 0, right: 0}}
                            resizeMode='cover'
                        />
                        {/* 0. close bottom */}
                        <Ionicons 
                            name="close-outline"
                            size={25}
                            onPress={() => { setModalOpen(false) }}
                            style={{
                                position: 'absolute',
                                top: 20,
                                right: 20,
                            }}
                        />

                        {/* 1. Star */}
                        { mode === 0 && answerResponse.grade !== 0 && (
                            <Image
                                source={stars.grade[answerResponse.grade]}
                                style={{
                                    height: height * 0.04,
                                    width: width * 0.3,
                                    marginVertical: height * 0.01,
                                }}
                            />
                        )}
                        
                        {/* 2. Title */}
                        <Text style={{
                            fontFamily: 'Baloo2-Bold',
                            fontSize: 30,
                            textAlign: 'center',
                        }}>
                            {mode === 0 ? voiceModalTitle : 
                                (currentPressed === data.answer ? 'Congratulations!' : 'Sorry!')}
                        </Text>
                        
                        {/* 3. Body */}
                        <Text style={{
                            fontFamily: 'Baloo2-Regular',
                            fontSize: 16,
                            textAlign: 'center',
                            paddingTop: height * 0.02,
                        }}>
                            {mode === 0 ? answerResponse.feedback_body :
                                (currentPressed === 'Time ran out' ? 'Your time ran out.' : 
                                (currentPressed === data.answer ? 'You are correct!' : `The correct answer is ${data.answer || 'not available'}`))}
                        </Text>
                    </View>
                </View>
            </Modal>
            </>
        )
    }


    // Prev and next icon
    const QuizNavigation = ({ onPrev, onNext }) => {
        return (
          <View className="absolute top-20 left-0 right-0 flex-row justify-between items-center px-8 h-12">
            <TouchableOpacity onPress={onPrev} className="p-2">
              <Feather name="chevron-left" size={30} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onNext} className="p-2">
              <Feather name="chevron-right" size={30} color="green" />
            </TouchableOpacity>
          </View>
        );
      };

      const SubmissionPanel = () => {
        
      
        return (
          <View className="flex-row items-center justify-between px-14 py-5">
            <TouchableOpacity onPress={handleErase} className="w-12 h-12 rounded-full bg-white items-center justify-center">
              <Feather name="rotate-ccw" size={20} color="green" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleRecord}
              className={`w-16 h-16 rounded-full items-center justify-center mx-4 ${recording ? 'bg-red-500' : 'bg-green-800'}`}
            >
              <Feather 
                name={recording ? "square" : "mic"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNext} className="w-12 h-12 rounded-full bg-white items-center justify-center">
              <Feather name="send" size={20} color="green" />
            </TouchableOpacity>
          </View>
        );
      };



    const QuestionComponent = () => (
        // {/* Question Component */}
        <View
            style = { { 
                width: width,
                height: height * 0.35,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10
            } } 
        >
            {/* Countdown Timer */}
            <View
                style = { {
                    width: 80,
                    height: 80,

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
                        fontSize: 15, // previously 20
                        fontWeight: 'bold',
                        fontFamily: 'Baloo2-Bold' 
                    } }
                > 
                    { data.difficulty } 
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
            {/* TODO: understand this logic */}
            <TouchableOpacity
                activeOpacity={(mode === 0 && !allowSubmit) || (mode === 1 && currentPressed == "Not Touched" && !mcSubmitted) ? 1 : 0.7}
                style={{
                    backgroundColor: (mode === 0 && !allowSubmit) || (mode === 1 && currentPressed == 'Not Touched' && !mcSubmitted) ? '#3c716f' : '#004643',
                    height: height * 0.06,
                    width: width * 0.75,
                    ...globalStyles.button
                }}
                onPress={() => handleNext()}
            >
                <Text style={globalStyles.buttonText}>{((mode == 0 && voiceSubmitted) || (mode == 1 && mcSubmitted)) ? 'Go home' : 'Submit'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems:'center'}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{alignItems: "center", justifyContent: "center"}}>

          {isLoading ? (
            <ActivityIndicator size="large" color="gray" />
        ) : (
            // main quiz view 
            
            <View style={{
              width: width,
              height: height,
              backgroundColor: globalStyles.container.backgroundColor,
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              paddingTop: 70
            }}>
                
                <TopBar navigateTo={fromScreen === 'HomeTab' ? 'HomeTab' : 'Assignments'} />


              <QuizNavigation 
                onPrev={() => {/* Handle previous question */}} 
                onNext={() => {/* Handle next question */}}
                />

              
              {data.message === "No questions" ? (
                  <NoQuestionView />
                ) : (
                    <>
                  <ModalComponent />

                  <QuestionComponent />

                  <View style={{height: 20}} />
    

                  <SwitchButton
                    FirstText="Practice"
                    SecondText="Answer"
                    width={width * 0.68}
                    height={0.045 * height}
                    mode={mode}
                    setMode={setMode}
                  />

                    <View style={{height: 20}} />

                  {/* Bottom component */}
                  {mode === 0 ? ( 
                    // Voice answer card
                    <View style={{
                      height: height * 0.45,
                      width: width, // originally width
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                        
                    
                      <View style={{
                        height: height * 0.35,
                        width: width * 0.8,
                        borderRadius: 20,
                        backgroundColor: 'white',

                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 20 },
                        shadowOpacity: 0.2,
                        shadowRadius: 30,
                        elevation: 10,
                        justifyContent: 'space-between'
                      }}>

                        

                        {/* Text box */}
                        <TextInput
                          style={{
                            fontFamily: 'Baloo2-Regular',
                            fontSize: 15,
                            padding: 0.05 * width,
                          }}
                          multiline={true}
                          scrollEnabled={true}
                          placeholder="Type here or record..."
                            value={text}
                            onChangeText={setText}
                            keyboardType="default"
                        />

                        {/* Microphone stripe */}
                        <SubmissionPanel />

                      </View>

                      
                        

                    </View>
                        
                    
                  ) : (
                    // MC answer component 
                    <View style={{
                        height: height * 0.45,
                        width: width,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}>
                        <Card
                            text={data.options[0]}
                            width={width * 0.8}
                            height={height * 0.35}
                        />      
                    </View>
                )}
                
                </>
              )}


            </View>
          )}

</KeyboardAvoidingView>            
</TouchableWithoutFeedback>
        </View>
      );
}