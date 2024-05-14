#!/bin/bash
# create the canisters on the local network
NETWORK="local"
dfx canister create icp_ledger_canister --network "${NETWORK}"
dfx canister create frontend --network "${NETWORK}"
 dfx canister create backend --network "${NETWORK}"


## set the minter to the anonymous identity for testing purposes only
MINTERID="2vxsx-fae"
echo $MINTERID

## store the principal id of the cli user
PRINCIPAL="$(dfx identity get-principal)"
echo $PRINCIPAL


dfx identity use testID
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)




## deploy the chat ledger canister
echo "Step 3: deploying local ICP ledger canister canister..."
dfx deploy --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai icp_ledger_canister --argument "
  (variant {
    Init = record {
      minting_account = \"$MINTER_ACCOUNT_ID\";
      initial_values = vec {
        record {
          \"$DEFAULT_ACCOUNT_ID\";
          record {
            e8s = 10_000_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
  })
" --mode=reinstall -y



 dfx canister --network local call icp_ledger_canister icrc1_transfer '
   (record {
     to=(record {
       owner=(principal "dgjj7-frr4f-jt6ev-5g2lo-xxpvq-x7eh5-rigt2-mmw3k-pc5ph-v3kt6-fae")
     });
     amount=900000000000
   })
 '


 echo "Deploying the backend canister"
 dfx deploy backend 


## deploy the frontend canister
echo "Deploying the whole application on the network"
dfx deploy --network "${NETWORK}"

echo "Generating .did files for the canisters"
dfx generate

echo "Done with the deployment"

