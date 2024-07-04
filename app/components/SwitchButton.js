import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, Animated } from 'react-native';

export default function SwitchButton(
    {FirstText, SecondText, width, height, mode, setMode}
) {
    let transformX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if(mode == 0) {
            Animated.timing(transformX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start()
        } else {
            Animated.timing(transformX, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start()
        }
    }, [mode])

    const translationX = transformX.interpolate({
        inputRange: [0, 1],
        outputRange: [2, width / 2]
    })

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',

                width: width,
                height: height,

                borderRadius: 12,
                backgroundColor: 'white',
            }}
        >
            {/* Sliding Sign */}
            <Animated.View
                style={{
                    position: 'absolute',
                    height: height - 2 * 2,
                    width: width / 2 - 2 * 2,

                    top: 2,
                    bottom: 2,
                    left: 1,
                    borderRadius: 10,

                    backgroundColor: '#5f967c',

                    transform: [
                        {
                            translateX: translationX
                        }
                    ],
                }}
            >
            </Animated.View>

            {/* First Toggle Button */}
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => setMode(0)}
            >
                <Text
                    style={{
                        fontFamily: 'Baloo2-Regular'
                    }}
                >
                    { FirstText }
                </Text>
            </TouchableOpacity>

            {/* Second Toggle Button */}
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={() => setMode(1)}
            >
                <Text
                    style={{
                        fontFamily: 'Baloo2-Regular'
                    }}
                >
                    { SecondText }
                </Text>
            </TouchableOpacity>
        </View>
    )
}