import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6f6f6',
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

export const myImages = {
    flowerIcons: {
        '1': require('../../assets/images/isometric_flowers/isometric_flower_1.png'),
        '2': require('../../assets/images/isometric_flowers/isometric_flower_2.png'),
        '3': require('../../assets/images/isometric_flowers/isometric_flower_3.png'),
        '4': require('../../assets/images/isometric_flowers/isometric_flower_4.png'),
        '5': require('../../assets/images/isometric_flowers/isometric_flower_5.png'),
        '6': require('../../assets/images/isometric_flowers/isometric_flower_6.png'),
        '7': require('../../assets/images/isometric_flowers/isometric_flower_7.png'),
        '8': require('../../assets/images/isometric_flowers/isometric_flower_8.png'),
        '9': require('../../assets/images/isometric_flowers/isometric_flower_9.png'),
    },
    courseIcons: {
        'Algo Group': require('../../assets/images/course_icons/algo_group_icon.png'),
        'ICPC': require('../../assets/images/course_icons/icpc_icon.png'),
        'College Prep': require('../../assets/images/course_icons/study_green_icon.png'),
        'College Readiness': require('../../assets/images/course_icons/study_orange_icon.png'),
        'Cloud': require('../../assets/images/course_icons/cloud_icon.png'),
    }
}

export const colors = {
    green: '#26C250',
    algoGroup: '#304a8a',
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
        '0': require('../../assets/images/question_stars/green_star_1.png'),
        '1': require('../../assets/images/question_stars/green_star_1.png'),
        '2': require('../../assets/images/question_stars/green_star_2.png'),
        '3': require('../../assets/images/question_stars/green_star_3.png')
    }
}