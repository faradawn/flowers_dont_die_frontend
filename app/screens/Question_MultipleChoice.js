import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, Text, View, Dimensions, TouchableOpacity, Modal, ActivityIndicator, TextInput, Image, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Animated, PanResponder } from 'react-native';
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
import { useFocusEffect } from '@react-navigation/native';

const height = Dimensions.get('window').height * 0.95;
const width = Dimensions.get('window').width;

// At the top of your file, add this enum
//HERE
const QuestionMode = {
    VOICE: 0,
    MULTIPLE_CHOICE: 1
};

const CustomHeaderBar = ({navigation, fromScreen, currentQuestionIndex, totalQuestions, data}) => {
    return (
        <View style = {{
            width,
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 10
        }}>
            <TouchableOpacity onPress={()=> navigation.goBack()}>
                <Ionicons name = "close" size={24} color="black"/>
            </TouchableOpacity>
            <Text style = {{
                color: 'black',
                fontFamily: 'Baloo2-Bold', 
                fontSize: 16
            }}>
                {`${currentQuestionIndex + 1} / ${totalQuestions}`}
            </Text>
            <Text style = {{
                color: 'black', 
                fontFamily: 'Baloo2-Bold',
                fontSize: 16
            }}>
                {data && data.difficulty}
            </Text>
        </View>
    );
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
    const [voiceLoading, setVoiceLoading] = useState(false);

    // Common state
    const [voiceSubmitted, setVoiceSubmitted] = useState(false);
    const [mcSubmitted, setMcSubmitted] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [seconds, setSeconds] = useState(90);
    const [intervalId, setIntervalId] = useState(null);
    const [answerResponse, setAnswerResponse] = useState('');

    const [allQuestions, setAllQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(route.params.index);

    //fix bug where after hitting x, and reentering q, q and other data is wrong
    //fetch questuin set everytime you reload screen
    useFocusEffect(
        useCallback(() => {
            fetchQuestionSet();
        }, [])
    );

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
        setModalOpen(false);
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
            setModalOpen(false);
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
        setVoiceLoading(true);
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
        setVoiceLoading(false);
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
    //const handleErase = () => {
    //    setText('');
    //};
    //logic for try again ->reset to pre submission state
    const resetQuestion = () => {
        setText('');
        setCurrentPressed("A");
        setAnswerResponse('');
        setTranscribedText({status: '', message: '', transcribed_text: '' });
        setAllowSubmit(false);
        setVoiceSubmitted(false);
        setModalOpen(false);
    };
    const handleTryAgain = () => {
        resetQuestion();

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
                const isCorrect = (mode === QuestionMode.MULTIPLE_CHOICE && currentPressed === data.answer) || (mode === QuestionMode.VOICE && answerResponse && answerResponse.grade > 1);
                if (isCorrect){
                    triggerLongHapticFeedback();
                    triggerConfetti();
                } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                } 
            }
        }, [modalOpen]);

        const isCorrect = (mode === QuestionMode.MULTIPLE_CHOICE && currentPressed === data.answer) || (mode === QuestionMode.VOICE && answerResponse && answerResponse.grade > 1) ;

        const feedbackTitle = isCorrect
            ? '🎉 You got the right answer'
            : '💭 Want to try again';
        
        const solutionText = data.options && data.answer
            //make solution text correct
            ? data.options[data.answer.charCodeAt(0) - 65]  
            : (mode === QuestionMode.VOICE ? text : currentPressed);

        
        //const voiceModalTitle =  answerResponse.feedback_title || 'Not Submitted';
        const collapsedHeight = height * 0.35; //height with only feedback showiing so solution only shows after scroll
        const expandedHeight = height * 0.8; //show solution after scroll
        const handleHeight = 30; //swipe when showing only feedback ->collapsed modal
        const [modalStatus, setModalStatus] = useState('collapsed');
        const modalHeightAnim = useRef(new Animated.Value(collapsedHeight)).current;

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onPanResponderMove: (evt, gestureState) => {
                    let currentHeight = modalStatus === 'expanded' ? expandedHeight: collapsedHeight;
                    let newHeight = currentHeight - gestureState.dy;
                    if (newHeight > expandedHeight) newHeight = expandedHeight;
                    if (newHeight < handleHeight) newHeight = handleHeight;
                    modalHeightAnim.setValue(newHeight);
                },
                onPanResponderRelease: (evt, gestureState) => {
                    if (gestureState.dy < -50) {
                        Animated.timing(modalHeightAnim, {
                            toValue: expandedHeight,
                            duration: 300,
                            useNativeDriver: false,
                        }).start(() => setModalStatus('expanded'));
                    }else if (gestureState.dy >50) {
                        if(modalStatus === 'expanded'){
                            Animated.timing(modalHeightAnim, {
                                toValue: collapsedHeight, 
                                duration: 300,
                                useNativeDriver: false,
                            }).start(() => setModalStatus('collapsed'));
                        }else if (modalStatus === 'collapsed'){
                            Animated.timing(modalHeightAnim, {
                                toValue: handleHeight,
                                duration: 300,
                                useNativeDriver: false,
                            }).start(() => {
                            setModalStatus('minimized')
                            resetQuestion()
                        });
                            //dismiss modal

                        } else if (modalStatus === 'minimized'){
                            //setModalOpen(false);
                            resetQuestion();
                            //modalHeightAnim.setValue(collapsedHeight);
                        }
                    }else{
                        //not swiped snoughed
                        let targetHeight = modalStatus === 'expanded' ? expandedHeight : (modalStatus === 'collapsed' ? collapsedHeight : handleHeight);
                        Animated.timing(modalHeightAnim, {
                            toValue: targetHeight,
                            duration: 300,
                            useNativeDriver: false,
                        }).start();
                    }
                },
            })
        ).current;

        return (
            <Modal
                visible={modalOpen}
                transparent={true}
                animationType="slide"
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}>
                    <Animated.View style={{
                        width:'100%',
                        height: modalHeightAnim,
                        //maxHeight: height * 0.6, //maybe make smaller
                        //paddingHorizontal: width * 0.05,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 25,
                        borderTopRightRadius: 25,
                        paddingTop: 20,
                        paddingBottom: 60,
                        //paddingVertical: height * 0.03,
                        paddingHorizontal: 20,
                        //justifyContent: 'flex-start',
                        //alignItems: 'center',
                        //shadowColor: '#000',
                        //shadowOffset: { width: 0, height: 2 },
                        //shadowOpacity: 0.25,
                        //shadowRadius: 4,
                        //elevation: 5,
                        position: 'relative',
                    }}
                    {...panResponder.panHandlers}>
                             {/* 0. close bottom (removed and repalced with scroll bar)*/}
                        <View
                            style = {{
                                width: 40,
                                height: 4,
                                backgroundColor: 'gray',
                                borderRadius: 2,
                                alignSelf: 'center',
                                marginBottom: 8
                            }} />
                        
                        
                        <LottieView
                        //confetti
                            ref={animation}
                            source={require('../../assets/animations/confettie_bottom.json')}
                            loop={false}
                            style={{position: 'absolute', top:0, bottom: 0, left: 0, right: 0}}
                            resizeMode='cover'
                        />
                        <ScrollView
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle = {{paddingBottom:20}}>

                            <Text style={{
                                fontFamily: 'Baloo2-Bold',
                                fontSize: 16,
                                textAlign: 'center',
                                marginBottom: 12
                            }}>
                                {feedbackTitle}
                            </Text>

                            {/* "Feedback" label + feedback body */}
                            <Text style={{ 
                                fontFamily: 'Baloo2-Bold', 
                                fontSize: 14, 
                                marginBottom: 4 
                            }}>
                                Feedback
                            </Text>
                            <Text style={{
                                fontFamily: 'Baloo2-Regular',
                                fontSize: 14,
                                marginBottom: 16
                            }}>
                                {answerResponse && answerResponse.feedback_body
                                    ? answerResponse.feedback_body
                                    : 'No feedback available.'}
                            </Text>

                            {/* "Solution" label + user-submitted solution (scrollable if large) */}
                            <Text style={{ 
                                fontFamily: 'Baloo2-Bold', 
                                fontSize: 14, 
                                marginBottom: 4 
                            }}>
                                Solution
                            </Text>
                            <RenderHtml //Faradawn feedback -> Make soluton render html
                                contentWidth={width * 0.9}
                                source = {{html: solutionText}}
                            />
                        </ScrollView>
                            {isCorrect ? (
                                <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 20,
                                    right: 20,
                                    backgroundColor: 'green',
                                    borderRadius: 8,
                                    height: 45,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={handleNextQuestion}
                            >
                                <Text style={{ color: 'white', fontFamily: 'Baloo2-Bold' }}>
                                    Next
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{
                                position: 'absolute',
                                bottom: 10,
                                left: 20,
                                right: 20,
                                flexDirection: 'row'
                            }}>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'green',
                                        borderRadius: 8,
                                        height: 45,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 5
                                    }}
                                    onPress={handleTryAgain}
                                >
                                    <Text style={{ color: 'white', fontFamily: 'Baloo2-Bold' }}>
                                        Try Again
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        flex: 1,
                                        backgroundColor: 'gray',
                                        borderRadius: 8,
                                        height: 45,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginLeft: 5
                                    }}
                                    onPress={handleNextQuestion}
                                >
                                    <Text style={{ color: 'white', fontFamily: 'Baloo2-Bold' }}>
                                        Next
                                    </Text>
                                </TouchableOpacity>
                            </View>


                            )}
                    </Animated.View>
                </View>
            </Modal>
        );
    };

    //deleted quiz nav

    // Prev and next icon
    // put direction button inside
    //removed quiz nav and direction button
      const SubmissionPanel = () => {
      
        return (
          <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              paddingVertical: 5
          }}>
            <TouchableOpacity 
                onPress={handleTryAgain} 
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Feather name="rotate-ccw" size={20} color="green" />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={handleRecord}
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginHorizontal: 4,
                    backgroundColor: recording ? '#ef4444' : '#166534'
                }}
            >
                {voiceLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Feather 
                    name={recording ? "square" : "mic"} 
                    size={32} 
                    color="white" 
                />
                )}
                
                
               
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={handleNext} 
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
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
                //height: height * 0.35, //remove to test text layout
                //justifyContent: 'center',
                //alignItems: 'center',
                paddingHorizontal: 20,
                marginTop: 10
            } } 
        >
           
            
                <ScrollView
                    pointerEvents="auto"
                    showsVerticalScrollIndicator={true}
                    style={{maxHeight: height * 0.3 }} // 
                    contentContainerStyle={{
                      paddingBottom: 25, // 
                    }}
                    >
                        
                    <RenderHtml
                        contentWidth={width * 0.9}  // Adjust based on your padding/margin
                        source={{ html: data.question }}
                        tagsStyles={{
                        body: {
                            //marginTop: height * 0.03,
                            //marginHorizontal: 4,
                            margin: 0,
                            padding: 0,
                            fontFamily: 'Baloo2-Bold',
                            fontSize: 16,
                            lineHeight: 22,
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
    );

   //removed voice answer card
    const NextButtonComponent = () => (
        <View style={{ 
            width: width,
            marginTop: 20,
            marginBottom: height * 0.08,
            alignItems: 'center',
            justifyContent: 'center',
            //marginTop: height * -0.04,
            //marginBottom: height * 0.08,
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
              //paddingTop: 70
            }}>
                
            <CustomHeaderBar
                navigation={navigation}
                fromScreen={fromScreen}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={allQuestions.length}
                data={data}
                //here
            />



            
            <View style={{ width: '100%', height: 1, backgroundColor: 'black' }} />

            
              
              {data.message === "No questions" ? (
                  <NoQuestionView />
                ) : (
                    <>
                  <ModalComponent /> 
                    <View style = {{
                        width: '100%',
                        height: height * 0.3
                    }}>
                  <QuestionComponent />
                  </View>
                
                  <View style={{
                    width: '100%',
                    height: height * 0.7,
                    alignItems: 'center',
                    }} >
                        <View style = {{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginTop: 8,
                            width: '90%'
                        }}>
                    <Text style = {{
                        fontFamily: 'Baloo2-Bold',
                        fontSize: 16,
                        color: 'black',
                        marginRight: 8
                    }}>
                            See options
                        </Text>
                        <View style = {{
                            shadowColor: '#000',
                            shadowOffset: {width: 0, height: 2},
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 3,
                            backgroundColor: mode === QuestionMode.VOICE ? '#FFFFFF' : '#FADADD', // light pink background
                            borderRadius: 16,
                        }}>
                            <SwitchButton
                    mode={mode}
                    setMode={setMode}
                    FirstText=""
                    SecondText=""
                    //TouchableOpacity={100}
                    //shadowOpacity = {100}
                    width={66}
                    height={32}
                    //spacing= {-32}
                    activeColor = "#E28089"
                    inactiveColor = "#E28089"
                    backgroundColor={mode === 0 ? '#FFFFFF' : '#F9DADA'} 
                  />

                        </View>
                  </View>

                    <View style={{height: 0.02 * height}} />

                
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                  {/* Bottom component */}
                  {mode === QuestionMode.VOICE ? ( 
                    // Voice answer card
                    //<VoiceAnswerCard />
                  //) : (
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
                </View>
                </>
              )}


            </View>
          )}

        </KeyboardAvoidingView>            

        </View>
      );
}