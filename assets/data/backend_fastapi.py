from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.firebase import db
from app.utils import fetch_username
import logging
router = APIRouter()

# 01 - get_courses 
# Given (uid), return a list of courses = [{course_id, course_title}]

# 02 - get_topics
# Given (uid, course_id), return a list of topics = [{topic, total_questions, finished_questions}]

# 03 - get_assignments
# Given (uid, course_id, topic), return a list questions = [{question_id, question_title, is_done}]


# 01 - get_courses
class GetCoursesRequest(BaseModel):
    uid: str

class CourseItem(BaseModel):
    course_id: str
    course_title: str
    num_total_questions: int
    num_completed_questions: int

class GetCoursesResponse(BaseModel):
    status: str
    message: str
    daily_question_id: str
    daily_course_id: str
    daily_topic: str
    courses: List[CourseItem]

@router.post("/get_courses", response_model=GetCoursesResponse)
async def get_courses(request: GetCoursesRequest):
    
    
    # Fetch student's submissions
    submissions_ref = db.collection('submissions').where('uid', '==', request.uid)
    submissions = submissions_ref.stream()
    logging.info(f"Uid {request.uid}. Submissions: {submissions}")
    completed_questions = {sub.to_dict()['question_id']: sub.to_dict()['course_id'] for sub in submissions}

    logging.info(f"Uid {request.uid}. Completed questions: {completed_questions}")

    # Find the next question for the student
    daily_question_id = None
    daily_course_id = None
    daily_topic = None

    # Backup daily questionchoice 
    backup_daily_question_id = None
    backup_daily_course_id = None
    backup_daily_topic = None

    # Fetch courses from Firebase (unchanged)
    courses_ref = db.collection('courses')
    courses_docs = courses_ref.stream()
    
    res_courses = [] # saves the course items to return
    course_documents = [] # saves the original course documents
    for doc in courses_docs:
        course_data = doc.to_dict()
        total_questions = sum(len(topic.get('questions', [])) for topic in course_data.get('topics', []))
        completed_course_questions = sum(1 for q_id, c_id in completed_questions.items() if c_id == doc.id)

        print(f"Course {doc.id}. Total questions: {total_questions}. Completed questions: {completed_course_questions}")
        
        res_courses.append(CourseItem(
            course_id=doc.id,
            course_title=course_data.get('course_name', ''),
            num_total_questions=total_questions,
            num_completed_questions=completed_course_questions
        ))
        course_documents.append(doc)

    # TODO: how to loop through courses from the start again?
    for course_doc in course_documents:
        course_data = course_doc.to_dict()
        for topic in course_data.get('topics', []):
            for question_id in topic.get('questions', []):
                if backup_daily_question_id is None:
                    backup_daily_question_id = question_id
                    backup_daily_course_id = course_doc.id
                    backup_daily_topic = topic['topic']

                if question_id not in completed_questions:
                    daily_question_id = question_id
                    daily_course_id = course_doc.id
                    daily_topic = topic['topic']
                    break
            if daily_question_id:
                break
        if daily_question_id:
            break

    # If all questions are completed, choose a random question
    if not daily_question_id:
        daily_question_id = backup_daily_question_id
        daily_course_id = backup_daily_course_id
        daily_topic = backup_daily_topic    
        logging.info("No daily question found, choosing a random question")

    logging.info(f"Final Daily question id: {daily_question_id}, course id: {daily_course_id}, topic: {daily_topic}")
    
    
    is_signed_in = "true"
    
    res = GetCoursesResponse(
        status="success",
        message="Got courses",
        daily_question_id=daily_question_id,
        daily_course_id=daily_course_id,
        daily_topic=daily_topic,
        courses=res_courses,
    )
    return res

# 02 - get_topics
# 02 - get_topics (updated)
class GetTopicsRequest(BaseModel):
    uid: str
    course_id: str

class TopicItem(BaseModel):
    topic: str
    total_questions: int
    completed_questions: int

class GetTopicsResponse(BaseModel):
    status: str
    message: str
    topics: List[TopicItem]

@router.post("/get_topics", response_model=GetTopicsResponse)
async def get_topics(request: GetTopicsRequest):
    try:
        # Fetch the course document
        course_ref = db.collection('courses').document(request.course_id)
        course_doc = course_ref.get()

        if not course_doc.exists:
            raise HTTPException(status_code=404, detail="Course not found")

        course_data = course_doc.to_dict()
        topics = course_data.get('topics', [])

        # Fetch user's submissions
        submissions_ref = db.collection('submissions').where('uid', '==', request.uid).where('course_id', '==', request.course_id)
        submissions = submissions_ref.stream()
        completed_questions = set(sub.to_dict()['question_id'] for sub in submissions)

        topic_items = []
        for topic in topics:
            topic_name = topic.get('topic', '')
            question_ids = topic.get('questions', [])
            total_questions = len(question_ids)
            completed_topic_questions = sum(1 for q_id in question_ids if q_id in completed_questions)

            topic_items.append(TopicItem(
                topic=topic_name,
                total_questions=total_questions,
                completed_questions=completed_topic_questions
            ))

        return GetTopicsResponse(
            status="success",
            message="Got topics",
            topics=topic_items
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 03 - get_assignments 
# TODO: fetch progress from submissions collection
class AssignmentsRequest(BaseModel):
    uid: str
    course_id: str
    topic: str

class QuestionItem(BaseModel):
    question_title: str
    question_id: str
    is_done: bool
    score: int

class AssignmentsResponse(BaseModel):
    status: str
    message: str
    num_total_questions: int
    num_completed_questions: int
    question_arr: List[QuestionItem]

@router.post("/get_assignments", response_model=AssignmentsResponse)
async def get_assignments(request: AssignmentsRequest):
    print("Got request", request)
    try:
        # Get the course document
        course_ref = db.collection('courses').document(request.course_id)
        course_doc = course_ref.get()
        
        if not course_doc.exists:
            raise HTTPException(status_code=404, detail="Course not found")
        
        course_data = course_doc.to_dict()
        topics = course_data.get('topics', [])
        
        # Find the requested topic
        topic_data = next((t for t in topics if t['topic'] == request.topic), None)
        if not topic_data:
            raise HTTPException(status_code=404, detail="Topic not found in the course")
        
        question_ids = topic_data.get('questions', [])
        
        # Get questions data
        questions_ref = db.collection('questions')
        questions = questions_ref.where('__name__', 'in', question_ids).stream()
        
        # Get user submissions
        submissions_ref = db.collection('submissions')
        user_submissions = submissions_ref.where('uid', '==', request.uid).where('course_id', '==', request.course_id).stream()
        
        # Create a dict of completed questions with their scores
        completed_questions = {sub.to_dict()['question_id']: sub.to_dict()['score'] for sub in user_submissions}
        
        question_arr = []
        for question in questions:
            data = question.to_dict()
            question_id = f"{data.get('topic', '')}|{data.get('difficulty', 'Easy')}|{data.get('slug', '')}"
            is_done = question_id in completed_questions
            score = completed_questions.get(question_id, 0) if is_done else 0
            
            question_item = QuestionItem(
                question_title=data.get('slug', ''),
                question_id=question_id,
                is_done=is_done,
                score=score
            )
            question_arr.append(question_item)
        
        num_total_questions = len(question_arr)
        num_completed_questions = sum(1 for q in question_arr if q.is_done)
        
        response = AssignmentsResponse(
            status="success",
            message="Got assignments",
            num_total_questions=num_total_questions,
            num_completed_questions=num_completed_questions,
            question_arr=question_arr
        )
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
