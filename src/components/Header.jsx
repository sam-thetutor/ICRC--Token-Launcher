import React from 'react'
import useAuth from '../Hooks/useAuth'
import Logo from "../assets/motoko.png"
import { useQuery } from '@tanstack/react-query'
import Profile from "./Profile"
import { useNavigate } from 'react-router-dom'
const Header = () => {
    const { LoginButton } = useAuth()
    const { data: principal } = useQuery({
        queryKey: ['principal']
    })

    const navigate= useNavigate()

    return (
        <div className='flex justify-between items-center w-screen gap-2 py-2 px-8'>
                <div onClick={()=>navigate(principal?"/dashboard":"/")} ><img src={Logo} alt="" className='h-10 w-10 cursor-pointer' /></div>
            <div className='flex justify-between items-center p-3 gap-16'>
                <ul className='flex text-xl gap-2 justify-center items-center'>
                    <li className='p-2 hover:cursor-pointer hover:bg-red-200 rounded-md' onClick={()=>navigate("/dashboard/create")}>Create</li>
                    <li className='p-2 hover:cursor-pointer hover:bg-red-200 rounded-md' onClick={()=>navigate("/dashboard/mytokens")}>My Tokens</li>
                </ul>
            {principal ? <Profile /> : <LoginButton />}
            </div>
        </div>
    )
}

export default Header
