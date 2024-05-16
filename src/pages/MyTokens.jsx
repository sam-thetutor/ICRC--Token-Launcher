import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const MyTokens = () => {

  const { data: principal } = useQuery({
    queryKey: ['principal']
  })

  const navigate = useNavigate()
  const { data: userCreatedTokens } = useQuery({
    queryKey: ['userCreatedTokens']
  })

  return (

    <>
      {
        principal ?



          <div className='flex flex-col justify-center  text-white items-center gap-1'>
            <h2 className='text-3xl mt-[30px] '> My Tokens</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 mt-10 px-10 md:px-15 lg:px-32 lg:grid-cols-2 gap-2 justify-center items-center '>
              {
                userCreatedTokens?.map((item, index) => (
                  <div key={index} className='flex gap-2 justify-center items-center border p-2 rounded-lg'>
                    <img src={item.logo} alt="token logo" className='h-16 w-16 rounded-full' />
                    <div className='flex flex-col gap-2 justify-center items-center px-6 cursor-pointer' onClick={() => navigate('./' + item.canisterId)}>
                      <div className='flex justify-between items-center w-[150px]'>
                        <div className='flex flex-col  justify-center items-center'>
                          <h4 className='text-gray-400'>name</h4>
                          {item.name}
                        </div>
                        <div className='flex flex-col justify-center items-center'>
                          <h4 className='text-gray-400'>symbol</h4>
                          {item.symbol}
                        </div>
                      </div>
                      <div className='flex flex-col justify-center items-center'>
                        <h4 className='text-gray-400'>total supply</h4>
                        {Number(item.totalSupply) / 1e8}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div> :
          <div className='flex flex-col text-4xl text-white gap-3 justify-center w-full items-center'>
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-9xl font-bold text-gray-400">404</h1>
              <h2 className="text-4xl font-bold text-gray-600 mt-4">Page Not Found</h2>
              <p className="text-gray-500 mt-4">
                The page you are looking for does not exist or has been moved.
              </p>
              <a
                href="/"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mt-8"
              >
                Go to Home
              </a>
            </div>
          </div>


      }
    </>
  )
}

export default MyTokens
