import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const NextButton = ({ onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 10,
        opacity: disabled ? 0.5 : 1, 
      }}
    hitSlop={{ top: 30, bottom: 20, left: 10, right: 10 }}
  >
    <Text style={{ color: disabled ? "gray" : "green", fontSize: 16, marginRight: 5 }}>Next</Text>
    <Feather name="chevron-right" size={30} color={disabled ? "gray" : "green"} />
  </TouchableOpacity>
);

export default NextButton;