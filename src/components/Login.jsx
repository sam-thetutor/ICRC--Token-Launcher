import React, { useState } from "react";
import { AuthClient } from '@dfinity/auth-client';
import {
  canisterId as backendCanisterID,
  createActor,
} from '../declarations/backend';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createAgent } from '@dfinity/utils';
import { useNavigate } from 'react-router-dom';
import {canisterId as LedgerID, createActor as createLedgerActor} from "../declarations/icrc1_ledger_canister"
const StakingApp = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [buttonLoading, setButtonLoading] = useState(false);


  const IdentityHost =
    process.env.DFX_NETWORK === 'ic'
      ? 'https://identity.ic0.app/#authorize'
      : `http://localhost:4943?canisterId=br5f7-7uaaa-aaaaa-qaaca-cai#authorize`;
  //One day in nanoseconds

  const HOST =
    process.env.DFX_NETWORK === 'ic'
      ? 'https://identity.ic0.app/#authorize'
      : 'http://localhost:4943';

  const days = BigInt(1);
  const hours = BigInt(24);
  const nanoseconds = BigInt(3600000000000);

  const defaultOptions = {
    createOptions: {
      idleOptions: {
        // Set to true if you do not want idle functionality
        disableIdle: true,
      },
    },
    loginOptions: {
      identityProvider: IdentityHost,
      // Maximum authorization expiration is 8 days
      maxTimeToLive: days * hours * nanoseconds,
    },
  };




  const handleLogin = async () => {
    try {
      const authClient = await AuthClient.create(defaultOptions.createOptions);

      if (await authClient.isAuthenticated()) {
        console.log(await authClient.isAuthenticated());
        //handleAuthentication
        handleAuthenticated(authClient);
      } else {
        //login
        await authClient.login({
          identityProvider: IdentityHost,
          onSuccess: () => {
            handleAuthenticated(authClient);
          },
        });
      }
    } catch (error) {
      console.log('error in login:', error);
    }
  };



  async function handleAuthenticated(authClient) {
    //get the identity
    if (!(await authClient?.isAuthenticated())) {
      navigate('/');
      return;
    }
    console.log('authclient :', authClient);
    const identity = authClient.getIdentity();

    //get the principal id
    const principal = identity.getPrincipal();

    //create the authenticated actor for the backend
    const actor = createActor(backendCanisterID, {
      agentOptions: {
        identity,
      },
    });

    //create the authenticated actor for the ledger canister

    const legActor = createLedgerActor(LedgerID,{
      agentOptions:{
        identity
      },
    })

    //fetch the balance of the current logged in user
    let balance = await legActor.icrc1_balance_of({
      owner:principal,
      subaccount:[]
    })

    console.log("balance :",balance);



    const agent = await createAgent({
      identity,
      host: HOST,
    });

    const stakeData = await actor.get_user_stake(principal)
    console.log("stake data :",stakeData);


    //set the user data to
    await Promise.all([
      queryClient.setQueryData(['tokenLedger'],legActor),

      queryClient.setQueryData(['userBalance'],Number(balance)/1e8),
      queryClient.setQueryData(['stakeData'], stakeData?.ok?stakeData.ok :{}),
      queryClient.setQueryData(['principal'], principal?.toString()),
      queryClient.setQueryData(['authClient'], authClient),
      queryClient.setQueryData(['agent'], agent),
      queryClient.setQueryData(['backendActor'], actor),
      queryClient.setQueryData(['identity'], identity),
      queryClient.setQueryData(
        ['isAuthenticated'],
        await authClient?.isAuthenticated(),
      ),
    ])
    setButtonLoading(false);
    navigate('/dashboard');
  }



  return (
    <div
      className=" flex justify-center items-center h-full flex-col mt-16 w-full">
      
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to the Staking App</h2>
          <p className="text-gray-600">Earn passive income by staking your ICP tokens.</p>
          <button className="bg-indigo-600 text-white py-2 px-4 rounded mt-8 hover:bg-indigo-700" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default StakingApp;