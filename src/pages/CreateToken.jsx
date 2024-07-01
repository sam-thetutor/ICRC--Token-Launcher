import React, { useState } from 'react'
import { useMutation, useQuery } from "@tanstack/react-query"
import { canisterId } from "../declarations/backend"
import { Principal } from '@dfinity/principal';
import useGetInfo from '../Hooks/useGetInfo';
import { ClipLoader } from "react-spinners"

const CreateToken = () => {
  const { invalidateUserCreatedTokens, invalidateUserICPBalance } = useGetInfo()

  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    tokenFee: 0,
    totalSupply: 0,
    image: '',
  });

  const { data: icpActor } = useQuery({
    queryKey: ['icpActor']
  })
  const { data: backendActor } = useQuery({
    queryKey: ['backendActor']
  })

  const { data: principal } = useQuery({
    queryKey: ['principal']
  })

  const { mutateAsync: HandleCreateNewToken } = useMutation({
    mutationFn: (data) => handleSubmit(data),
    onSuccess: async () => {
      await invalidateUserCreatedTokens(),
        await invalidateUserICPBalance()
      setIsLoading(false)
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!icpActor || !backendActor) return
    try {
      setIsLoading(true)
      await icpActor?.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: (5 * 1e8) + 10000,
        expected_allowance: [],
        expires_at: [],
        spender: {
          owner: Principal.fromText(canisterId),
          subaccount: []
        }
      })

      const newTokenResults = await backendActor?.createNewToken(
        formData.name,
        formData.symbol,
        Number(formData.tokenFee),
        formData.image,
        [
          {
            account: {
              owner: Principal.fromText(principal),
              subaccount: []
            },
            amount: Number(formData.totalSupply)
          }
        ]
      )

      console.log("new token results :", newTokenResults)
      return newTokenResults;
    } catch (error) {
      console.log("error in creating new token :", error)
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <>
      {principal ?
        <div className='flex flex-col text-white gap-3 items-center'>
          <h2 className='text-3xl mt-[30px] text-blue-500'>Create Token</h2>
          <div className="max-w-md mx-auto p-6 bg-blue-500 rounded-md shadow-md text-xl">
            <form onSubmit={HandleCreateNewToken}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="token name"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="token symbol"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                name="tokenFee"
                value={formData.tokenFee}
                onChange={handleChange}
                placeholder="token fee"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
              />

              <input
                type="number"
                name="totalSupply"
                value={formData.totalSupply}
                onChange={handleChange}
                placeholder="total supply"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="enter token logo/image"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md"
              />

              <div className="flex flex-col gap-2 mt-4 justify-center items-center">
                <span className='text-xs bg-yellow-200 text-blue-500'>You will be charged 1 ICP to create your token</span>
                {
                  isLoading ? <ClipLoader color="orange" size={35} /> :
                    <button
                      type="submit"
                      className=" w-full mt-2 hover:bg-orange-400 cursor-pointer p-2 border border-black text-white rounded-md bg-orange-500"
                    >
                      Submit
                    </button>
                }
              </div>
            </form>
          </div>
        </div>
        :
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

export default CreateToken
