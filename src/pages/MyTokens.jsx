import { useQuery } from '@tanstack/react-query'
import React from 'react'

const MyTokens = () => {

  const { data: principal } = useQuery({
    queryKey: ['principal']
  })

  const { data: userCreatedTokens } = useQuery({
    queryKey: ['userCreatedTokens']
  })

  console.log("user tokens :", userCreatedTokens)
  return (
    <div className='flex flex-col justify-center text-white items-center gap-1'>
      <h2>
        My Tokens

      </h2>

      {/* <div className='grid grid-cols-1 md:grid-cols-2  mt-10 px-10 md:px-15 lg:px-32 lg:grid-cols-3'>
        {
          posts?.map((item, index) => (
            <div key={index} className='m-4' onClick={() => window.open(item.linkToArticle, '_blank')}>
              <img src={item.image} className='w-full rounded-2xl object-cover h[200px]' />
              <h3 className='text-red-400 mt-3'>{item.tag}</h3>
              <h3 className='font-bold mt-3 cursor-pointer'>{item.title}</h3>
              <h3 className='line-clamp-3 text-gray-400 mt-3 cursor-pointer'>{item.introductionContent}</h3>
              <div className=' flex mt-2 items-center'>
                <img src="https://a2ede-rqaaa-aaaal-ai6sq-cai.raw.icp0.io/uploads/Howard_Allen.1563.1563.png" className='w-[35px] rounded-full' alt="" />
                <div className='ml-2'>
                  <h3 className='font-bold text-[12px]'>Sam-the-tutor</h3>
                  <h3 className='text-gray-400 text-[10px]'>{item.publishedAt?.toString()}</h3>
                </div>
              </div>
            </div>
          ))
        }

      </div> */}

    </div>
  )
}

export default MyTokens
