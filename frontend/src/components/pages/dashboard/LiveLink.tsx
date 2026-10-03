// import React from 'react'
import { Link } from 'react-router-dom'

interface liveLinkProps {
  username: string;
}

const LiveLink = ({username}: liveLinkProps) => {
  return (
    <div>
      <Link to={`/${username}`} target='_blank' className="text-sm text-[#ff596b] transition-colors hover:text-[#ff8996]"><p>lost.lol/{username}</p></Link>

    </div>
  )
}

export default LiveLink
