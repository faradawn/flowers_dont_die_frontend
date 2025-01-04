import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [state, setState] = useState({
        uid: '',
        username: '',
        course_id: '',
        password: '',        // Added for auth
        is_signed_in: false  // Added for auth status
    });

    const updateState = (key, value) => {
        setState(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    // Added convenience method for updating multiple fields
    const updateMultipleStates = (updates) => {
        setState(prevState => ({
            ...prevState,
            ...updates
        }));
    };

    // Updated signIn method to handle progress sync
    const signIn = async (userData) => {
        try {
            // Fetch remote progress from backend
            const remoteProgress = await fetchRemoteProgress(userData.uid);
            
            // Update AsyncStorage with remote progress
            await AsyncStorage.setItem('userProgress', JSON.stringify(remoteProgress));
            
            // Update user context
            setState(prevState => ({
                ...prevState,
                uid: userData.uid,
                username: userData.username,
                password: userData.password,
                is_signed_in: true
            }));

            // Store user data in AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify({
                uid: userData.uid,
                username: userData.username,
                password: userData.password,
                is_signed_in: true
            }));
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    };

    // New method for handling sign up
    const signUp = async (userData) => {
        try {
            // Create user document in backend
            await createUserDoc(userData);
            
            // Initialize empty progress in AsyncStorage
            await AsyncStorage.setItem('userProgress', JSON.stringify({}));
            
            // Update user context
            setState(prevState => ({
                ...prevState,
                uid: userData.uid,
                username: userData.username,
                password: userData.password,
                is_signed_in: true
            }));

            // Store user data in AsyncStorage
            await AsyncStorage.setItem('userData', JSON.stringify({
                uid: userData.uid,
                username: userData.username,
                password: userData.password,
                is_signed_in: true
            }));
        } catch (error) {
            console.error('Error during sign up:', error);
            throw error;
        }
    };

    // Updated method for handling sign out
    const signOut = async () => {
        try {
            // Generate a new guest ID (e.g., timestamp + random number)
            const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            
            // Clear existing progress
            await AsyncStorage.setItem('userProgress', JSON.stringify({}));
            
            // Update user context with guest info
            setState(prevState => ({
                ...prevState,
                uid: guestId,
                username: `Guest_${guestId}`,
                password: '',
                is_signed_in: false,
                course_id: ''
            }));

            // Update AsyncStorage with guest data
            await AsyncStorage.setItem('userData', JSON.stringify({
                uid: guestId,
                username: `Guest_${guestId}`,
                password: '',
                is_signed_in: false,
                course_id: ''
            }));

            // Navigate to HomeTab
            navigation.navigate('HomeTab');
        } catch (error) {
            console.error('Error during sign out:', error);
            throw error;
        }
    };

    // Added method for continuing as guest
    const continueAsGuest = (guestId) => {
        setState(prevState => ({
            ...prevState,
            uid: guestId,
            username: `Guest_${guestId}`,
            password: '',
            is_signed_in: false
        }));
    };

    return (
        <UserContext.Provider 
            value={{ 
                state, 
                updateState, 
                updateMultipleStates,
                signIn,
                signUp,  // Add signUp to the context
                signOut,
                continueAsGuest
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access to context
export const useUser = () => useContext(UserContext);

export default UserContext;