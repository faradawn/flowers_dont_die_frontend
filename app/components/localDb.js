import AsyncStorage from '@react-native-async-storage/async-storage';
import initialCourses from '../../assets/data/initialCourses.json';
import initialQuestions from '../../assets/data/initialQuestions.json';
import initialSubmissions from '../../assets/data/initialSubmissions.json';

const STORAGE_KEYS = {
  COURSES: 'courses',
  QUESTIONS: 'questions',
  SUBMISSIONS: 'submissions',
  USER: 'user',
};

export const initializeLocalDatabase = async () => {
  try {
    const storedCourses = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    if (!storedCourses) {
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(initialCourses));
    }

    const storedQuestions = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!storedQuestions) {
      await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initialQuestions));
    }

    const storedSubmissions = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!storedSubmissions) {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions));
    }
  } catch (error) {
    console.error('Error initializing local database:', error);
  }
};

export const getCourses = async () => {
  try {
    const courses = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    return courses ? JSON.parse(courses) : [];
  } catch (error) {
    console.error('Error getting courses:', error);
    return [];
  }
};

export const getQuestions = async (topicId) => {
  try {
    const questions = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const parsedQuestions = questions ? JSON.parse(questions) : [];
    return parsedQuestions.filter(q => q.topic_id === topicId);
  } catch (error) {
    console.error('Error getting questions:', error);
    return [];
  }
};

export const saveSubmission = async (submission) => {
  try {
    const submissions = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const parsedSubmissions = submissions ? JSON.parse(submissions) : [];
    parsedSubmissions.push(submission);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(parsedSubmissions));
  } catch (error) {
    console.error('Error saving submission:', error);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const clearUser = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error clearing user:', error);
  }
};