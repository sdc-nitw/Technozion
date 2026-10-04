import React, { useEffect, useState } from 'react';
import './App.css';
import  {Loader} from './components/Loader'; // Import the Loader component
import Navbar from './components/Navbar';
import AuthProvider from './Context/AuthManager';
import SnackbarProvider from './Context/SnackbarProvider';
import RoutesManager from './Context/RoutesManager';

const App = () => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false); // Control for fade-out effect

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true); 
        }, 800); 

        const removeLoader = setTimeout(() => {
            setLoading(false); 
        }, 1100); 

        return () => {
            clearTimeout(timer);
            clearTimeout(removeLoader);
        };
    }, []);

    return (
        <>
            {loading ? (
                <div className={`loader ${fadeOut ? 'fade-out' : ''}`}>
                    <Loader />
                </div>
            ) : (
                <SnackbarProvider>
                    <AuthProvider>
                        <Navbar />
                        <RoutesManager />
                        {/* <Footer /> */}
                    </AuthProvider>
                </SnackbarProvider>
            )}
        </>
    );
};

export default App;
