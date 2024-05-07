
actor {
  stable var state = 0;
  
  public func name(arg : Text) : async () {
    
  };
};








// import Principal "mo:base/Principal";
// import Cycles "mo:base/ExperimentalCycles";
// import Iter "mo:base/Iter";
// import HashMap "mo:base/HashMap";
// import Buffer "mo:base/Buffer";
// import Error "mo:base/Error";
// import Result "mo:base/Result";
// import Nat "mo:base/Nat";
// import Nat64 "mo:base/Nat64";
// import Int "mo:base/Int";
// import Time "mo:base/Time";
// import Debug "mo:base/Debug";
// import ICRCLedger "canister:icrc1_ledger_canister";

// actor class TokenStaking() = this {

//   //total seconds in ayear
//   let totalYearlyTime : Int = 31536000;

//   let yearlyAPI : Int = 4;

//   public type Stake = {
//     amount : Nat;
//     startTime : Int;
//     isStaked : Bool;
//   };

//   private stable var UserStakes : [(Principal, Stake)] = [];

//   private var UserHashMap = HashMap.fromIter<Principal, Stake>(
//     Iter.fromArray(UserStakes),
//     Iter.size(Iter.fromArray(UserStakes)),
//     Principal.equal,
//     Principal.hash,
//   );

//   //stake the tokens

//   public shared ({ caller }) func stake_tokens(_amount : Nat ) : async Result.Result<(), Text> {
//     let transferResults = await _transfer_funds_from(caller, _amount);

//     if (transferResults) {
//       UserHashMap.put(
//         caller,
//         {
//           amount = _amount;
//           startTime = Time.now();
//           isStaked = true;
//         },
//       );
//       return #ok();
//     } else {
//       return #err("transfer of tokens has failed");
//     };
//   };

//   //unstake the rewards

//   public shared ({ caller }) func unstake_tokens() : async Result.Result<(), Text> {

//     switch (UserHashMap.get(caller)) {
//       case (null) { #err("no user found") };
//       case (?user) {

//         //calculate the rewards of the user
//         let rewards = await calculate_rewards(user.amount, user.startTime);
//         //get the balance of the backend canister
//         let balance = await ICRCLedger.icrc1_balance_of({
//           owner = Principal.fromActor(this);
//           subaccount = null;
//         });
//         Debug.print("balance of the backend" # debug_show(balance));
//         let tokenFee = 10000;
//        Debug.print("total rewards" # debug_show(rewards) # debug_show(user.amount) #debug_show(tokenFee));

//           // assert(rewards >= 10000);
//         //make sure there is enough tokens to send to the user
//         // assert (balance > (rewards + user.amount + tokenFee));
//         if(rewards < tokenFee){
//           return #err("You have less rewards that can not be claimed")
//         }else if(balance < (rewards + user.amount + tokenFee)){
//           return #err("smart contract does not have the funds")
//         };

//         //transnfer the rewards to the user account
//         let rewardTransfer = await _transfer_funds_from_canister(caller, rewards);

//         //transfer the  principal amount back to the user
//         let principalTrasfer = await _transfer_funds_from_canister(caller, user.amount);

//         if (rewardTransfer and principalTrasfer) {
//           UserHashMap.delete(caller);
//           return #ok();
//         } else {
//           return #err("err");
//         };
//       };
//     };

//   };

//   //calculate the rewards of the user
//   private func calculate_rewards(_amount : Nat, _startTime : Int) : async Nat {
//     //total seconds that have elapsed since staking began
//     let totalSeconds = Time.now() - _startTime;
//     let rewards = _amount * yearlyAPI * (totalSeconds / totalYearlyTime);
//     Debug.print("total rewards " # debug_show(rewards/100000000));
//     return Int.abs(rewards/100000000);
//   };

//   //claim the rewards from the contract
//   public shared ({ caller }) func claim_rewards() : async Result.Result<(), Text> {
//     switch (UserHashMap.get(caller)) {

//       case (null) { return #err("user does not exist") };
//       case (?user) {

//         assert (user.isStaked);
//         //get the rewards of the user
//         let rewards = await calculate_rewards(user.amount, user.startTime);
//         //transfer the rewards to the user
//         let results = await _transfer_funds_from_canister(caller, rewards);
//         if (results) {
//           UserHashMap.put(caller, { user with startTime = Time.now() });
//           return #ok();
//         } else {
//           return #err("cant claim rewards");
//         };
//       };
//     };
//   };

//   //get the user's stake data
//   public  func get_user_stake(user : Principal) : async Result.Result<{amount:Nat;totalRewards:Nat;isStaked:Bool}, Text> {
//     switch (UserHashMap.get(user)) {
//       case (null) { return #err(" no user found") };
//       case (?data) { 

//         let results = await calculate_rewards(data.amount, data.startTime);
//         return #ok({
//           amount=data.amount;
//           totalRewards=results;
//           isStaked = data.isStaked;
//         }) };
//     };
//   };

//   //transfer funds from the smart contract to the  user
//   private func _transfer_funds_from_canister(to : Principal, _amount : Nat) : async Bool {
//     let transferResults = await ICRCLedger.icrc1_transfer({
//       to = {
//         owner = to;
//         subaccount = null;
//       };
//       amount = _amount;
//       fee = null;
//       memo = null;
//       from_subaccount = null;
//       created_at_time = null;
//     });
//     switch (transferResults) {
//       case (#Ok(value)) { true };
//       case (#Err(error)) { false };
//     };

//   };

//   //helper function to to the transfer_from
//   private func _transfer_funds_from(from : Principal, _amount : Nat) : async Bool {
//     let transferResults = await ICRCLedger.icrc2_transfer_from({
//       spender_subaccount = null;
//       from = {
//         owner = from;
//         subaccount = null;
//       };
//       to = {
//         owner = Principal.fromActor(this);
//         subaccount = null;
//       };
//       amount = _amount;
//       fee = null;
//       memo = null;
//       created_at_time = null;
//     });

//     switch (transferResults) {
//       case (#Ok(value)) { true };
//       case (#Err(error)) { false };
//     };

//   };

// };



// // dfx canister call icrc1_ledger_canister icrc1_transfer "(record { to = record { owner = principal \"be2us-64aaa-aaaaa-qaabq-cai\";};  amount = 1100_000;})"


