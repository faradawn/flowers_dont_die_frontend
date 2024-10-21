import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ navigateTo, backText = 'Back', backgroundColor = '#fff', textColor = '#004643', params = {} }) => {
  const navigation = useNavigation();

  return (
    <View style={{
      position: 'absolute',
      top: 15,
      left: 0,
      right: 0,
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      zIndex: 10,
    }}>
      <TouchableOpacity
        className="flex-row items-center px-4 py-2"
        onPress={() => navigation.navigate(navigateTo, params)}
      >
        <Ionicons
          name="chevron-back"
          size={17} 
          color={textColor}
        />
        <Text
          className="ml-1 text-lg font-bold text-[#004643]"
          style={{ fontFamily: 'Baloo2-Bold', color: textColor }}
        >
          {backText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;