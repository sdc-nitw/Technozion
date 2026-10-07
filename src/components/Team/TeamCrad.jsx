import React from 'react'
import DepthSurface from '../ui/DepthSurface';

function TeamCrad({src, name, position, email=""}) {
  return (
    <DepthSurface className="team-card ui-panel flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full object-cover aspect-[11/12] rounded-lg"
        />
      </div>
      <div className="mt-3 px-1">
        <p className="font-bold text-white uppercase text-md">{name}</p>
        <p className="team-role">{position}</p>
    {email && <div  className="team-email" >{email}</div>}
      </div>
    </DepthSurface>
  )
}

export default TeamCrad
