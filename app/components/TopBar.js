import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ navigateTo, backText = 'Back', params = {} }) => {
  const navigation = useNavigation();

  return (
    <View className="absolute top-15 left-0 right-0 h-16 flex-row items-center justify-start z-10">
      <TouchableOpacity
        className="flex-row items-center px-4 py-2"
        onPress={() => navigation.navigate(navigateTo, params)}
      >
        <Ionicons
          name="chevron-back"
          size={17} 
          color="#004643"
        />
        <Text
          className="ml-1 text-lg font-bold text-[#004643]"
          style={{ fontFamily: 'Baloo2-Bold' }}
        >
          {backText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;