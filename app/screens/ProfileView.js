
import { View, Image, ImageBackground, Dimensions, TextInput, Button, SafeAreaView,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { useState } from 'react';
import {Calendar, LocaleConfig} from 'react-native-calendars';

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
// import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
// import { mergeProgress } from '../components/localDb';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April',
                'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'
              ],
  monthNamesShort: months,
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  today: "Today",
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
}
LocaleConfig.defaultLocale = 'en'

export default function ProfileView({ navigation }) {
  const { state, updateState } = useUser();
  
  const today = new Date()
  const dateToday = today.toISOString().slice(0, 10)

  let joinString = ''
  if (state.is_signed_in && !(typeof state.join_date === 'undefined')) {
      const joinMonth = months[parseInt(state.join_date.slice(5,7))-1]
      const joinDay = state.join_date.slice(8)
      const joinYear = state.join_date.slice(0,4)
      joinString = `Joined on ${joinMonth} ${joinDay}, ${joinYear}`
  }


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

  let practicedDates = new Set()
  let completedProblems = new Set()
  let markedDates = {}
  for (i = 0; i < problemsPracticed.length; i++){

    if (!problemsPracticed[i].isCompleted) {
      markedDates[problemsPracticed[i].date] = {customStyles: {
                                                    container: styles.startedDate
                                                  }}
    }

    else if (problemsPracticed[i].isCompleted) {
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
              <Text style={{marginTop: 0.012 * height}}></Text>

              <ProfilePicture imgSource={ProfileImage} />
              <Text style={[styles.title, {marginTop: 0.01 * height}]}>{state.username}</Text>
              <Text style={styles.text}>{joinString}</Text>
              <TouchableOpacity style={styles.upload_button} onPress={() => navigation.navigate('EditProfile')}>
                <Image
                    style={{marginLeft: -0.01 * width, marginRight: 0.01 * width}}
                    source={require('../../assets/images/pencil.svg')}
                  />
                <Text style={styles.text}>Edit My Profile</Text>
              </TouchableOpacity>

              <Text style={[styles.title, {marginRight: 'auto', marginLeft: 0.031 * width}]}>Achievements</Text>
              <View style={styles.achieveContainer}>
                <View style={styles.statsContainer}>
                  <Image
                    style={styles.achieve_icon}
                    source={require('../../assets/images/calendar_icon.png')}
                  />
                  <View style={styles.stats}>
                    <Text style={[styles.title, {fontSize: 0.03 * height, marginVertical: -0.01 * height}]}>
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
                  <View style={styles.stats}>
                    <Text style={[styles.title, {fontSize: 0.03 * height, marginVertical: -0.01 * height}]}>
                      {completedProblems.size}
                    </Text>
                    <Text style={styles.text}>problems finished</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.title, {marginRight: 'auto', marginLeft: 0.031 * width, marginVertical: -0.01 * height}]}>Practice Record</Text>
              <View style={styles.calendarContainer}>
                <Calendar
                  style={{
                    width: 0.91 * width,
                  }}
                  renderArrow = {
                    ( direction ) =>
                    {
                    if ( direction == 'left') return (
                    <View style={styles.arrow}>
                      <Ionicons name='chevron-back' size={30} color='#515856'/>
                    </View>
                  );
                    if ( direction == 'right') return (
                    <View style={styles.arrow}>
                      <Ionicons name='chevron-forward' size={30} color='#515856'/>
                    </View>                  );
                    }
                  }
                  theme={{
                    'stylesheet.calendar.main': {
                      dayContainer: {
                        flex: 1,
                        alignItems: 'center',
                        width: 0.1 * width,
                        height: 0.05 * height,
                        marginTop: -0.01 * height
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
                    textDayFontSize: 0.025 * height,
                    textMonthFontSize: 0.024 * height,
                    textDayHeaderFontSize: 0.025 * height,
                  }}
                  current={dateToday}
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
    fontSize: 0.026 * height,
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
    marginVertical: 0.02 * height,
    height: 0.04 * height,
    width: 0.33 * width,
  },
  achieveContainer: {
    flex: 1,
    flexDirection: 'row',
    //marginBottom: -0.02 * height
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
    marginHorizontal: 0.01 * width,
    height: 0.085 * height,
    width: 0.46 * width
  },
  text: {
    color: '#515856', 
    fontSize: 0.017 * height, 
    fontFamily: 'Baloo2-Regular',
  },
  stats: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginLeft: -0.01 * width,
  },
  completedDate: {
      
      // flex: 1,
      // flexDirection: 'column',
      // alignContent: 'flex-start',
      // justifyContent: 'flex-end',
      // textAlign: 'flex-start',
      width: 0.05 * height,
      height: 0.05 * height,
      borderRadius: 0.05 * height,
      borderWidth: 2,
      borderColor: '#4B7C7B',
  },
  startedDate: {
      // flex: 1,
      // flexDirection: 'column',
      // justifyContent: 'center',
      // textAlign: 'center',
      width: 0.05 * height,
      height: 0.05 * height,
      borderRadius: 0.05 * height,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: '#F8A101',
  },
  arrow: {
    width: 0.035 * height,
    height: 0.035 * height,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 124, 123, 0.14)',
    borderRadius: 4
  },
  achieve_icon: {
    width: 0.038 * height, 
    height: 0.038 * height, 
    marginHorizontal: 0.04 * width, 
    marginTop: -0.03 * height
  }
});
