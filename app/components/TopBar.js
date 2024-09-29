import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TopBar = ({ navigateTo, backText = 'Back' }) => {
  const navigation = useNavigation();

  return (
    <View className="absolute top-0 left-5 right-0 h-16 justify-end">
      <TouchableOpacity
        className="flex-row items-center ml-4"
        onPress={() => navigation.navigate(navigateTo)}
      >
        <Ionicons
          name="chevron-back"
          size={16}
          color="#004643"
        />
        <Text 
          className="ml-1 text-base font-bold text-[#004643]"
          style={{ fontFamily: 'Baloo2-Bold' }}
        >
          {backText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default TopBar;