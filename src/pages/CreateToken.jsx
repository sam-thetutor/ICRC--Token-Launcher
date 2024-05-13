import React, { useState } from 'react'
import { useMutation, useQuery } from "@tanstack/react-query"
import { canisterId } from "../declarations/backend"
import { Principal } from '@dfinity/principal';
import useGetInfo from '../Hooks/useGetInfo';
import {ClipLoader} from "react-spinners"

const CreateToken = () => {
const {invalidateUserCreatedTokens,invalidateUserICPBalance} = useGetInfo()
  
const [isLoading,setIsLoading] = useState(false)
const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    tokenFee: 0,
    totalSupply: 0,
    image: null,
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
      //approve the backend to deduct the creation fee.
      await icpActor?.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: (5*1e8) + 10000,
        expected_allowance: [],
        expires_at: [],
        spender: {
          owner: Principal.fromText(canisterId),
          subaccount: []
        }
      })
      //call the backend canister to create the new token

      const newTokenResults = await backendActor?.createNewToken(
        formData.name,
        formData.symbol,
        Number(formData.tokenFee),
        "https://a2ede-rqaaa-aaaal-ai6sq-cai.raw.icp0.io/uploads/cat6.3744.5616.jpg",
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

      console.log("new token results :",newTokenResults)
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file,
    });
  };







  return (
    <div className='flex flex-col text-white gap-3 items-center'>
      <h2 className='text-3xl mt-[50px] '>Create Token</h2>
      <div className="max-w-md mx-auto p-6 text-black bg-white rounded-md shadow-md text-xl">
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
          <div className='flex flex-col gap-1 justify-center items-center border mt-2 p-2'>
            <span className=''>Select token logo</span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full mt-2 p-2 rounded  border-gray-300 "
            />
          </div>
          <div className="flex flex-col gap-2 justify-center items-center">

          <span className='text-xs bg-yellow-200'>You will be charged 1 ICP to create your token</span>
          {
            isLoading? <ClipLoader color="orange" size={35}/>:
            <button
            type="submit"
            className=" w-full mt-2 hover:bg-orange-400 cursor-pointer p-2 border border-black text-black rounded-md "
            >
            Submit
          </button>
          }
          </div>
        </form>
      </div>




    </div>
  )
}

export default CreateToken
