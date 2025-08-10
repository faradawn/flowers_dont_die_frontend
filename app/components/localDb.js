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

const API_URL = 'https://backend.codingflora.com:8001';
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
      console.log("[localDb] Remote courses:", remoteData.courses.length, "Remote questions:", remoteData.questions.length);
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
    
    // Only consider submissions with matching uid and valid scores
    const completedQuestions = parsedSubmissions
      .filter(sub => sub.uid === uid && sub.score != null && sub.score > 0)
      .reduce((acc, sub) => {
        acc[sub.question_id] = sub.course_id;
        return acc;
      }, {});

    let dailyQuestionId = null;
    let dailyCourseId = null;
    let dailyTopic = null;

    const resCourses = parsedCourses.map(course => {
      
      const totalQuestions = course.topics.reduce((sum, topic) => sum + topic.questions.length, 0);
      // Only count completed questions for the current user with valid scores
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
        logo_url: course.logo_url,
        num_total_questions: totalQuestions,
        num_completed_questions: completedCourseQuestions,
        password: course.password || '', // Keep password field
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
      courses: resCourses,
    };
  } catch (error) {
    console.error('Error getting courses:', error);
    return {
      status: "error",
      message: "Error getting courses",
      daily_question_id: null,
      daily_course_id: null,
      daily_topic: null,
      courses: [],
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


// ======================================================================================
// ================================ GET TOPICS ==========================================
// ======================================================================================

export const getTopics = async (uid, courseId) => {
  try {
    const coursesJson = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    const courses = coursesJson ? JSON.parse(coursesJson) : [];

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return {
        status: "error",
        message: "Course not found",
        topics: []
      };
    }

    const submissionsJson = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const submissions = submissionsJson ? JSON.parse(submissionsJson) : [];

    const completedQuestions = new Set(
      submissions
        .filter(sub => sub.uid === uid && sub.course_id === courseId && sub.score != null && sub.score > 0)
        .map(sub => sub.question_id)
    );

    const topics = course.topics.map(topic => {
      const totalQuestions = topic.questions.length;
      const completedTopicQuestions = topic.questions.filter(qId => completedQuestions.has(qId)).length;

      return {
        topic: topic.topic,
        total_questions: totalQuestions,
        completed_questions: completedTopicQuestions
      };
    });

    return {
      status: "success",
      message: "Got topics",
      topics: topics
    };
  } catch (error) {
    console.error('Error getting topics:', error);
    return {
      status: "error",
      message: "Error retrieving topics",
      topics: []
    };
  }
};

// ======================================================================================
// ================================ GET ASSIGNMENTS =====================================
// ======================================================================================

export const getAssignments = async (uid, courseId, topic) => {
  try {
    const coursesJson = await AsyncStorage.getItem(STORAGE_KEYS.COURSES);
    const courses = coursesJson ? JSON.parse(coursesJson) : [];

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      return {
        status: "error",
        message: "Course not found",
        num_total_questions: 0,
        num_completed_questions: 0,
        question_arr: []
      };
    }

    const topicData = course.topics.find(t => t.topic === topic);
    if (!topicData) {
      return {
        status: "error",
        message: "Topic not found in the course",
        num_total_questions: 0,
        num_completed_questions: 0,
        question_arr: []
      };
    }

    const questionIds = topicData.questions;

    const questionsJson = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const allQuestions = questionsJson ? JSON.parse(questionsJson) : [];

    const submissionsJson = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const submissions = submissionsJson ? JSON.parse(submissionsJson) : [];

    const completedQuestions = submissions
      .filter(sub => sub.uid === uid && sub.course_id === courseId && sub.score != null && sub.score > 0)
      .reduce((acc, sub) => {
        acc[sub.question_id] = sub.score;
        return acc;
      }, {});

    const questionArr = questionIds.map(qId => {
      const question = allQuestions.find(q => q.id === qId);
      if (!question) return null;

      const questionId = `${question.topic}|${question.difficulty}|${question.slug}`;
      const isDone = questionId in completedQuestions;
      const score = isDone ? completedQuestions[questionId] : 0;

      return {
        question_title: question.slug,
        question_id: questionId,
        is_done: isDone,
        score: score
      };
    }).filter(q => q !== null);

    const numTotalQuestions = questionArr.length;
    const numCompletedQuestions = questionArr.filter(q => q.is_done).length;

    return {
      status: "success",
      message: "Got assignments",
      num_total_questions: numTotalQuestions,
      num_completed_questions: numCompletedQuestions,
      question_arr: questionArr
    };
  } catch (error) {
    console.error('Error getting assignments:', error);
    return {
      status: "error",
      message: "Error retrieving assignments",
      num_total_questions: 0,
      num_completed_questions: 0,
      question_arr: []
    };
  }
};
