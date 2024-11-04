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
import { getQuestionSet, storeSubmission } from '../components/localDb';

const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;

// At the top of your file, add this enum
const QuestionMode = {
    VOICE: 0,
    MULTIPLE_CHOICE: 1
};

export default function Question_Combined({ navigation, route }) {
    const [text, setText] = useState('');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { state } = useUser();
    const [mode, setMode] = useState(QuestionMode.VOICE);
    const { question_id: initialQuestionId, fromScreen, question_arr } = route.params;
    // If not from Assignments，then do not calculate totalQuestion and ignore buttons prev/next
    const isAssignment = fromScreen === 'Assignments';

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

    const [allQuestions, setAllQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(route.params.index);

    useEffect(() => {
        fetchQuestionSet();
    }, []);

    useEffect(() => {
        if (allQuestions.length > 0) {
            setData(allQuestions[currentQuestionIndex]);
            setCurrentPressed("A");
        }
    }, [currentQuestionIndex, allQuestions]);

    const animation = useRef(null);

    const triggerConfetti = () => {
        if (animation.current) {
          animation.current.play(0);
        }
      };

    const fetchQuestionSet = async () => {
        try {
            setIsLoading(true);
            const response = await getQuestionSet(
                state.uid,
                state.course_id,
                route.params.topic
            );

            console.log('[Question_MC] Question Set Received: ', response);

            if (response.status === 'success') {
                setAllQuestions(response.questions);
            } else {
                console.log('Error fetching question set (api message):', response.message);
            }
        } catch(error) {
            console.log('Error fetching question set (try catch): ', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle next question
    const handleNextQuestion = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setText('');
            setCurrentPressed("A");
            setAnswerResponse('');
            setTranscribedText({ status: '', message: '', transcribed_text: '' });
            setAllowSubmit(false);
            setVoiceSubmitted(false);
            setMcSubmitted(false);
        }
    };
    
    // Handle prev question
    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prevIndex => prevIndex - 1);
            setText('');
            setCurrentPressed("A");
            setAnswerResponse('');
            setTranscribedText({ status: '', message: '', transcribed_text: '' });
            setAllowSubmit(false);
            setVoiceSubmitted(false);
            setMcSubmitted(false);
        }
    };

 
    const handleScroll = (event) => {
        const xOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(xOffset / (width * 0.88)); // Calculate the index based on scroll position
        const options = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
        if (index >= 0 && index < options.length) {
            setCurrentPressed(options[index]);
            // console.log('Current pressed: ', options[index]);
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
        formData.append('course_id', state.course_id);
        formData.append('audio_file', file);
        try {
            const response = await fetch('https://backend.faradawn.site:8001/transcribe_and_grade', {
                method: 'POST',
                headers: { "Content-Type": "multipart/form-data" },
                body: formData
            });
            const response_data = await response.json();
            
            // Set transcribed text as before
            setTranscribedText(response_data);
            setText(response_data.transcribed_text);
            
            // Store submission details and show feedback modal
            await storeSubmission(response_data.submission_details);
            setAnswerResponse(response_data);
            setModalOpen(true);
            setVoiceSubmitted(true);
        } catch(error) {
            console.log('Error transcribing and grading text: ', error);
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
        setIsLoading(true);

        let score = null;
        if (mode === QuestionMode.MULTIPLE_CHOICE) {
            score = currentPressed === data.answer ? 3 : 0;
        }

        try {
            const response = await fetch('https://backend.faradawn.site:8001/submit_text_response', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: state.uid,
                    course_id: state.course_id,
                    question_id: data.question_id,
                    question: data.question,
                    transcribed_text: mode === QuestionMode.VOICE ? text : currentPressed,
                    practice_type: "ASSIGNMENT",
                    question_type: mode === QuestionMode.VOICE ? "VOICE" : "MC",
                    score: score
                })
            });
            const response_data = await response.json();
            console.log("Response data: ", response_data);
            setAnswerResponse(response_data);

            // Store the submission in local database
            await storeSubmission(response_data['submission_details']);
        } catch(error) {
            console.log("Error sending data or storing submission: ", error);
            
            // Create a fallback submission object
            const fallbackSubmission = {
                course_id: state.course_id,
                practice_type: "ASSIGNMENT",
                question_id: data.question_id,
                question_type: mode === QuestionMode.VOICE ? "VOICE" : "MC",
                score: mode === QuestionMode.MULTIPLE_CHOICE ? score : null,
                timestamp: new Date().toISOString(),
                uid: state.uid,
                user_response: mode === QuestionMode.VOICE ? text : currentPressed
            };
            
            // only store if multiple choice
            if(mode === QuestionMode.MULTIPLE_CHOICE){
                await storeSubmission(fallbackSubmission);
            }

            
        }

        if (mode === QuestionMode.VOICE) {
            setVoiceSubmitted(true);
        } else {
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
                if ((mode === QuestionMode.MULTIPLE_CHOICE && currentPressed === data.answer) || (mode === QuestionMode.VOICE && answerResponse && answerResponse.grade > 1)) {
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

                            <Image
                                source={stars.grade[answerResponse.grade]}
                                style={{
                                    height: height * 0.04,
                                    width: width * 0.3,
                                    marginVertical: height * 0.01,
                                }}
                            />

                        
                        {/* 2. Title */}
                        <Text style={{
                            fontFamily: 'Baloo2-Bold',
                            fontSize: 30,
                            textAlign: 'center',
                        }}>
                            {mode === QuestionMode.VOICE ? voiceModalTitle : 
                                (currentPressed === data.answer ? 'Congratulations!' : 'So close!')}
                        </Text>
                        
                        {/* 3. Body */}
                        <Text style={{
                            fontFamily: 'Baloo2-Regular',
                            fontSize: 16,
                            textAlign: 'center',
                            paddingTop: height * 0.02,
                        }}>
                            {mode === QuestionMode.VOICE ? answerResponse.feedback_body :
                                
                                (currentPressed === data.answer ? 'You are correct!' : `The correct answer is ${data.answer || 'not available'}`)}
                        </Text>
                    </View>
                </View>
            </Modal>
            </>
        )
    }


    // Prev and next icon
    // put direction button inside
    const DirectionButton = ({ onPress, disabled, direction = 'left' }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={{
                padding: 10, 
                opacity: disabled ? 0.5 : 1, 
                width: 90,
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <Feather 
                name={`chevron-${direction}`} 
                size={40} 
                color={disabled ? "gray" : "green"} 
            />
        </TouchableOpacity>
    );

    const QuizNavigation = ({ onPrev, onNext, currentQuestionIndex, totalQuestions }) => {
        return (
            <View className="absolute top-12 left-0 right-0 flex-row justify-between items-center px-4" style={{zIndex: 10}}>
                <DirectionButton
                    direction="left"
                    onPress={onPrev}
                    disabled={currentQuestionIndex === 0}
                />
                <Text style={{fontFamily: 'Baloo2-Regular', fontSize: 16, marginBottom: 30}}>
                    {`${currentQuestionIndex + 1} / ${totalQuestions}`}
                </Text>
                <DirectionButton
                    direction="right"
                    onPress={onNext}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                />
            </View>
        );
    };
    const sampleQuestion = "<p>" + "This is a very long question content to test the scroll functionality. ".repeat(20) + "</p>"    

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
                    pointerEvents="auto"
                    showsVerticalScrollIndicator={true}
                    style={{ flex: 1, maxHeight: height * 0.30 }} // 
                    contentContainerStyle={{
                      paddingBottom: 25, // 
                    }}
                    >
                        
                    <RenderHtml
                        contentWidth={width * 0.8}  // Adjust based on your padding/margin
                        source={{ html: data.question }}
                        tagsStyles={{
                        body: {
                            marginTop: height * 0.03,
                            marginHorizontal: 4,
                            padding: 20,
                            fontFamily: 'Baloo2-Bold',
                            fontSize: 16,
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
                style={{
                    backgroundColor: '#004643',
                    height: height * 0.06,
                    width: width * 0.75,
                    ...globalStyles.button
                }}
                onPress={() => handleNext()}
            >
                <Text style={globalStyles.buttonText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{display: 'flex', justifyContent: 'center', alignItems:'center'}}>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{alignItems: "center", justifyContent: "center", width: width, height: height}}>

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
                
             <TopBar navigateTo={fromScreen === 'HomeTab' ? 'HomeTab' : 'Assignments'} params={{topic: route.params.topic}}/>

            <QuizNavigation 
                onPrev={handlePrevQuestion} 
                onNext={handleNextQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={allQuestions.length}
            />

              
              {data.message === "No questions" ? (
                  <NoQuestionView />
                ) : (
                    <>
                  <ModalComponent />

                  <QuestionComponent />

                  <View style={{height: 0.01 * height}} />
    

                  <SwitchButton
                    FirstText="Voice"
                    SecondText="Multiple Choice"
                    width={width * 0.68}
                    height={0.045 * height}
                    mode={mode}
                    setMode={setMode}
                  />

                    <View style={{height: 0.01 * height}} />

                
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                  {/* Bottom component */}
                  {mode === QuestionMode.VOICE ? ( 
                    // Voice answer card
                    <View style={{
                      height: height * 0.4,
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
                    // MC answer component (Mark Zhang, commit on mainbranch: 2629865ec6315036ebbc6a70355abe372dbc5f3f)
                    <View style={{
                        height: height * 0.4,
                        width: width,
                        justifyContent: 'flex-start',
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
                            height: height * 0.4, // adjust spacing above
                            // alignItems: 'center',
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
                                isCardSubmitted={mcSubmitted}
                                isCardCorrectAnswer={optionLetter == data.answer}
                            />
                            );
                        })}
                        </ScrollView>
                        </View>

                )}
                </TouchableWithoutFeedback>
                <NextButtonComponent />
                </>
              )}


            </View>
          )}

        </KeyboardAvoidingView>            

        </View>
      );
}
