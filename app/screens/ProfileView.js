import * as ImagePicker from 'expo-image-picker';
import { View, Image, ImageBackground, Dimensions, TextInput, Button, SafeAreaView,
    Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { SelectList } from 'react-native-dropdown-select-list'
import {Calendar, LocaleConfig} from 'react-native-calendars';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ProfilePicture from '../components/ProfilePicture';
import { globalStyles } from '../globalStyles/globalStyles';
import { useUser } from '../components/UserContext'
import { saveLoginInfo, getLoginInfo } from '../components/SecureStoreUtils'; // Adjust the path as necessary
import { mergeProgress } from '../components/localDb';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const adjustedHeight = height / 932
const adjustedWidth = width / 430
const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const username = 'Name Name'
const joinDate = '2024-01-24'

const joinMonth = months[parseInt(joinDate.slice(5,7))]
const joinDay = joinDate.slice(8)
const joinYear = joinDate.slice(0,4)


export default function ProfileView({ navigation }) {
  const [infoCorrect, setInfoCorrect] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginData, setLoginData] = useState(null);
  const { updateState } = useUser();
  
  const username = 'Name Name'
  const joinDate = '2024-01-24'
  const problemsPracticed = [
    {name: 'Test 1', date: '2025-02-04', isCompleted: true},
    {name: 'Test 2', date: '2025-02-05', isCompleted: false},
  ]

  const joinMonth = months[parseInt(joinDate.slice(5,7))]
  const joinDay = joinDate.slice(8)
  const joinYear = joinDate.slice(0,4)

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
  
  const Image = require('../../assets/images/notion_avatars/notion_02.png')

  return ( 
    <View
      style={{
          height: height,
          width: width,
          ...globalStyles.container,
          flexDirection: 'column',
      }}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
              style={{flex: 1, alignItems: "center", justifyContent: "center"}}
          >   
              <ProfilePicture imgSource={Image} />
              <Text style={[styles.title, {marginTop: 10 * adjustedHeight}]}>{username}</Text>
              <Text style={styles.text}>Joined on {joinMonth} {joinDay}, {joinYear}</Text>
              <TouchableOpacity style={styles.upload_button} onPress={() => navigation.navigate('EditProfile')}>
                <Ionicons name='pencil' size={20} color='#515856' style={{marginRight: 10}}/>
                <Text style={styles.text}>Edit My Profile</Text>
              </TouchableOpacity>

              <Text style={[styles.title, {marginRight: 'auto', marginLeft: 15 * adjustedWidth}]}>Achievements</Text>
              <View style={styles.achieveContainer}>
                <View style={styles.statsContainer}>
                  <Ionicons name="calendar-outline" size={32 * adjustedHeight} color="#FF8C8C" style={{marginHorizontal: 20 * adjustedHeight}}/>
                  <View style={styles.stats}>
                    <Text style={[styles.title, {fontSize: 32 * adjustedHeight, marginVertical: -10 * adjustedHeight}]}>
                      {practicedDates.size}
                    </Text>
                    <Text style={styles.text}>Days practiced</Text>
                  </View>
                </View>
                <View style={styles.statsContainer}>
                  <Ionicons name="book" size={32 * adjustedHeight} color="#FF8C8C" style={{marginHorizontal: 20 * adjustedHeight}}/>
                  <View style={styles.stats}>
                    <Text style={[styles.title, {fontSize: 32 * adjustedHeight, marginVertical: -10 * adjustedHeight}]}>
                      {completedProblems.size}
                    </Text>
                    <Text style={styles.text}>Problems finished</Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.title, {marginRight: 'auto', marginLeft: 15 * adjustedWidth}]}>Practice Record</Text>
              <View style={styles.calendarContainer}>
                <Calendar
                  // Customize the appearance of the calendar
                  style={{
                    height: 350 * adjustedHeight,
                    width: 390 * adjustedWidth,
                  }}
                  theme={{
                    backgroundColor: '#f2f2f2',
                    calendarBackground: '#f2f2f2',
                    // textSectionTitleColor: '#b6c1cd',
                    // selectedDayBackgroundColor: '#00adf5',
                    // selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00adf5',
                    dayTextColor: '#2d4150',
                    // textDisabledColor: '#dd99ee'
                  }}
                  // Specify the current date
                  current={'2025-02-05'}
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
    borderRadius: 15,
    marginVertical: 30 * adjustedHeight,
    height: 40 * adjustedHeight,
    width: 147 * adjustedWidth,
  },
  achieveContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  calendarContainer: {
    flex: 3,
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderColor: '#4b7c7b',
    borderBottomColor: '#4b7c7b',
    backgroundColor: "#f6f6f6",
    borderWidth: 1, 
    borderRadius: 14,
    marginHorizontal: 10 * adjustedWidth,
    marginVertical: 10 * adjustedHeight,
    height: 90 * adjustedHeight,
    width: 190 * adjustedWidth
  },
  text: {
    color: '#515856', 
    fontSize: 15 * adjustedHeight, 
    fontFamily: 'Baloo2-Regular',
  },
  stats: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginLeft: -5 * adjustedHeight,
  },
  completedDate: {
      borderWidth: 1,
      borderColor: '#4B7C7B',
      borderRadius: 20,
      // backgroundColor: "#4B7C7B"
  },
  startedDate: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: '#F8A101',
      borderRadius: 20,
      // backgroundColor: '#F8A101'
  }
});
