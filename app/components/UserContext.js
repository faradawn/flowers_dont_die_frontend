import React, { createContext, useContext, useState } from 'react';

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [state, setState] = useState({
        uid: '',
        username: '',
        course_id: 'Software_Engineer_53fc0699-7eb2-4e66-bdd9-e1fa51aa4c3c'
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
