import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import useAuth from '../Hooks/useAuth'
import { CgProfile } from "react-icons/cg";
import CopyButton from "../Utils/copyButton"
import { shorten17String } from '../Utils/functions';

const Profile = () => {
const {LogoutButton} = useAuth()

  const {data:principal} = useQuery({
    queryKey:['principal']
  })
  
  const { data: userICPBalance } = useQuery({
    queryKey: ['userICPBalance']
})

console.log("uuuuu :",Number(userICPBalance))
  const [showMenu,setShowMenu] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex justify-center w-full rounded-md  px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
          id="options-menu"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={()=>setShowMenu(!showMenu)}
        >
          <CgProfile size={25}/>
        </button>
      </div>

      <div
        className={`origin-top-right ${showMenu?"block":"hidden"} absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none`}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        <div className="py-1 justify-center items-center flex flex-col" role="none">
          <div className='flex flex-col gap-1 p-1'>
          <div className='flex gap-1 justify-center text-black items-center'>
            {principal&&shorten17String(principal?.toString())}
            <CopyButton textToCopy={principal?.toString()} />
          </div>
          <span className='flex justify-center items-center text-black'>
           {userICPBalance != null && Number(userICPBalance)} LICP
          </span>
          </div>
          <LogoutButton/>          
        </div>
      </div>
    </div>
  )
}

export default Profile
