# CHANGELOG
Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [2.0.0]
- Change question_ids to questions_done in /get_garden API

## [1.0.6]

### Added
- Create OG user from create script. 
- flower count 0 don’t steal
- Frontend Textbox size
- Edit /page_load’s initial 
- Create create_questions.py to generate a OG (official guide) for the course. Also define the topics.
- Edit /page_load to let the init garden rows fetch from the schema in the course 
- Change /courses to retrieve the course id as doc_id

- Change firebase “garden” schema to contain single gardens with uid, course_id.
- Change API /page_load to /load_garden and made big changes. Simplify garden API response. 
- Change /select_neighbor to fit the new schema. Exclude self. Return sunlight instead of flower count. 
- Add helper function to calculate sunlight at /load_garden, /select_neighbor
- Rename API /steal to /get_question. Let frontend pass {course_id, topic, difficulty, question_id (can be none))

Frontend
- Fix navigation from Questions to NeighbourGarden. useFocusEffect solves the non refreshing problem.