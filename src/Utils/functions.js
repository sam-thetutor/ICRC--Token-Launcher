import { createActor } from "./createActor"
import { idlFactory as tokenFactory } from "./icrctoken.did"



export function shorten17String(str) {
  if (!str) return;
  if (str.length <= 11) {
    return str;
  } else {
    let firstPart = str.substring(0, 15);
    let lastPart = str.substring(str.length - 3);
    return `${firstPart}...${lastPart}`;
  }
}

export function fixDecimals(num) {
  if (num === undefined) return
  let decimalPart = (num + '').split('.')[1];
  if (decimalPart === '0' || !decimalPart) {
    return num.toFixed(0);
  } else {
    return num.toFixed(3);
  }
}


export function shorten20String(str) {
  if (!str) return;
  if (str.length <= 11) {
    return str;
  } else {
    let firstPart = str.substring(0, 25);
    let lastPart = str.substring(str.length - 10);
    return `${firstPart}...${lastPart}`;
  }
}


export const getTokenData = async (tokens, agent) => {
  let allTokenData = []
  console.log("all tokens here :", tokens)
  if (tokens.length < 1) return []
  try {
    for (const singleToken of tokens) {

      //create the actor
      // console.log("all token :", singleToken?.toString())
      let actor = createActor(singleToken?.toString(), tokenFactory, { agent })
      const [name, symbol, logo, decimals, totalSupply, transactions] = await Promise.all([
        await actor?.icrc1_name(),
        await actor?.icrc1_symbol(),
        await actor?.icrc1_logo(),
        await actor?.icrc1_decimals(),
        await actor?.icrc1_total_supply(),
        await actor?.getTransactionHistory()
      ])

      // console.log("token Data :", name, symbol, logo, decimals, transactions, singleToken)
      allTokenData.push({ name, symbol, logo, decimals, totalSupply, transactions, canisterId: singleToken?.toString() })
    }


    return allTokenData

  } catch (error) {
    console.log("error in getting data about tokens :", error)
    return []
  }
}

export const formatTokenTransactons = (transactions) => {
  var userTransactions = [];
  if (!transactions) return
  for (const trans of transactions) {
    var transKind;
    var transAmount;
    var transFrom;
    var transTo;
    var timeStamp;
    var transFee;
    if ("Mint" in trans?.operation) {

      transKind = "mint",
        transAmount = trans?.operation?.Mint?.amount,
        transFrom = trans?.operation?.Mint?.from?.owner?.toString(),
        transTo = trans?.operation?.Mint?.to?.owner?.toString(),
        timeStamp = trans.timestamp,
        transFee = trans?.operation?.Mint?.fee[0]

    } else if ("Approve" in trans.operation) {

      transKind = "approve",
        transAmount = trans.operation.Approve.amount,
        transFrom = trans.operation.Approve.from.owner?.toString(),
        transTo = trans.operation.Approve.spender.owner?.toString(),
        timeStamp = trans.timestamp,
        transFee = trans.operation.Approve.fee[0]

    } else if ("Burn" in trans?.operation) {

      transKind = "burn",
        transAmount = trans.operation.Burn.amount,
        transFrom = trans.operation.Burn.from.owner?.toString(),
        transTo = trans.operation.Burn.to.owner?.toString(),
        timeStamp = trans.timestamp,
        transFee = trans.operation.Burn.fee[0]

    } else if ("Transfer" in trans?.operation) {

      transKind = "transfer",
        transAmount = trans.operation.Transfer.amount,
        transFrom = trans.operation.Transfer.from.owner?.toString(),
        transTo = trans.operation.Transfer.to.owner?.toString(),
        timeStamp = trans.timestamp,
        transFee = trans.operation.Transfer.fee[0]

    }


    userTransactions.push({
      kind: transKind,
      amount: Number(transAmount) / 1e8,
      from: transFrom,
      to: transTo,
      timestamp: Number(timeStamp)/1e6,
    });


  }


  return userTransactions




}










// export function transformTransactionArray(transactions) {
//   //   const formattedPrices = [];
//   var userTransactions = [];

//   for (const trans of transactions) {
//     var transKind;
//     var transAmount;
//     var transFrom;
//     var transTo;
//     var timeStamp;
//     var transactionId;
//     // if (trans.transaction.kind !== "") {
//     //   transKind = trans.transaction.kind;
//     //   transAmount = trans.transaction.transfer[0].amount;
//     //   transFrom = trans.transaction.transfer[0].from;
//     //   transTo = trans.transaction.transfer[0].to;
//     //   timeStamp = trans.transaction.transfer[0].created_at_time[0];
//     // } else
//     if (trans.operation.Mint) {
//       transactionId = trans.id;
//       transKind = 'mint';
//       transAmount = trans.operation.Mint[0].amount;
//       transFrom = 'mintAccount';
//       transTo = trans.transaction.mint[0].to.owner.toString();
//       timeStamp = trans.transaction.mint[0].created_at_time[0];
//     } else if (trans.transaction.burn.length !== 0) {
//       transKind = 'burn';
//       transactionId = trans.id;
//       transAmount = trans.transaction.burn[0].amount;
//       transFrom = trans.transaction.burn[0].from.owner.toString();
//       transTo = 'mintAccount';
//       timeStamp = trans.transaction.burn[0].created_at_time[0];
//     } else if (trans.transaction.transfer.length !== 0) {
//       transKind = 'transfer';
//       transactionId = trans.id;
//       transAmount = trans.transaction.transfer[0].amount;
//       transFrom = trans.transaction.transfer[0].from.owner.toString();
//       transTo = trans.transaction.transfer[0].to.owner.toString();
//       timeStamp = trans.transaction.transfer[0].created_at_time[0];
//     }

//     userTransactions.push({
//       kind: transKind,
//       amount: Number(transAmount) / 1e9,
//       from: transFrom,
//       to: transTo,
//       timestamp: timeStamp,
//       id: Number(transactionId),
//     });
//   }
//   return userTransactions;
// }









