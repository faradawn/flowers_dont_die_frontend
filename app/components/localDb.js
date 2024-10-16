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
      console.log("New Stored initial courses", JSON.stringify(initialCourses));
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

export const getCourses = async (uid) => {
  try {
    const courses = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    const parsedCourses = courses ? JSON.parse(courses) : [];
    console.log("parsedCourses", parsedCourses);
    const submissions = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const parsedSubmissions = submissions ? JSON.parse(submissions) : [];

    console.log("parsedSubmissions", parsedSubmissions);

    const completedQuestions = parsedSubmissions.reduce((acc, sub) => {
      acc[sub.question_id] = sub.course_id;
      return acc;
    }, {});

    console.log("completedQuestions", completedQuestions);

    let dailyQuestionId = null;
    let dailyCourseId = null;
    let dailyTopic = null;

    const resCourses = parsedCourses.map(course => {
      console.log("=== mapped course", course);
      console.log("=== mapped course topics", course.topics);
      const totalQuestions = course.topics.reduce((sum, topic) => sum + topic.questions.length, 0);
      const completedCourseQuestions = Object.entries(completedQuestions)
        .filter(([_, courseId]) => courseId === course.id).length;

      // Find the first uncompleted question for daily question
      if (!dailyQuestionId) {
        for (const topic of course.topics) {
          for (const questionId of topic.questions) {
            if (!completedQuestions[questionId]) {
              dailyQuestionId = questionId;
              dailyCourseId = course.id;
              dailyTopic = topic.topic;
              break;
            }
          }
          if (dailyQuestionId) break;
        }
      }

      return {
        course_id: course.id,
        course_title: course.course_name,
        num_total_questions: totalQuestions,
        num_completed_questions: completedCourseQuestions
      };
    });

    // If all questions are completed, choose the first question as daily
    if (!dailyQuestionId && parsedCourses.length > 0) {
      const firstCourse = parsedCourses[0];
      const firstTopic = firstCourse.topics[0];
      dailyQuestionId = firstTopic.questions[0];
      dailyCourseId = firstCourse.id;
      dailyTopic = firstTopic.topic;
    }

    return {
      status: "success",
      message: "Got courses",
      daily_question_id: dailyQuestionId,
      daily_course_id: dailyCourseId,
      daily_topic: dailyTopic,
      courses: resCourses
    };
  } catch (error) {
    console.error('Error getting courses:', error);
    return {
      status: "error",
      message: "Error getting courses",
      daily_question_id: null,
      daily_course_id: null,
      daily_topic: null,
      courses: []
    };
  }
};

// create a place holder function for now
export const mergeProgress = async (username) => {
  console.log("mergeProgress placeholder function");
};