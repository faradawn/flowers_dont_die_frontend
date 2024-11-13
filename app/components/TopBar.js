import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ navigateTo, backText = 'Back', backgroundColor = '#fff', textColor = '#004643', params = {} }) => {
  const navigation = useNavigation();

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
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        onPress={() => navigation.navigate(navigateTo, params)}
      >
        <Ionicons
          name="chevron-back"
          size={17} 
          color={textColor}
        />
        <Text
          style={{
            marginLeft: 4,
            fontSize: 18,
            fontFamily: 'Baloo2-Bold',
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