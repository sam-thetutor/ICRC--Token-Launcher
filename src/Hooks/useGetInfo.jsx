import { Principal } from '@dfinity/principal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

const useGetInfo = () => {
    const queryClient = useQueryClient();

    const { data: principal } = useQuery({
        queryKey: ['principal'],

    });

    const { data: backendActor } = useQuery({
        queryKey: ['backendActor'],
    });

    const { data: icpActor } = useQuery({
        queryKey: ['icpActor'],
    });

    


    const loadUserICPBalance = async () => {
        if (!principal || !backendActor) return { err: 'not allowed' };
        const results = await icpActor?.icrc1_balance_of({
            owner: Principal.fromText(principal?.toString()),
            subaccount: []
        })
         await queryClient.setQueryData(['userICPBalance'],Number(results) / 1e8);
        return (Number(results) / 1e8)
    }



    const loadUserCreatedTokens = async () => {
        if (!principal || !backendActor) return { err: 'not allowed' };
        const results = await backendActor?.get_all_tokens_for_user(Principal.fromText(principal?.toString()))
         await queryClient.setQueryData(['userCreatedTokens'], results);
        return results;

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


    return {
        invalidateUserICPBalance,
        invalidateUserCreatedTokens,
    };
};
export default useGetInfo;