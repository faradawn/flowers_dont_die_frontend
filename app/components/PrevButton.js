import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PrevButton = ({ onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{ padding: 10 }}  // 扩大触摸区域
    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}  // 增加点击范围
  >
    <Feather name="chevron-left" size={30} color={disabled ? "gray" : "green"} />
  </TouchableOpacity>
);

export default PrevButton;