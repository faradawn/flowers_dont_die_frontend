import React, { createContext, useContext, useState } from 'react';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [state, setState] = useState({
        uid: '',
        username: '',
        course_id: 'Software_Engineering_1'
    });

    const updateState = (key, value) => {
        setState(prevState => ({
            ...prevState,
            [key]: value,
        }));
    }

    return (
        <UserContext.Provider value={{ state, updateState }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access to context
export const useUser = () => useContext(UserContext);
