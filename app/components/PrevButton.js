import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PrevButton = ({ onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 10, 
        opacity: disabled ? 0.5 : 1, 
        width: 100,
      }}
    // hitSlop={{ top: 30, bottom: 20, left: 10, right: 10 }} 
  >
    <Feather name="chevron-left" size={30} color={disabled ? "gray" : "green"} />
    <Text style={{ color: disabled ? "gray" : "green", fontSize: 16, marginLeft: 5 }}>Previous</Text>
  </TouchableOpacity>
);

export default PrevButton;