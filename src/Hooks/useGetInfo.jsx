import { Principal } from '@dfinity/principal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
// import {getTokenData} from "../Utils/functions"
import { createActor } from "../Utils/createActor"
import { idlFactory, idlFactory as tokenFactory } from "../Utils/icrctoken.did"
import { formatTokenTransactons } from '../Utils/functions';
import { useParams } from 'react-router-dom';

const useGetInfo = () => {
    const { tokenId } = useParams()

    const queryClient = useQueryClient();
    const [tokenDetails, setTokenDetais] = useState(null)
    const [tokenActor, setTokenActor] = useState(null)
    const [userBalance, setUserBalance] = useState(null)



    const { data: principal } = useQuery({
        queryKey: ['principal'],

    });
    const { data: userCreatedTokens } = useQuery({
        queryKey: ['userCreatedTokens']
    })


    const { data: backendActor } = useQuery({
        queryKey: ['backendActor'],
    });

    const { data: icpActor } = useQuery({
        queryKey: ['icpActor'],
    });
    const { data: agent } = useQuery({
        queryKey: ['agent'],
    });




    const loadUserICPBalance = async () => {
        if (!principal || !backendActor) return { err: 'not allowed' };
        const results = await icpActor?.icrc1_balance_of({
            owner: Principal.fromText(principal?.toString()),
            subaccount: []
        })
        await queryClient.setQueryData(['userICPBalance'], Number(results) / 1e8);
        return (Number(results) / 1e8)
    }



    const loadUserCreatedTokens = async () => {
        if (!principal || !backendActor || !agent) return { err: 'not allowed' };
        const tokens = await backendActor?.get_all_tokens_for_user(Principal.fromText(principal?.toString()))
        let tokenData = await getTokenData(tokens, agent)
        await queryClient.setQueryData(['userCreatedTokens'], tokenData);
        return tokenData;

    }



    const usrBalance = useQuery({
        queryKey: ['userICPBalance'],
        queryFn: loadUserICPBalance(),
    });

    const usrTokens = useQuery({
        queryKey: ['userCreatedTokens'],
        queryFn: loadUserCreatedTokens(),
    });



    async function invalidateUserICPBalance() {
        await queryClient.invalidateQueries(['userICPBalance']);
    }

    async function invalidateUserCreatedTokens() {
        await queryClient.invalidateQueries(['userCreatedTokens']);
    }

    const getTokenData = async (tokens, agent) => {
        let allTokenData = []
        if (tokens.length < 1 || !agent) return []
        try {
            for (let i = 0; i < tokens[0].length; i++) {

                //create the actor
                let actor = createActor(tokens[0][i]?.toString(), tokenFactory, { agent })
                const [name, symbol, logo, decimals, totalSupply, transactions] = await Promise.all([
                    await actor?.icrc1_name(),
                    await actor?.icrc1_symbol(),
                    await actor?.icrc1_logo(),
                    await actor?.icrc1_decimals(),
                    await actor?.icrc1_total_supply(),
                    await actor?.getTransactionHistory()
                ])
                const formTrans = formatTokenTransactons(transactions)


                allTokenData.push({ name, symbol, logo, decimals, totalSupply, transactions: formTrans, canisterId: tokens[0][i]?.toString() })
            }


            return allTokenData

        } catch (error) {
            console.log("error in getting data about tokens :", error)
            return []
        }
    }



    const getTokenDetails = async (canisterId) => {
        console.log("token Data :", userCreatedTokens)
        try {

            //create the actor
            const actor = createActor(canisterId, idlFactory, { agent })
            //get the balance of the user for this token
            const userBal = await actor?.icrc1_balance_of({
                owner: Principal.fromText(principal?.toString()),
                subaccount: []
            })

            const [name, symbol, logo, decimals, totalSupply, transactions] = await Promise.all([
                await actor?.icrc1_name(),
                await actor?.icrc1_symbol(),
                await actor?.icrc1_logo(),
                await actor?.icrc1_decimals(),
                await actor?.icrc1_total_supply(),
                await actor?.getTransactionHistory()
            ])
            console.log("transactions from ther : ",transactions)
            const formTrans = formatTokenTransactons(transactions)
console.log("transactions after there :",formTrans)
            setTokenDetais({ name, symbol, logo, decimals, totalSupply, transactions: formTrans, canisterId}),
                setTokenActor(actor),
                setUserBalance(Number(userBal) / 1e8)
        } catch (error) {
            console.log("error in getting token details :", error)

        }

    }



    return {
        invalidateUserICPBalance,
        invalidateUserCreatedTokens,
        getTokenDetails,
        tokenDetails,
        tokenActor,
        userBalance
    };
};
export default useGetInfo;