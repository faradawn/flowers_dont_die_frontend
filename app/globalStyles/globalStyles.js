import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EFF0F3',
    },

    button: {
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        fontFamily: 'Baloo2-Bold',
    },

    inputKey: {
        fontSize: 20,
        fontFamily: 'Baloo2-Bold',
        color: 'white',
    },
    textInput: {
        marginVertical: 5,

        fontFamily: 'Baloo2-Regular',
        fontSize: 16,
        color: 'white',

        borderWidth: 2,
        borderColor: 'white',
        borderRadius: 20,
    }
})

export const images = {
    id: {
        '1': require('../../assets/images/isometric_flowers/isometric_flower_1.png'),
        '2': require('../../assets/images/isometric_flowers/isometric_flower_2.png'),
        '3': require('../../assets/images/isometric_flowers/isometric_flower_3.png'),
        '4': require('../../assets/images/isometric_flowers/isometric_flower_4.png'),
        '5': require('../../assets/images/isometric_flowers/isometric_flower_5.png'),
        '6': require('../../assets/images/isometric_flowers/isometric_flower_6.png'),
        '7': require('../../assets/images/isometric_flowers/isometric_flower_7.png'),
        '8': require('../../assets/images/isometric_flowers/isometric_flower_8.png'),
        '9': require('../../assets/images/isometric_flowers/isometric_flower_9.png'),
    }
}

export const colors = {
    id: {
        '1': 'green',
        '2': 'red',
        '3': 'yellow',
        '4': 'coral',
        '5': 'violet',
        '6': 'orange',
        '7': 'blue',
        '8': 'turqoise',
        '9': 'rosybrown',
    }
}

export const stars = {
    grade: {
        '1': require('../../assets/images/question_stars/green_star_1.png'),
        '2': require('../../assets/images/question_stars/green_star_2.png'),
        '3': require('../../assets/images/question_stars/green_star_3.png')
    }
}