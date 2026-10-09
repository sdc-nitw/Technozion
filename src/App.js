import React, { useEffect, useState } from 'react';
import './App.css';
import  {Loader} from './components/Loader'; // Import the Loader component
import Navbar from './components/Navbar';
import AuthProvider from './Context/AuthManager';
import SnackbarProvider from './Context/SnackbarProvider';
import RoutesManager from './Context/RoutesManager';
import SmoothScroll from './animation/SmoothScroll';
import { fetchEvents } from './components/Events/eventsData';
import { SiteBackground } from './components/bg_animation/bg_animate';
import './theme.css';
import './components/Experience/experience.css';

const App = () => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false); // Control for fade-out effect

    useEffect(() => {
        // Share this request with the routed page while the opening loader runs.
        fetchEvents();
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
            <SiteBackground />
            {loading ? (
                <div className={`loader ${fadeOut ? 'fade-out' : ''}`}>
                    <Loader />
                </div>
            ) : (
                <SnackbarProvider>
                    <AuthProvider>
                        <SmoothScroll />
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
