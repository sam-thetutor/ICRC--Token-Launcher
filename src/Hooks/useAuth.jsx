import React, { useEffect, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { canisterId as backendCanisterID, idlFactory as BackendFactory } from "../declarations/backend"
import { canisterId as ICP_Canister_ID, idlFactory as LedgerFactory } from "../declarations/icp_ledger_canister"
import { createAgent } from '@dfinity/utils';
import { ClipLoader } from 'react-spinners';
import { Principal } from '@dfinity/principal';
import { createActor } from "../Utils/createActor"
import { idlFactory as tokenFactory } from "../Utils/icrctoken.did"
import { createActor as createTokenActor } from "../declarations/tokenActor"
const IdentityHost =
  process.env.DFX_NETWORK === 'ic'
    ? 'https://identity.ic0.app/#authorize'
    : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`;
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

const useAuth = () => {

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [buttonLoading, setButtonLoading] = useState(false);






  const handleLogin = async () => {
    setButtonLoading(true);
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
  }


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

    const agent = await createAgent({
      identity,
      host: HOST,
      fetchRootKey:true,
      //  verifyQuerySignatures: false
    });

    const actor = createActor(backendCanisterID, BackendFactory, { agent });
    const icpActor = createActor(ICP_Canister_ID, LedgerFactory, { agent })



    //get the icp balance of the user
    const userBal = await icpActor?.icrc1_balance_of({
      owner: Principal.fromText(principal?.toString()),
      subaccount: []
    })

    //fetch the user info and set it there.
    const tokens = await actor?.get_all_tokens_for_user(Principal.fromText(principal?.toString()))
    let tokenData = await getTokenData(tokens, agent)

    await queryClient.setQueryData(['agent'], agent);
    await queryClient.setQueryData(['icpActor'], icpActor);

    await queryClient.setQueryData(['backendActor'], actor);
    await queryClient.setQueryData(['identity'], identity);
    await queryClient.setQueryData(
      ['isUserAuthenticated'],
      await authClient?.isAuthenticated(),
    );
    await queryClient.setQueryData(['principal'], principal?.toString());
    await queryClient.setQueryData(['authClient'], authClient);



    console.log('all tokens for the user :', tokenData, userBal);
    await queryClient.setQueryData(['userICPBalance'], (Number(userBal) / 1e8));
    await queryClient.setQueryData(['userCreatedTokens'], tokenData);

    setButtonLoading(false);
    navigate('/dashboard/create');
  }


  const getTokenData = async (tokens, agent) => {
    let allTokenData = []

    if (tokens.length < 1) return []
    try {
      for (const singleToken of tokens) {

        //create the actor
        console.log("all token :", singleToken?.toString())
        let actor = createActor(singleToken?.toString(), tokenFactory, { agent })
        const [name, symbol, logo, decimals, transactions] = await Promise.all([
          await actor?.icrc1_name(),
          await actor?.icrc1_symbol(),
          await actor?.icrc1_logo(),
          await actor?.icrc1_decimals(),
          await actor?.getTransactionHistory()
        ])

        console.log(name, symbol, logo, decimals, transactions, singleToken)
        // allTokenData.push({ name, symbol, logo, decimals, transactions, canisterId: singleToken })
      }


      return allTokenData

    } catch (error) {
      console.log("error in getting data about tokens :", error)
      return []
    }


  }








  const LoginButton = () => {
    return (
      <button className='border border-black' onClick={handleLogin}>
        Login
      </button>
    )
  }
  const LogoutButton = () => {
    return (
      <button onClick={logout} >
        logout
      </button>
    )
  }

  const logout = async () => {
    const authClient = await AuthClient.create(defaultOptions.createOptions);

    await authClient?.logout();
    await queryClient.setQueryData(['agent'], null);

    await queryClient.setQueryData(['backendActor'], null);
    await queryClient.setQueryData(['identity'], null);
    await queryClient.setQueryData(
      ['isUserAuthenticated'],
      await authClient?.isAuthenticated(),
    );
    await queryClient.setQueryData(['principal'], null);
    await queryClient.setQueryData(['authClient'], null);
    await queryClient.setQueryData(['userICPBalance'], null);
    await queryClient.setQueryData(['userCreatedTokens'], null);



    handleAuthenticated(authClient);
  }





  return {
    LoginButton,
    LogoutButton
  }
}

export default useAuth
