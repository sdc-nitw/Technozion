import React from 'react';
import { WebCanvas } from '../bg_animation/bg_animate.js';

export const ComingSoon = () => {
  return (
    <div className="relative">
     
      <div className="about-canvas">
        <WebCanvas /> 
      </div>

      <div className="about-container w-full z-2 relative p-4 text-white">
         <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <span className="text-5xl font-bold mb-4 uppercase animate-pulse cursor-pointer">
          Coming Soon
        </span>
        <p className="text-lg text-gray-300">
          We’re working hard to bring you something amazing. Stay tuned!
        </p>
      </div>
    </div>
     </div>
    </div>
  );
}; 
