import AsyncStorage from '@react-native-async-storage/async-storage';
import initialCourses from '../../assets/data/initialCourses.json';
import initialQuestions from '../../assets/data/initialQuestions.json';
import initialSubmissions from '../../assets/data/initialSubmissions.json';

export const STORAGE_KEYS = {
  COURSES: 'courses',
  QUESTIONS: 'questions',
  SUBMISSIONS: 'submissions',
  USER: 'user',
};

const API_URL = 'https://backend.faradawn.site:8001';
const TIMEOUT = 10000; // 10 seconds timeout

const fetchWithTimeout = async (url, options, timeout = TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
};

const fetchRemoteData = async () => {
  try {
    const coursesResponse = await fetchWithTimeout(`${API_URL}/init_courses`, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    });
    const coursesData = await coursesResponse.json();

    const questionsResponse = await fetchWithTimeout(`${API_URL}/init_questions`, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    });
    const questionsData = await questionsResponse.json();

    return { courses: coursesData.courses, questions: questionsData.questions };
  } catch (error) {
    console.error('Error fetching remote data:', error);
    return null;
  }
};


export const initializeLocalDatabase = async () => {
  try {
    const remoteData = await fetchRemoteData();

    if (remoteData) {
      await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(remoteData.courses));
      await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(remoteData.questions));
      console.log("[localDb] Stored remote courses and questions.", "num courses", remoteData.courses.length, "num questions", remoteData.questions.length);
    } else {
      const storedCourses = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
      if (!storedCourses) {
        await AsyncStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(initialCourses));
        console.log("[localDb] Stored initial courses from JSON file", "num courses", initialCourses.length);
      }

      const storedQuestions = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (!storedQuestions) {
        await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(initialQuestions));
        console.log("[localDb] Stored initial questions from JSON file", "num questions", initialQuestions.length);
      }
    }

    const storedSubmissions = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (!storedSubmissions) {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(initialSubmissions));
      console.log("Stored initial submissions from JSON file");
    }

    console.log("[localDb] Local database initialized");
  } catch (error) {
    console.error('[localDb] Error initializing local database:', error);
  }
};


// ======================================================================================
// ================================ GET COURSES ========================================
// ======================================================================================


export const getCourses = async (uid) => {
  try {
    const courses = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    const parsedCourses = courses ? JSON.parse(courses) : [];
    const submissions = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const parsedSubmissions = submissions ? JSON.parse(submissions) : [];

    const completedQuestions = parsedSubmissions.reduce((acc, sub) => {
      acc[sub.question_id] = sub.course_id;
      return acc;
    }, {});



    let dailyQuestionId = null;
    let dailyCourseId = null;
    let dailyTopic = null;

    const resCourses = parsedCourses.map(course => {
      
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


// ======================================================================================
// ================================ GET QUESTIONS SET ==================================
// ======================================================================================


export const getQuestionSet = async (uid, courseId, topic) => {
  try {
    const questionsJson = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const allQuestions = questionsJson ? JSON.parse(questionsJson) : [];

    const matchingQuestions = allQuestions.filter(question => 
      question.course_id === courseId && question.topic === topic
    );

    if (matchingQuestions.length === 0) {
      return {
        status: "failed",
        message: "No questions found for the given course and topic",
        questions: []
      };
    }

    const questionSet = matchingQuestions.map(question => ({
      question_id: question.id,
      difficulty: question.difficulty,
      topic: question.topic,
      answer: question.answer,
      question: question.question,
      question_number: question.question_number,
      options: question.options,
      time_limit: question.time_limit,
      audio_url: `audio_generation/audio_${question.id}.mp3` // Assuming this is how audio URLs are structured
    }));

    return {
      status: "success",
      message: "Question set retrieved successfully",
      questions: questionSet
    };
  } catch (error) {
    console.error('Error getting question set:', error);
    return {
      status: "error",
      message: "Error retrieving question set",
      questions: []
    };
  }
};


export const storeSubmission = async (submissionDetail) => {
  try {
    const submissionsJson = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const submissions = submissionsJson ? JSON.parse(submissionsJson) : [];
    submissions.push(submissionDetail);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    console.log("[localDb] Submission stored successfully");
  } catch (error) {
    console.error('[localDb] Error storing submission:', error);
    
  }
};

export const clearSubmissions = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    console.log("[localDb] Submissions cleared successfully");
    return {
      status: "success",
      message: "All submissions have been cleared"
    };
  } catch (error) {
    console.error('[localDb] Error clearing submissions:', error);
    return {
      status: "error",
      message: "Failed to clear submissions"
    };
  }
};
