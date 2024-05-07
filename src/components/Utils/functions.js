
//this transforms the balances of the user by calculating
export function transformDataArray(dataArray) {
    try {
      if (!dataArray) return;
      const formattedPrices = {};
      for (const data of dataArray) {
        const user = data.principal_id;
        const tokens = data.items;
        for (const token of tokens) {
          const tokenSymbol = token.token_symbol;
          if (!formattedPrices[tokenSymbol]) {
            formattedPrices[tokenSymbol] = 0;
          }
          formattedPrices[tokenSymbol] += Number(token.amount) / 10 ** 8;
        }
      }
  
      return formattedPrices;
    } catch (e) {
      console.log('error in transforming data array :', e);
    }
  }
  
  export function fixDecimals(num) {
    let decimalPart = (num + '').split('.')[1];
    if (decimalPart === '0' || !decimalPart) {
      return num.toFixed(0);
    } else {
      return num.toFixed(3);
    }
  }
  
  export function transformTransactionArray(transactions) {
    //   const formattedPrices = [];
    var userTransactions = [];
  
    for (const trans of transactions) {
      var transKind;
      var transAmount;
      var transFrom;
      var transTo;
      var timeStamp;
      var transactionId;
      // if (trans.transaction.kind !== "") {
      //   transKind = trans.transaction.kind;
      //   transAmount = trans.transaction.transfer[0].amount;
      //   transFrom = trans.transaction.transfer[0].from;
      //   transTo = trans.transaction.transfer[0].to;
      //   timeStamp = trans.transaction.transfer[0].created_at_time[0];
      // } else
      if (trans.transaction.mint.length != +0) {
        transactionId = trans.id;
        transKind = 'mint';
        transAmount = trans.transaction.mint[0].amount;
        transFrom = 'mintAccount';
        transTo = trans.transaction.mint[0].to.owner.toString();
        timeStamp = trans.transaction.mint[0].created_at_time[0];
      } else if (trans.transaction.burn.length !== 0) {
        transKind = 'burn';
        transactionId = trans.id;
        transAmount = trans.transaction.burn[0].amount;
        transFrom = trans.transaction.burn[0].from.owner.toString();
        transTo = 'mintAccount';
        timeStamp = trans.transaction.burn[0].created_at_time[0];
      } else if (trans.transaction.transfer.length !== 0) {
        transKind = 'transfer';
        transactionId = trans.id;
        transAmount = trans.transaction.transfer[0].amount;
        transFrom = trans.transaction.transfer[0].from.owner.toString();
        transTo = trans.transaction.transfer[0].to.owner.toString();
        timeStamp = trans.transaction.transfer[0].created_at_time[0];
      }
  
      userTransactions.push({
        kind: transKind,
        amount: Number(transAmount) / 1e9,
        from: transFrom,
        to: transTo,
        timestamp: timeStamp,
        id: Number(transactionId),
      });
    }
    return userTransactions;
  }
  
  export function shortenString(str) {
    if (!str) return;
    if (str.length <= 11) {
      return str;
    } else {
      let firstPart = str.substring(0, 10);
      let lastPart = str.substring(str.length - 4);
      return `${firstPart}...${lastPart}`;
    }
  }
  
  export function shorten17String(str) {
    if (!str) return;
    if (str.length <= 11) {
      return str;
    } else {
      let firstPart = str.substring(0, 30);
      let lastPart = str.substring(str.length - 4);
      return `${firstPart}...${lastPart}`;
    }
  }
  
  export function formatExtendedTokenData(tokenName, extendedData) {
    try {
      let rates = [];
      let d = extendedData.map((x) => {
        let supply = x?.last
          ? x.last.circulating_supply / 10 ** x.config.decimals
          : 0;
        let price = x.rates?.find((q) => q.to_token === '0');
        if (price) price = price.rate;
        else price = 0;
        let volume = x.rates.find((x) => x.to_token === '0').volume;
        let depth2 = x.rates.find((x) => x.to_token === '0').depth2;
        let depth8 = x.rates.find((x) => x.to_token === '0').depth8;
        let depth50 = x.rates.find((x) => x.to_token === '0').depth50;
  
        let total = Number((x.last?.total_supply || 0) / 10 ** x.config.decimals);
        rates.push(...x.rates?.map((a) => ({ pair: a.symbol, rate: a.rate })));
        let sns = 'sns' in x.config.locking ? 'SNS' : '';
        return {
          sns,
          symbol: x.config.symbol,
          circulating:
            supply + ' | ' + ((Number(supply) * 100) / total).toFixed(1) + '%',
          price_USD: price.toFixed(6),
          marketcap_USD: Number(supply) * price,
          volume_USD: volume.toFixed(0),
          total: total.toLocaleString(),
          depth2: depth2.toFixed(0),
          depth8: depth8.toFixed(0),
          depth50: depth50.toFixed(0),
          treasury: (
            (x.last?.treasury || 0) /
            10 ** x.config.decimals
          ).toLocaleString(),
          treasuryICP: (x.last?.other_treasuries[0]
            ? x.last?.other_treasuries[0][1] / 10 ** 8
            : 0
          ).toLocaleString(),
          dissolving_1d_USD: Math.round(
            Number((x.last?.dissolving_1d || 0) / 10 ** x.config.decimals) *
              price,
          ).toLocaleString(),
          dissolving_30d_USD: Math.round(
            Number((x.last?.dissolving_30d || 0) / 10 ** x.config.decimals) *
              price,
          ).toLocaleString(),
          dissolving_1y_USD: Math.round(
            Number((x.last?.dissolving_1y || 0) / 10 ** x.config.decimals) *
              price,
          ).toLocaleString(),
        };
      });
      // d = d.filter(a => (a.symbol != 'OGY') && (a.symbol != 'ICP') && (a.symbol != "OT"))
      d = d.sort((a, b) => b.marketcap_USD - a.marketcap_USD);
      d = d.map((x) => ({
        ...x,
        marketcap_USD: Math.round(x.marketcap_USD).toLocaleString(),
      }));
  
      const filtered = d.filter((token) => token.symbol === tokenName);
  
      console.log('extended data :', filtered);
      console.log('Rate data :', rates);
      return filtered;
    } catch (e) {
      console.log('error in extended :', e);
    }
  }
  