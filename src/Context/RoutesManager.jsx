import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { About } from '../components/About';
import EventsPage from '../components/Events/EventsPage';
import Home from '../components/Home';
import { Team } from '../components/Team/team.jsx';
import Card from '../components/card/card.jsx';
import PastEvents from '../components/PastEvents/PastEvents.jsx';
import { ComingSoon } from "../components/ComingSoon/ComingSoon.jsx";
import Register from '../components/Register2/Register.jsx';

const RoutesManager = () => {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return (
		<Routes>
			<Route path="/auth" element={<Navigate to="/auth/register" replace />} />
			<Route path="/auth/login" element={<Navigate to="/auth/register" replace />} />
			<Route path="/login" element={<Navigate to="/auth/register" replace />} />
			<Route path="/" element={<Home />} />
			<Route path="/auth/register" element={<Register />} />
			<Route path="/register" element={<Navigate to="/auth/register" replace />} />
			<Route path="/about" element={<About />} />
			<Route path="/events" element={<EventsPage />} />
			<Route path="/past-events" element={<PastEvents />} />
			<Route path="/past-events/:year" element={<PastEvents />} />
			<Route path="/pastevents" element={<PastEvents />} />
			<Route path="/pastevents/:year" element={<PastEvents />} />
			<Route path="/events/:year" element={<PastEvents />} />
			<Route path="/team" element={<Team />} />
			<Route path="/card" element={<Card />} />
			<Route path="*" element={<ComingSoon />} />
		</Routes>
	);
};

export default RoutesManager;