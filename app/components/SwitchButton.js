import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';

//possible colors #F8F8F8 #F7F7F7, #EFEFEF

export default function SwitchButton(
    {FirstText, SecondText, width, height, mode, setMode, activeColor = '#E28089', inactiveColor = '#E28089', backgroundColor = '#EFEFEF',}
) {
    const transformX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
            Animated.timing(transformX, {
                toValue: mode === 0 ? 0 : 1,
                duration: 250,
                useNativeDriver: true
            }).start()  
    }, [mode])

    const translationX = transformX.interpolate({
        inputRange: [0, 1],
        outputRange: [2, width - height + 2]
    })

    return (
        <TouchableOpacity onPress={() => setMode(mode === 0 ? 1 : 0)} activeOpacity={0.8}>
      <View
        style={{
          width,
          height,
          borderRadius: height / 2,      
          backgroundColor: backgroundColor,  
          justifyContent: 'center',
          padding: 2,                    
        }}
      >
        <Animated.View
          style={{
            width: height - 4,           
            height: height - 4,
            borderRadius: (height - 4) / 2,
            backgroundColor: mode === 0 ? inactiveColor : activeColor, 
            transform: [{ translateX: translationX }],
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
        