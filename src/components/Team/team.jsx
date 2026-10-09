import React, { useEffect, useState } from 'react';
import './team.css'; 
import { WebCanvas } from "../bg_animation/bg_animate";
import Teams from './Teams.png';
import TeamCrad from "./TeamCrad";
// Web Team: 5 cards per row on large screens, a short last row is centered.
const WEB_TEAM_PER_ROW = 5;

// Tailwind needs full class names, so the start column is looked up here.
// Grid has 10 columns and each card spans 2.
const LAST_ROW_START = {
  1: "lg:col-start-5",
  2: "lg:col-start-4",
  3: "lg:col-start-3",
  4: "lg:col-start-2",
};

export const TeamContent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/TeamData.json')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      }) 
      .catch((error) => console.error('Error fetching JSON:', error));
    }, []);

  return (
    <div className="list">
      <section className="flex flex-col items-center justify-center mb-10">
        <h1 className="lg:text-5xl sm:text-4xl text-3xl uppercase font-bold">Chief Patron</h1>
        {data?.chief_patrons?.map((member, index) => (
          <TeamCrad src={`/teamImages/${member.image}`} key={index} name={member.name} position={member.position} />
        ))}
      </section>

      <section className="flex flex-col items-center justify-center mb-10">
        <h1 className="lg:text-5xl sm:text-4xl text-3xl uppercase font-bold">Patrons</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.patrons?.map((member, index) => (
            <TeamCrad src={`/teamImages/${member.image}`} key={index} email={member.email} name={member.name} position={member.position} />
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center justify-center mb-10">
        <h1 className="lg:text-5xl sm:text-4xl text-3xl uppercase font-bold">Student Council</h1>
        <h2 className="lg:text-3xl text-xl uppercase lg:my-5 xs:my-3">General Secretaries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.student_council?.general_secretaries?.map((member, index) => (
            <TeamCrad key={index} src={`/teamImages/${member.image}`} name={member.name} position={member.position} />
          ))}
        </div>
        <br />
        <h2 className="lg:text-3xl text-xl uppercase lg:my-5 xs:my-3">Joint Secretaries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data?.student_council?.joint_secretaries?.map((member, index) => (
            <TeamCrad key={index} src={`/teamImages/${member.image}`} name={member.name} position={member.position} />
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center justify-center mb-10">
  <h1 className="lg:text-5xl sm:text-4xl text-3xl uppercase font-bold">Web Team</h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-10 gap-6">
    {data?.web_team?.map((member, index, arr) => {
      const remainder = arr.length % WEB_TEAM_PER_ROW;
      const isFirstOfLastRow = remainder !== 0 && index === arr.length - remainder;

      return (
        <div
          key={index}
          className={`flex justify-center lg:col-span-2 ${
            isFirstOfLastRow ? LAST_ROW_START[remainder] : ""
          }`}
        >
          <TeamCrad src={`/teamImages/${member.image}`} name={member.name} position={member.position} />
        </div>
      );
    })}
  </div>
</section>
    </div>
  );
};

export const Team = () => {
  return (
    <div className="Teams">
      <div className="web-canvas">
        <WebCanvas />
      </div>
      <img src={Teams} alt="teams" className='mainteams lg:mt-36 mt-24 lg:scale-100 scale-90 sm:mt-28'/>
      <TeamContent />
    </div>
  );
};

export default Team;

