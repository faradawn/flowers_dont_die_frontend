import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ navigateTo, backText = 'Back', backgroundColor = '#f6f6f6', textColor = '#141917', params = {} }) => {
  const navigation = useNavigation();
  let destination = navigateTo;
  let parameters = params;
  if (navigateTo === 'Courses') {
    destination = 'HomeTab';
    parameters = {
      screen: 'Courses',
      params: params
    }
    console.log("TopBar is passing params as ", params);
  }

  return (
    <View style={{
      position: 'absolute',
      top: 5,
      left: 15,
      right: 0,
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      zIndex: 10,
    }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
        onPress={() => navigation.navigate(destination, parameters)}
      >
        <Ionicons
          name="chevron-back"
          size={28} 
          color="#11403B"
        />
        <Text
          style={{
            marginLeft: 8,
            fontSize: 16,
            fontFamily: 'Nunito-Regular',
            color: textColor,
          }}
        >
          {backText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;