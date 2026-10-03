// import React from 'react'
import { Link } from 'react-router-dom'

interface liveLinkProps {
  username: string;
}

const LiveLink = ({username}: liveLinkProps) => {
  return (
    <div>
      <Link to={`/${username}`} target='_blank' className="text-sm text-[#d58ae1] transition-colors hover:text-white"><p>lost.lol/{username}</p></Link>

    </div>
  )
}

export default LiveLink
