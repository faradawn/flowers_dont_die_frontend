import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLoginInfo } from '../components/SecureStoreUtils';  // 确保路径正确

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
    const [state, setState] = useState({
        uid: '',
        username: '',
        course_id: '',
    });

    // 添加初始化检查
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const loginInfo = await getLoginInfo();
                console.log("Checking initial login status:", loginInfo);
                
                if (loginInfo && loginInfo.uid && !loginInfo.uid.includes('guest_')) {
                    setState(prevState => ({
                        ...prevState,
                        uid: loginInfo.uid,
                        username: loginInfo.username
                    }));
                    console.log("Restored login state:", loginInfo);
                } else {
                    console.log("No valid login info found");
                }
            } catch (error) {
                console.log("Error checking login status:", error);
            }
        };

        checkLoginStatus();
    }, []);

    const updateState = (key, value) => {
        console.log(`Updating state - ${key}:`, value);
        setState(prevState => {
            const newState = {
                ...prevState,
                [key]: value,
            };
            console.log("New state:", newState);
            return newState;
        });
    };

    // 添加调试日志
    useEffect(() => {
        console.log("UserContext state changed:", state);
    }, [state]);

    return (
        <UserContext.Provider value={{ state, updateState }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access to context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};