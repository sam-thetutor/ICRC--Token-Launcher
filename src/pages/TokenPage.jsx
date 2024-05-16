import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useGetInfo from '../Hooks/useGetInfo'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ClipLoader } from 'react-spinners'
import { fixDecimals, shorten20String } from '../Utils/functions'
import TransactionTable from '../components/TransactionTable'
import ExcelUploader from '../components/ExcelUploader'
import { Principal } from '@dfinity/principal'

const TokenPage = () => {
  const { getTokenDetails, tokenDetails, tokenActor, userBalance } = useGetInfo()
  const { invalidateUserCreatedTokens } = useGetInfo()

  const { tokenId } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    recipient: '',
    amount: 0,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  useEffect(() => {
    if (tokenId == null) return
    getTokenDetails(tokenId)
  }, [tokenId])

  const { data: principal } = useQuery({
    queryKey: ['principal']
  })


  const { mutateAsync: HandleSendToken } = useMutation({
    mutationFn: (data) => handleSubmit(data),
    onSuccess: async () => {
      await invalidateUserCreatedTokens(),
        getTokenDetails(tokenId),
        setIsLoading(false)

    },
  });


  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tokenActor || !principal) return
    setIsLoading(true)
    try {
      const results = await tokenActor.icrc1_transfer({

        to: {
          owner: Principal.fromText(formData.recipient),
          subaccount:[]
        },
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: Number(formData.amount) * 1e8,
      })
console.log("transfer results :",results)
      return results

    } catch (error) {
      console.log("error in sending custom token :", error)
    }
  }





  return (
    <div className='flex w-full gap-2 p-6  '>

      <div className='flex flex-col mt-16 items-center w-1/2 border gap-8 rounded-md border-blue-300 h-full p-10'>
        <div className='flex justify-center gap-8 w-full items-center p-2'>
          <img src={tokenDetails?.logo} alt="" className='h-28 w-28 rounded-full' />
          <div className="grid grid-cols-1 gap-1 text-white">
            <div>
              <span className="font-bold">Name:</span>
              <span className="ml-2">{tokenDetails?.name}</span>
            </div>
            <div>
              <span className="font-bold">Symbol:</span>
              <span className="ml-2">{tokenDetails?.symbol}</span>
            </div>
            <div>
              <span className="font-bold">Decimals:</span>
              <span className="ml-2">{tokenDetails?.decimals}</span>
            </div>
            <div>
              <span className="font-bold">Total Supply:</span>
              <span className="ml-2">{Number(tokenDetails?.totalSupply)/1e8}</span>
            </div>
          </div>
        </div>

        <div className='flex flex-col border shadow-lg shadow-blue-300 rounded-md justify-center w-3/4'>

          <div className="w-full mx-auto p-6 text-white rounded-md shadow-md text-xl flex-col flex">
            <div className='flex flex-col justify-center items-center w-full'>
              <span className='p-2 bg-gray-400 w-full m-2 items-center flex justify-center rounded-md'>{shorten20String(principal?.toString())}</span>
              <span>Balance : {userBalance && fixDecimals(userBalance)} {tokenDetails?.symbol}</span>

            </div>
            <form onSubmit={HandleSendToken}>
              <input
                type="text"
                name="recipient"
                value={formData.recipient}
                onChange={handleChange}
                placeholder="enter principal id"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md text-black"
              />


              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="enter amount"
                className="block w-full mt-2 p-2 border border-gray-300 rounded-md text-black"
              />

              <div className="flex flex-col gap-2 justify-center items-center">

                {
                  isLoading ? <ClipLoader color="orange" size={35} /> :
                    <button
                      type="submit"
                      className=" w-full mt-2 hover:bg-orange-400 cursor-pointer p-2 border border-black text-black rounded-md "
                    >
                      Send
                    </button>
                }
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-6 w-1/2 border rounded-md border-blue-400 h-[545px] text-white p-4  mt-16 items-center overflow-y-auto'>
        <h2 className='text-3xl border-b-2'>Transactions history</h2>
        {tokenDetails ? <TransactionTable data={tokenDetails?.transactions} tokenName={tokenDetails?.name} /> :
          ""
        }
      </div>
      <div>
        {/* <ExcelUploader/> */}
      </div>
    </div>

  )
}

export default TokenPage
