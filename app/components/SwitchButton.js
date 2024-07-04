import React, { useState } from 'react';
import { View } from 'react-native';

export default function SwitchButton(
    {FirstText, SecondText, width, height}
) {
    const [mode, setMode] = useState(0);

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',

                width: width,
                height: height,

            }}
        >
            <TouchableOpacity
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text>
                    { FirstText }
                </Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text>
                    { SecondText }
                </Text>
            </TouchableOpacity>
        </View>
    )
}