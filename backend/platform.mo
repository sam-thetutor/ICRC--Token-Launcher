import Fuzz "mo:fuzz";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Bool "mo:base/Bool";
import Types "Types";

shared ({ caller = initializer }) actor class Hackfinity() = this {
  //init the fuzz package to generate ids
  //2vxsx-fae
  let fuzz = Fuzz.Fuzz();

  private stable var participantsArray : [(Principal, Types.ParticipantAccount)] = [];
  private stable var organisersArray : [(Principal, Types.OrganizerAccount)] = [];
  private stable var hackathonArray : [(Text, Types.NewHackathon)] = [];
  private stable var submissionsArray : [(Text, List.List<Types.HackathonSubmission>)] = [];
  private stable var adminArray : [Principal] = [];
  private stable var categoryArray : [Text] = [];

  private var participantStore = HashMap.fromIter<Principal, Types.ParticipantAccount>(
    Iter.fromArray(participantsArray),
    Iter.size(Iter.fromArray(participantsArray)),
    Principal.equal,
    Principal.hash,
  );

  private var organizerStore = HashMap.fromIter<Principal, Types.OrganizerAccount>(
    Iter.fromArray(organisersArray),
    Iter.size(Iter.fromArray(organisersArray)),
    Principal.equal,
    Principal.hash,
  );
  private var hackathonStore = HashMap.fromIter<Text, Types.NewHackathon>(
    Iter.fromArray(hackathonArray),
    Iter.size(Iter.fromArray(hackathonArray)),
    Text.equal,
    Text.hash,
  );

  private var submissionStore = HashMap.fromIter<Text, List.List<Types.HackathonSubmission>>(
    Iter.fromArray(submissionsArray),
    Iter.size(Iter.fromArray(submissionsArray)),
    Text.equal,
    Text.hash,
  );

  private var adminBuffer = Buffer.fromIter<Principal>(adminArray.vals());
  private var categoryBuffer = Buffer.fromIter<Text>(categoryArray.vals());

  system func preupgrade() : () {
    participantsArray := Iter.toArray<(Principal, Types.ParticipantAccount)>(participantStore.entries());
    organisersArray := Iter.toArray<(Principal, Types.OrganizerAccount)>(organizerStore.entries());
    hackathonArray := Iter.toArray<(Text, Types.NewHackathon)>(hackathonStore.entries());
    submissionsArray := Iter.toArray<(Text, List.List<Types.HackathonSubmission>)>(submissionStore.entries());
    adminArray := Iter.toArray<Principal>(adminArray.vals());
    categoryArray := Iter.toArray<Text>(categoryArray.vals());
  };

  system func postupgrade() : () {
    participantsArray := [];
    organisersArray := [];
    hackathonArray := [];
    submissionsArray := [];
    adminArray := [];
    categoryArray := [];
  };

  //add new admin
  public shared ({ caller }) func add_category(_cat : Text) : async Types.Response<Text> {

    if (Buffer.contains<Principal>(adminBuffer, caller, Principal.equal) or caller == initializer) {
      categoryBuffer.add(_cat);
      return {
        status = 201;
        status_text = "OK";
        data = null;
        error_text = null;
      };

    } else {

      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"not authorized";
      };
    };

  };

  //delete an admin
  public shared ({ caller }) func delete_category(_cat : Text) : async Types.Response<Text> {
    if (Buffer.contains<Principal>(adminBuffer, caller, Principal.equal) or caller == initializer) {
      categoryBuffer.filterEntries(func(_, category) = category != _cat);
      return {
        status = 201;
        status_text = "OK";
        data = null;
        error_text = null;

      };

    } else {

      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"not authorized";

      };

    };

  };

  //get all categories

  public query func get_all_categories() : async Types.Response<[Text]> {
    let categories = Buffer.toArray<Text>(categoryBuffer);
    return {
      status = 200;
      status_text = "OK";
      data = ?categories;
      error_text = ?"not authorized";
    };
  };

  //add new admin
  public shared ({ caller }) func add_admin(_admin : Principal) : async Types.Response<Text> {

    if (Buffer.contains<Principal>(adminBuffer, caller, Principal.equal) or caller == initializer) {
      adminBuffer.add(_admin);
      return {
        status = 201;
        status_text = "OK";
        data = null;
        error_text = null;
      };

    } else {

      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"not authorized";
      };
    };

  };

  //delete an admin
  public shared ({ caller }) func delete_admin(_admin : Principal) : async Types.Response<Text> {

    if (Buffer.contains<Principal>(adminBuffer, caller, Principal.equal) or caller == initializer) {

      adminBuffer.filterEntries(func(_, admin) = admin != _admin);
      return {
        status = 201;
        status_text = "OK";
        data = null;
        error_text = null;

      };

    } else {

      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"not authorized";

      };

    };

  };

  //get all admins
  public query func get_all_admins() : async Types.Response<[Principal]> {
    let data = Buffer.toArray<Principal>(adminBuffer);
    return {
      status = 200;
      status_text = "OK";
      data = ?data;
      error_text = null;
    };
  };

  //create an organizer account
  public shared ({ caller }) func create_organizer_account(data : Types.OrganizerAccount) : async Types.Response<Text>
  // {
  //   status : Nat;
  //   data : Text;
  //   message : Text;
  // }
  {

    switch (organizerStore.get(caller)) {
      case (null) {
        organizerStore.put(caller, data);
        return {
          status = 201;
          status_text = "OK";
          data = null;
          error_text = null;
        };

      };
      case (data) {
        return {
          status = 400;
          status_text = "OK";
          data = null;
          error_text = ?"organizer already exists";
        };
      };
    };
  };

  //create hackathon
  public shared ({ caller }) func create_new_hackathon(data : Types.NewHackathonPayload) : async Types.Response<Text> {

    let rank = await isOrganizer(caller);

    if (not rank) {
      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"you are not an organizer";
      };
    };

    let hackathonId = fuzz.text.randomAlphabetic(12);
    let newHack : Types.NewHackathon = {
      data with
      participants = [];
      owner = caller;
    };

    hackathonStore.put(hackathonId, newHack);
    return {
      status = 201;
      status_text = "OK";
      data = null;
      error_text = null;
    };

  };

  //get all hackathons
  public query func get_all_hackathons() : async Types.Response<[(Text, Types.NewHackathon)]> {
    return {

      status = 201;
      status_text = "OK";
      data = ?Iter.toArray<(Text, Types.NewHackathon)>(hackathonStore.entries());
      error_text = null;
    };

  };

  //delete a hackathon project
  public shared ({ caller }) func delete_hackathon(id : Text) : async Types.Response<Text> {

    let rank = await isOrganizer(caller);

    if (not rank) {
      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"you are not an organizer";

      };
    };
    hackathonStore.delete(id);
    return {
      status = 201;
      status_text = "OK";
      data = null;
      error_text = null;

    };

  };

  // view all my hackathons
  public func get_organizer_hackathons(caller:Principal) : async Types.Response<[(Text, Types.NewHackathon)]>

  {

    let rank = await isOrganizer(caller);
    if (not rank) {
      return {
        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"you are not an organizer";
      };
    };

    let allHackathons = Iter.toArray<(Text, Types.NewHackathon)>(hackathonStore.entries());
    let sortedArray = Array.filter<(Text, Types.NewHackathon)>(allHackathons, func(id, hack) = hack.owner == caller);
    { status = 200; status_text = "OK"; data = ?sortedArray; error_text = null };

  };

  //register for the hackathon

  public shared ({ caller }) func register_for_hackathon(hackathonId : Text) : async Types.Response<Text> {

    switch (hackathonStore.get(hackathonId)) {
      case (?hackathon) {
        var parts = Buffer.fromArray<Text>(hackathon.participants);
        parts.add(Principal.toText(caller));
        ignore hackathonStore.replace(hackathonId, { hackathon with participants = Buffer.toArray<Text>(parts) });
        { status = 201; status_text = "OK"; data = null; error_text = null };
      };
      case (null) {
        {
          status = 404;
          status_text = "OK";
          data = null;
          error_text = ?"hackathon with id  not found";
        };
      };
    };
  };

  //get the participants's submission for a specific hackathon

  public func get_participant_hack_submission(hackathonId : Text, caller : Principal) : async Types.Response<Types.HackathonSubmission> {

    switch (submissionStore.get(hackathonId)) {
      case (?submissions) {

        let userSub = List.filter<Types.HackathonSubmission>(submissions, func hack { hack.owner == caller });
        let array = List.toArray<Types.HackathonSubmission>(userSub);
        {
          status = 200;
          status_text = "OK";
          data = ?array[0];
          error_text = null;
        };
      };
      case (null) {
        {
          status = 404;
          status_text = "OK";
          data = null;
          error_text = ?"hackathon with id  not found";
        };
      };
    };

  };

  //get user Profile
  public query func get_user_profile(_user : Principal) : async Types.Response<{ rank : Text; profile : Types.UserProfileResponse }> {

    switch (participantStore.get(_user)) {
      case (?user) {
        return {

          status = 200;
          status_text = "OK";
          error_text = null;
          data = ?{
            rank = "participant";
            profile = #participant(user);

          };
        };

      };
      case (null) {
        switch (organizerStore.get(_user)) {
          case (?org) {
            return {

              status = 200;
              status_text = "OK";
              error_text = null;
              data = ?{
                rank = "organizer";
                profile = #organizer(org);

              };

            };
          };

          case (null) {
            if (Buffer.contains<Principal>(adminBuffer, _user, Principal.equal)) {
              return {

                status = 200;
                status_text = "OK";
                error_text = null;
                data = ?{
                  rank = "admin";
                  profile = #none "not found";

                };

              };

            } else {
              return {
                status = 200;
                status_text = "OK";
                error_text = null;
                data = ?{
                  rank = "none";
                  profile = #none "not found";

                };
              };
            };
          };
        };
      };
    };
  };

  //get all participants
  public query func get_all_participants() : async Types.Response<[(Principal, Types.ParticipantAccount)]>
  // {
  //   status : Nat;
  //   data : [(Principal, Types.ParticipantAccount)];
  // }

  {
    let data = Iter.toArray<(Principal, Types.ParticipantAccount)>(participantStore.entries());
    return {

      status = 200;
      status_text = "OK";
      data = ?data;
      error_text = null;

    };
  };

  //get all organizers
  public query func get_all_organizers() : async Types.Response<[(Principal, Types.OrganizerAccount)]> {
    let data = Iter.toArray<(Principal, Types.OrganizerAccount)>(organizerStore.entries());
    return {
      status = 200;
      status_text = "OK";
      data = ?data;
      error_text = null;
    };
  };

  //add new submission
  public shared ({ caller }) func add_submission(hackathonId : Text, newSub : Types.HackathonSubmissionPayload) : async Types.Response<Types.HackathonSubmission> {

    let rank = await isParticipant(caller);
    if (not rank) {
      return {

        status = 404;
        status_text = "OK";
        data = null;
        error_text = ?"Unauthorized. You are not a participant";
      };
    };

    switch (hackathonStore.get(hackathonId)) {
      case (null) {
        return {

          status = 404;
          status_text = "OK";
          data = null;
          error_text = ?"hackathon with id does not exist";

        };

      };
      case (?hackathon) {

        let hackId = fuzz.text.randomAlphabetic(12);

        if (Buffer.contains<Text>(Buffer.fromArray<Text>(hackathon.participants), Principal.toText(caller), Text.equal)) {
          switch (submissionStore.get(hackathonId)) {
            case (null) {
              var tempData = List.nil<Types.HackathonSubmission>();

              tempData := List.push({ newSub with owner = caller; score = 0; id = hackId }, tempData);
              submissionStore.put(hackathonId, tempData);
              return {

                status = 201;
                status_text = "OK";
                data = ?{ newSub with owner = caller; score = 0; id = hackId };
                error_text = null;

              };
            };
            case (?data) {
              var tempData = data;

              if (List.some<Types.HackathonSubmission>((data), func hack { hack.owner == caller })) {
                return {
                  status = 404;
                  status_text = "OK";
                  data = null;
                  error_text = ?"you have already submitted for this hackathon";
                };

              } else {
                tempData := List.push({ newSub with owner = caller; score = 0; id = hackId }, tempData);
                submissionStore.put(hackathonId, tempData);
                return {
                  status = 201;
                  status_text = "OK";
                  data = ?{ newSub with owner = caller; score = 0; id = hackId };
                  error_text = null;
                };
              };
            };
          };

        } else {
          return {
            status = 404;
            status_text = "OK";
            data = null;
            error_text = ?"you are not registered for the hackathon";
          };
        };
      };
    };
  };

  //give score to the submission of a specific hackathon.
  //You must be the onwer of that hackathon
  public shared ({ caller }) func rank_hackathon_submission(hackathonId : Text, subID : Text, _score : Nat) : async Types.Response<Text> {
    switch (hackathonStore.get(hackathonId)) {
      case (?hackathon) {
        if (hackathon.owner == caller) {
          switch (submissionStore.get(hackathonId)) {
            case (?subs) {

              switch (List.find<Types.HackathonSubmission>(subs, func sub { sub.id == subID })) {
                case (?data) {
                  var tempData = data;
                  tempData := { data with score = _score };
                  var tempList = List.filter<Types.HackathonSubmission>(subs, func hack { hack.owner != caller });
                  tempList := List.push(tempData, tempList);
                  ignore submissionStore.replace(hackathonId, tempList);
                  return {
                    status = 201;
                    status_text = "OK";
                    data = null;
                    error_text = null;
                  };
                };
                case (null) {

                  return {
                    status = 404;
                    status_text = "OK";
                    data = null;
                    error_text = ?"submission with id does not exist";
                  };
                };
              };
            };
            case (null) {
              return {
                status = 404;
                status_text = "OK";
                data = null;
                error_text = ?"hackathon does not have any submissions";
              };

            };
          };

        } else {
          return {
            status = 404;
            status_text = "OK";
            data = null;
            error_text = ?"you are not authorized";
          };
        };
      };
      case (null) {
        return {
          status = 404;
          status_text = "OK";
          data = null;
          error_text = ?"hackathon with id not found";
        };
      };
    };

  };

  //delete submission
  public shared ({ caller }) func delete_submission(hackathonId : Text) : async Types.Response<Text> {

    switch (submissionStore.get(hackathonId)) {
      case (?hackathons) {
        var tempData = hackathons;

        tempData := List.filter<Types.HackathonSubmission>(hackathons, func hack { hack.owner != caller });
        ignore submissionStore.replace(hackathonId, tempData);
        return {

          status = 201;
          status_text = "OK";
          data = null;
          error_text = null;

        };
      };
      case (null) {
        return {
          status = 404;
          status_text = "OK";
          data = null;
          error_text = ?"hackathon with id has no submissions";
        };

      };
    };

  };

  //get al hackathons that the user has participated in

  public query func get_participant_hackathons(_user : Principal) : async Types.Response<[(Text, Types.NewHackathon)]>

  {
    let allHackathons = Iter.toArray<(Text, Types.NewHackathon)>(hackathonStore.entries());
    let hackBuffer = Buffer.fromArray<(Text, Types.NewHackathon)>(allHackathons);
    hackBuffer.filterEntries(func(id, (_, hack)) = Buffer.contains<Text>(Buffer.fromArray<Text>(hack.participants), Principal.toText(_user), Text.equal));
    return {

      status = 200;
      status_text = "OK";
      data = ?Buffer.toArray<(Text, Types.NewHackathon)>(hackBuffer);
      error_text = null;
    };
  };

  //get all submissions for a specific hackathon
  public query func get_hackathon_submissions(hackathonId : Text) : async Types.Response<[Types.HackathonSubmission]>

  {

    switch (submissionStore.get(hackathonId)) {
      case (?submissions) {
        return {

          status = 200;
          status_text = "OK";
          data = ?List.toArray<Types.HackathonSubmission>(submissions);
          error_text = null;
        };

      };
      case (null) {
        return {
          status = 200;
          status_text = "OK";
          data = ?[];
          error_text = null;
        };
      };
    };

  };

  // //participant create new account
  public shared ({ caller }) func create_participant_profile(data : Types.ParticipantAccount) : async Types.Response<Text> {

    switch (participantStore.get(caller)) {
      case (null) {

        participantStore.put(caller, data);
        return {

          status = 201;
          status_text = "OK";
          data = null;
          error_text = null;
        };

      };
      case (data) {
        return {
          status = 404;
          status_text = "OK";
          data = null;
          error_text = ?"user already present";
        };

      };
    };

  };

  //check is participant
  public func isParticipant(user : Principal) : async Bool {
    switch (participantStore.get(user)) {
      case (?user) { true };
      case (null) { false };
    };

  };

  //check is organizer
  public func isOrganizer(user : Principal) : async Bool {
    switch (organizerStore.get(user)) {
      case (?user) { true };
      case (null) { false };
    };

  };


};
