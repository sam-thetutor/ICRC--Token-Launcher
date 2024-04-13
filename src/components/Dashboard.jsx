
import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
const Dashboard = () => {
    const [stakeAmount, setStakeAmount] = useState(0)


    const { data: principal } = useQuery({
        queryKey: ['principal'],
    });
    const { data: userBalance } = useQuery({
        queryKey: ['userBalance'],
    });

    const { data: tokenLedger } = useQuery({
        queryKey: ['tokenLedger'],
    });

    const { data: backendActor } = useQuery({
        queryKey: ['backendActor'],
    });

    const { data: stakeData } = useQuery({
        queryKey: ['stakeData'],
    });


    console.log("stakeeee :", stakeData);





    const handleChange = (e) => {
        setStakeAmount(e.target.value)

    }

    const handleStake = async () => {

        if (!backendActor || !tokenLedger) {
            alert("you need to login first")
            return
        }

        if (stakeAmount >= userBalance) {
            alert("you dont have enought funds")
        } else {
            console.log("well");
        }


    }
    console.log(stakeAmount);
    return (
        <div className="flex flex-col w-full min-h-full justify-center items-center">
            <h1 className="border-b-2 p-2 mb-8">Dashboard</h1>

            <div className="flex flex-col gap-2">
                <span>Principal ID</span>
                <span>{principal && principal}</span>
                <span>Balance : {userBalance && userBalance}</span>
            </div>
            {
                !stakeData?.amount ?

                <div className="flex flex-col justify-center items-center p-1 border rounded-md mt-6">
                    <span>{stakeData.amount} 10 </span>
                    <div className=" flex gap-3 p-2 mt-4">
                        <button className="text-sm">Claim Rewards</button>
                        <button className="text-sm">UnStake Tokens</button>
                    </div>


                </div>

                    

                    :

                    <div className="flex flex-col gap-4 border p-2 mt-6 ">
                        <input className="h-12" type="number" placeholder="enter stake amount" value={stakeAmount} onChange={handleChange} />
                        <button onClick={handleStake}>Stake</button>

                    </div>

            }





        </div>
    )
}

export default Dashboard

// dfx canister call icrc1_ledger_canister icrc1_transfer "(record { to = record { owner = principal \"mmgiq-ykmw6-eg6xw-fujwu-lymd5-5wvpe-47nnp-vzqvx-y3nim-t6c4w-uae\";};  amount = 10_000;})"


