import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { About } from '../components/About';
import EventsPage from '../components/Events/EventsPage';
import Home from '../components/Home';
import { Team } from '../components/Team/team.jsx';
import Card from '../components/card/card.jsx';
import PastEvents from '../components/PastEvents/PastEvents.jsx';
import { ComingSoon } from "../components/ComingSoon/ComingSoon.jsx";
import {Register} from '../components/Register2/Register.jsx'
import {Login} from "../components/Login/Login.jsx";
const RoutesManager = () => {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return (
		<Routes>
			<Route path="/auth" element={<Navigate to="/login" replace />} />
			<Route path="/" element={<Home />} />

			{/* Example of protected routes */}

			<Route
				path="/auth/register"
				element={
						<Register/>
				}
			/>
			<Route
				path="/auth/login"
				element={
						<Login/>
				}
			/>

			{/* Registration coming soon */}
			<Route path="/register" element={<Register />} />
			<Route path="/login" element={<Login />} />
			<Route path="/about" element={<About />} />
			{/* <Route path="/sponsors" element={<Sponsors />} /> */}
			<Route path="/events" element={<EventsPage />} />
			<Route path="/past-events" element={<PastEvents />} />
			<Route path="/past-events/:year" element={<PastEvents />} />
			<Route path="/pastevents" element={<PastEvents />} />
			<Route path="/pastevents/:year" element={<PastEvents />} />
			<Route path="/events/:year" element={<PastEvents />} />
			{/* <Route path="/displayevents" element={<Displayevents />} /> */}
			<Route path="/team" element={<Team />} />
			{/* <Route path="/gallery" element={<Gallery />} /> */}
			{/* <Route path="/index" element={<Index />} /> */}
			<Route path="/card" element={<Card />} />
			<Route path="*" element={<ComingSoon />} />

		</Routes>
	);
};

export default RoutesManager;

