# ICRC2 Token Launcher DApp


 dfx canister --network local call icp_ledger_canister icrc1_transfer '
   (record {
     to=(record {
       owner=(principal "p3aps-jg7md-6znzf-aaeth-zrcge-ahhrf-z27qd-2c2el-yadgt-l4kvf-yae")
     });
     amount=50000000000
   })
 '