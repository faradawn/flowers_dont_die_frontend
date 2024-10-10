import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const NextButton = ({ onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`p-2 ${disabled ? 'opacity-50' : ''}`}
  >
    <Feather name="chevron-right" size={30} color={disabled ? "gray" : "green"} />
  </TouchableOpacity>
);

export default NextButton;