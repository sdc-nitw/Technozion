import React from 'react'

function TeamCrad({src, name, position, email=""}) {
  return (
    <div className="flex flex-col bg-slate-800 rounded-lg p-3 max-w-80">
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
        <p className="text-teal-400 text-base opacity-60">{position}</p>
    {email && <div  className="text-teal-400 opacity-40 text-base cursor-pointer" >{email}</div>}
      </div>
    </div>
  )
}

export default TeamCrad
