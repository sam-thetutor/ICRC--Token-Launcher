import React from 'react'
import useAuth from '../Hooks/useAuth'
import bgImage from "../assets/crypto2.jpg"
const Login = () => {
    const {LoginButton} = useAuth()
  return (
    <div
     className='flex flex-col justify-center items-center'>
      <img src={bgImage} alt="" className=' w-full rounded-md  h-[700px]' />

       <div className='flex mt-[-400px]'>

        <LoginButton />
       </div>
      
    </div>
  )
}

export default Login

// https://gsnnn-ziaaa-aaaag-acaaa-cai.icp0.io/

// https://unl3b-waaaa-aaaam-ach6a-cai.icp0.io/#/