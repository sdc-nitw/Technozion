// Loader.jsx
import React from 'react';
import './Loader.css'; // Import the CSS for styling
import tz_img from "./finalDraft.png";
import r1_img from "./finalDraft_2.png";
import r2_img from "./finalDraft_3.png";

export const Loader = () => {
    return (
        <div className="loader">
            <img src={tz_img} alt="Static" className="static-image" />
            <img src={r1_img} alt="Clockwise" className="rotating clockwise" />
            <img src={r2_img} alt="Anticlockwise" className="rotating anticlockwise" />
        </div>
    );
};

