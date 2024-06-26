# Flower hunt
### Hunting flowers by answering quizzes

A game that deepens your friendship with your classmates by revealing their "secrets". To play the game, you need to answer multiple choice questions related to course materials and hunt for flowers from other students' gardens. 

**What to expect in the game**
---
1. You need to first complete a quiz (50 questions) about yourself, such as your personal interests, past experience, etc.
2. An knowledge garden will be built. Each garden has a number of flowers, each chapter corresponds a given row (4 flowers per row).
3. When the game starts, you can hunt for each other's flowers by going to their garden and hunting for flowers, which reveal one secrete about him/her. When hunting for flowers, you need to answer multiple choice questions related to the course materials, which will be randomly picked by AI.
4. During the final ranking stage, the top 3 winner who correctly answer the most questions will be announced.

**Rules**
---
1. You can only hunt for flowers that correspond to a given chapter
2. You cannot hunt for flower if all of the flowers have been hunted

Have fun and enjoy learning! 

# Getting Started


### Frontend
- Install React Native 
- Install Expo with `npx install-expo-modules@latest`
- Install XCode
```
npx npm install
npx expo start
i 			# to open Apple simulator
```


### Backend
```
pip install fastapi uvicorn
uvicorn main:app --host 0.0.0.0 --port 8001
```


### App submission 
```
eas build --platform ios 
eas submit -p ios --latest 
```