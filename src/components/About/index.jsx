import React from 'react';
import { festival } from '../../data/festival';
import './about.css';
import logo1 from './logo1.png';
import AboutCard from './AboutCard';

export const About = () => {
  return (
    <div className="relative about-page" id="about">

        <AboutCard
          image={logo1}
          imgToRight={true}
          title="About"
          content={festival.about}
        />

    </div>
  );
}; 

export default About; 
