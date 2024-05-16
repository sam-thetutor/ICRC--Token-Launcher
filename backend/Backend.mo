import ICRCTokenClass "./icrctoken";
import Principal "mo:base/Principal";
import Cycles "mo:base/ExperimentalCycles";
import Iter "mo:base/Iter";
import HashMap "mo:base/HashMap";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import ICRCLedger "canister:icp_ledger_canister";


actor class TokenLauncher()=this{

  private stable var UsersArray : [(Principal, [Principal])] = [];
  private var UsersHashMap = HashMap.fromIter<Principal, [Principal]>(
    Iter.fromArray(UsersArray),
    Iter.size(Iter.fromArray(UsersArray)),
    Principal.equal,
    Principal.hash,
  );

  system func preupgrade() {
    UsersArray := Iter.toArray(UsersHashMap.entries());
  };
  system func postupgrade() {
    UsersArray := [];
  };
  public type Subaccount = Blob;

  public type Account = { owner : Principal; subaccount : ?Subaccount };

  public type Tokens = Nat;
type Timestamp = Nat64;
type BlockIndex = Nat;


  type TransferFromError =  {
    #BadFee :  { expected_fee : Tokens };
    #BadBurn :  { min_burn_amount : Tokens };
    #InsufficientFunds :  { balance : Tokens };
    #InsufficientAllowance :  { allowance : Tokens };
    #TooOld;
    #CreatedInFuture :  { ledger_time : Timestamp };
    #Duplicate :  { duplicate_of : BlockIndex };
    #TemporarilyUnavailable;
    #GenericError :  { error_code : Nat; message : Text };
};

  let newTokenCreationFee = 500000000;
  //create a new token
  public shared ({ caller }) func createNewToken(_name : Text, _symbol : Text, _fee : Nat,_logo:Text, initialMints : [{ account : Account; amount : Tokens }]) : async Result.Result<Text, TransferFromError> {

    let transferResults = await ICRCLedger.icrc2_transfer_from({
      spender_subaccount = null;
      from = {
        owner = caller;
        subaccount = null;
      };
      to = {
        owner = Principal.fromActor(this);
        subaccount = null;
      };
      amount = newTokenCreationFee;
      fee = null;
      memo = null;
      created_at_time = null;
    });

    switch (transferResults) {
      case (#Ok(value)) {

        Cycles.add(1000000000000);
        let newTokenActor = await ICRCTokenClass.Ledger({
          initial_mints = initialMints;
          minting_account = {
            owner = Principal.fromActor(this);
            subaccount = null;
          };
          token_logo=_logo;
          token_name = _name;
          token_symbol = _symbol;
          decimals = 8;
          transfer_fee = _fee;
        });

        let rawPrincipal = Principal.fromActor(newTokenActor);

        switch (UsersHashMap.get(caller)) {
          case (null) {
            UsersHashMap.put(caller, [rawPrincipal]);
            return #ok(Principal.toText(rawPrincipal));
          };
          case (?data) {
            let buff = Buffer.fromArray<Principal>(data);
             buff.add(rawPrincipal);
            UsersHashMap.put(caller, Buffer.toArray<Principal>(buff));
            return #ok(Principal.toText(rawPrincipal));
          };
        };


      };
      case (#Err(error)) {
        return #err(error);
      };


    };
  };

  //get all the tokens for the user
  public query func get_all_tokens_for_user(user : Principal) : async ?[Principal] {
    return UsersHashMap.get(user);
  };

};



//  dfx canister call icrc1_ledger_canister icrc1_transfer "(record { to = record { owner = principal \"2vxsx-fae\";};  amount = 5500_000000;})"


