import * as ImagePicker from 'expo-image-picker';
import { View, Image, ImageBackground, Dimensions, TextInput, Button, SafeAreaView,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

// adjusted values are for easier pixel scaling with the figma
const adjustedHeight = height / 932
const adjustedWidth = width / 430

const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  monthNamesShort: months,
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  today: "Aujourd'hui",
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
}
LocaleConfig.defaultLocale = 'en'

export default function ProfileView({ navigation }) {
  const [infoCorrect, setInfoCorrect] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginData, setLoginData] = useState(null);
   const { state, updateState } = useUser();
  
  const today = new Date()
  const dateToday = today.toISOString().slice(0, 10)

  // temporary dates for calendar
  let tomorrow = new Date(today); 
  tomorrow.setDate(today.getDate() + 1); 
  const dateTomorrow = tomorrow.toISOString().slice(0, 10)

  let overmorrow = new Date(today); 
  overmorrow.setDate(today.getDate() + 2)
  const dateOvermorrow = overmorrow.toISOString().slice(0, 10)

  const problemsPracticed = [
    {name: 'Test 1', date: dateTomorrow, isCompleted: true},
    {name: 'Test 2', date: dateOvermorrow, isCompleted: false},
  ]

  const joinMonth = months[parseInt(state.join_date.slice(5,7))]
  const joinDay = state.join_date.slice(8)
  const joinYear = state.join_date.slice(0,4)

  let joinString = `Joined on ${joinMonth} ${joinDay}, ${joinYear}`
  if ( state.is_signed_in == false) {
    joinString = ''
  }


  let practicedDates = new Set()
  let completedProblems = new Set()
  let markedDates = {}
  for(i=0; i < problemsPracticed.length; i++){
    // practiced, but not completed problems
    if (problemsPracticed[i].isCompleted == false) {
      markedDates[problemsPracticed[i].date] = {customStyles: {
                                                    container: styles.startedDate
                                                  }}
    }
    // completed problems
    else if (problemsPracticed[i].isCompleted == true) {
      completedProblems.add(problemsPracticed[i])
      // if different problem set has been completed/practiced on that date, then don't override the previous marking
      if (!practicedDates.has(problemsPracticed[i].date)) {
        markedDates[problemsPracticed[i].date] = {customStyles: {
                                                      container: styles.completedDate
                                                    }}
      }
    }
    practicedDates.add(problemsPracticed[i].date)
  }
  
  const ProfileImage = require('../../assets/images/DefaultAvatar.png')

  return ( 
    <View
      style={{
          height: height,
          width: width,
          ...globalStyles.container,
          flexDirection: 'column',
          overflow: 'hidden'
      }}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{flex: 1, alignItems: "center", justifyContent: "center"}}
          >   
              <Text style={{marginTop: 12 * adjustedHeight}}></Text>

              <ProfilePicture imgSource={ProfileImage} />
              <Text style={[styles.title, {marginTop: 10 * adjustedHeight}]}>{state.username}</Text>
              <Text style={styles.text}>{joinString}</Text>
              <TouchableOpacity style={styles.upload_button} onPress={() => navigation.navigate('EditProfile')}>
                <Image
                    style={{marginLeft: -3 * adjustedWidth, marginRight: 3 * adjustedWidth}}
                    source={require('../../assets/images/pencil.svg')}
                  />
                <Text style={styles.text}>Edit My Profile</Text>
              </TouchableOpacity>

              <Text style={[styles.title, {marginRight: 'auto', marginLeft: 15 * adjustedWidth}]}>Achievements</Text>
              <View style={styles.achieveContainer}>
                <View style={styles.statsContainer}>
                  <Image
                    style={styles.achieve_icon}
                    source={require('../../assets/images/calendar_icon.png')}
                  />
                  {/* <Ionicons name="calendar-outline" size={32 * adjustedHeight} color="#FF8C8C" style={{marginHorizontal: 20 * adjustedHeight}}/> */}
                  <View style={styles.stats}>
                    <Text style={[styles.title, {fontSize: 30 * adjustedHeight, marginVertical: -10 * adjustedHeight}]}>
                      {practicedDates.size}
                    </Text>
                    <Text style={styles.text}>Days practiced</Text>
                  </View>
                </View>
                <View style={styles.statsContainer}>
                  <Image
                    style={styles.achieve_icon}
                    source={require('../../assets/images/book_icon.png')}
                  />
                  {/* <Ionicons name="book" size={32 * adjustedHeight} color="#FF8C8C" style={{marginHorizontal: 20 * adjustedHeight}}/> */}
                  <View style={styles.stats}>
                    <Text style={[styles.title, {fontSize: 30 * adjustedHeight, marginVertical: -10 * adjustedHeight}]}>
                      {completedProblems.size}
                    </Text>
                    <Text style={styles.text}>problems finished</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.title, {marginRight: 'auto', marginLeft: 15 * adjustedWidth, marginVertical: -10 * adjustedHeight}]}>Practice Record</Text>
              <View style={styles.calendarContainer}>
                <Calendar
                  // Customize the appearance of the calendar
                  style={{
                    width: 0.91 * width,
                  }}
                  renderArrow = {
                    ( direction ) =>
                    {
                    if ( direction == 'left') return (
                    <View style={styles.arrow}>
                      <Ionicons name='chevron-back' size={30} color='#515856' style={{marginRight: 2 * adjustedWidth}}/>
                    </View>
                  );
                    if ( direction == 'right') return (
                    <View style={styles.arrow}>
                      <Ionicons name='chevron-forward' size={30} color='#515856' style={{marginLeft: 2 * adjustedWidth}}/>
                    </View>                  );
                    }
                  }
                  theme={{
                    'stylesheet.calendar.main': {
                      dayContainer: {
                        flex: 1,
                        alignItems: 'center',
                        width: 47 * adjustedWidth,
                        height: 47 * adjustedHeight,
                        marginTop: -15
                      },
                    },
                    backgroundColor: '#f2f2f2',
                    calendarBackground: '#f2f2f2',
                    // textSectionTitleColor: '#b6c1cd',
                    // selectedDayBackgroundColor: '#00adf5',
                    // selectedDayTextColor: '#ffffff',
                    arrowColor: '#141917',
                    todayTextColor: '#515856',
                    dayHeaderTextColor: '#8C9391',
                    dayTextColor: '#515856',
                    textDayFontFamily: 'Baloo2-Regular',
                    textMonthFontFamily: 'Baloo2-Regular',
                    textDayHeaderFontFamily: 'Baloo2-Regular',
                    textDayFontSize: 22 * adjustedHeight,
                    textMonthFontSize: 21 * adjustedHeight,
                    textDayHeaderFontSize: 22 * adjustedHeight,
                  }}
                  // Specify the current date
                  current={dateToday}
                  // Callback that gets called when the user selects a day
                  onDayPress={day => {
                    console.log('selected day', day);
                  }}
                  markingType={'custom'}
                  markedDates={markedDates}
                />
              </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#141917',
    fontFamily: 'Baloo2-Regular',
    fontSize: 25 * adjustedHeight,
  },
  upload_button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#4b7c7b',
    borderBottomColor: '#4b7c7b',
    backgroundColor: "#fff",
    borderWidth: 1, 
    borderRadius: 14,
    marginVertical: 20 * adjustedHeight,
    height: 40 * adjustedHeight,
    width: 140 * adjustedWidth,
  },
  achieveContainer: {
    flex: 1,
    flexDirection: 'row',
    //marginBottom: -20 * adjustedHeight
  },
  calendarContainer: {
    flex: 4,
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#4b7c7b',
    borderBottomColor: '#4b7c7b',
    backgroundColor: "#f6f6f6",
    borderWidth: 1, 
    borderRadius: 14,
    marginHorizontal: 5 * adjustedWidth,
    height: 80 * adjustedHeight,
    width: 195 * adjustedWidth
  },
  text: {
    color: '#515856', 
    fontSize: 16 * adjustedHeight, 
    fontFamily: 'Baloo2-Regular',
  },
  stats: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginLeft: -5 * adjustedHeight,
  },
  completedDate: {
      
      // flex: 1,
      // flexDirection: 'column',
      // alignContent: 'flex-start',
      // justifyContent: 'flex-end',
      // textAlign: 'flex-start',
      width: 47 * adjustedHeight,
      height: 47 * adjustedHeight,
      borderRadius: 47 * adjustedHeight,
      borderWidth: 2,
      borderColor: '#4B7C7B',
  },
  startedDate: {
      // flex: 1,
      // flexDirection: 'column',
      // justifyContent: 'center',
      // textAlign: 'center',
      width: 47 * adjustedHeight,
      height: 47 * adjustedHeight,
      borderRadius: 47 * adjustedHeight,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#F8A101',
  },
  arrow: {
    width: 33 * adjustedHeight,
    height: 33 * adjustedHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 124, 123, 0.14)',
    borderRadius: 4
  },
  achieve_icon: {
    width: 36 * adjustedHeight, 
    height: 36 * adjustedHeight, 
    marginHorizontal: 17 * adjustedWidth, 
    marginTop: -24 * adjustedHeight
  }
});
