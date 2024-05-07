import { Principal } from "@dfinity/principal"
import { useEffect, useState } from "react"
import { CkBtc_index,canisterId as CKID } from "../../declarations/CkBtc_index"
import { ICP_index,canisterId as ICID } from "../../declarations/ICP_index"
import { ICP_ledger, canisterId as ICPLedger } from "../../declarations/ICP_ledger"
import { CkBtc_ledger, canisterId as ckLedger } from "../../declarations/CkBtc_ledger"
import { extendedTokenData } from "../Utils/extendedData"
import { formatExtendedTokenData, transformTransactionArray } from "../Utils/functions"
import { createActor } from "../Utils/createActor"
import {idlFactory as icrc1_Index_Factory} from "../../declarations/CkBtc_index"

const useGetTransactions = () => {
    const [userICPTransactions, setUserICPTransactions] = useState(null)
    const [userckTransactions, setUserckTransactions] = useState(null)
    const [isFectingData, setIsFetchingData] = useState(false)
    const [userBalances, setUserBalances] = useState(null)
    const BLAST_CANISTER_ID = 'u45jl-liaaa-aaaam-abppa-cai';
    const [tokenInformation, setTokenInformaton] = useState(null);
    const [blastData, setBlastData] = useState(null);
    const [tokenTransactions, setTokenTransactions] = useState(null);

    useEffect(() => {
        LoadTokenData();
    }, []);


    const getICPBalance = async (principID) => {
        try {
            setIsFetchingData(true)

            const [icpBalance, ckBalance, icpTrans, ckTrans, icpMeta, ckMeta] = await Promise.all([

                await ICP_ledger?.icrc1_balance_of({
                    owner: Principal.fromText(principID),
                    subaccount: [],
                }),


                await CkBtc_ledger?.icrc1_balance_of({
                    owner: Principal.fromText(principID),
                    subaccount: [],
                }),
                await ICP_index?.get_account_transactions({
                    max_results: 20,
                    start: [],
                    account: {
                        owner: Principal.fromText(principID),
                        subaccount: []
                    }
                }),
                await CkBtc_index?.get_account_transactions({
                    max_results: 20,
                    start: [],
                    account: {
                        owner: Principal.fromText(principID),
                        subaccount: []
                    }
                }),

                await ICP_ledger?.icrc1_metadata(),

                await CkBtc_ledger?.icrc1_metadata()


            ])
            console.log("balances :", icpBalance, ckBalance, icpTrans, ckTrans)
            setUserBalances([{
                amount: Number(icpBalance) / 1e8, canister_id: ICPLedger, token_symbol: icpMeta[2][1]?.Text, token_decimals: Number(icpMeta[0][1]?.Nat),
            },
            {
                amount: Number(ckBalance) / 1e8, canister_id: ckLedger, token_symbol: ckMeta[2][1]?.Text, token_decimals: Number(ckMeta[0][1]?.Nat),
            },
            ])

        } catch (error) {
            console.log("error in getting icp balance :", error);
        }
        setIsFetchingData(false)
    }


    const LoadTokenData=async()=> {
        if (process.env.DFX_NETWORK !== 'ic') {
            setBlastData(extendedTokenData);
        } else {
            const priceIOracle = createActor(
                BLAST_CANISTER_ID,
                price_oracle_idlFactory,
            );
            //fetch the data
            const data = priceIOracle?.get_latest_extended();
            console.log("fetched online data for tokens")
            setBlastData(data);
        }
    }


    const getTokenInfo = (data) => {
        if (!data?.token_symbol || !blastData) {
            console.log("something is wrong :",blastData,data?.token_symbol)
            return
        };
        const tokenInfo = formatExtendedTokenData(data?.token_symbol, blastData);
        console.log("blast data :",blastData)
        console.log('token info :', tokenInfo);
        setTokenInformaton(tokenInfo);
    }

    


    const  getLedgerID=(token)=> {
        let text;
        console.log("token :",token)
        switch (token) {
            case 'ckBTC':
            text = CKID;
            break;
          case 'ICP':
              text = ICID;
              break;
              default:
                  text = CKID;
                }
                
            console.log(text);
        return text;
      }
      

   const getUserTokenTransactions=async(data, userId)=> {
        if (data.token_symbol === null || !userId) return;
        console.log("user id :",userId);
        try {
          //get the token canister
          const tokenIndexId = getLedgerID(data.token_symbol);
          //create an actor
          const IndexActor = createActor(tokenIndexId , icrc1_Index_Factory);
          //get all transactions of the user
          console.log('index :', IndexActor);
          const transactions = await IndexActor?.get_account_transactions({
            max_results: 20,
            start: [],
            account: {
              owner: Principal.fromText(userId),
              subaccount: [],
            },
          });
          console.log('user transactions :', transactions.Ok);
    
          if (transactions.Ok) {
            const transformedData = transformTransactionArray(
              transactions.Ok.transactions,
            );
            console.log('user transactions :', transformedData);
            setTokenTransactions(transformedData);
          }
        } catch (error) {
          console.log('error in getting user token transactions :', error);
        }
      }

    //   dfx canister call CkBtc_ledger icrc1_transfer "(record { to = record { owner = principal \"5fkr7-asmd6-yspkj-fojfy-xqrw5-3au5l-kz4wq-ah77f-yupzz-wi2mh-aqe\";};  amount = 40000_000;})"





    return {
        userBalances,
        getTokenInfo,
        getUserTokenTransactions,
        tokenInformation,
        tokenTransactions,
        isFectingData,
        userICPTransactions,
        userckTransactions,
        getICPBalance
    }


}


export default useGetTransactions