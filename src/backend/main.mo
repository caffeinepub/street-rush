import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type ScoreEntry = {
    playerName : Text;
    score : Nat;
    timestamp : Time.Time;
  };

  module ScoreEntry {
    public func compare(a : ScoreEntry, b : ScoreEntry) : Order.Order {
      Nat.compare(a.score, b.score);
    };
  };

  var nextId = 0;
  let scoresMap = Map.empty<Nat, ScoreEntry>();

  public shared ({ caller }) func submitScore(playerName : Text, score : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit scores");
    };

    if (playerName.isEmpty()) {
      Runtime.trap("Player name cannot be empty");
    };
    if (score == 0) {
      Runtime.trap("Score must be greater than 0");
    };

    let entry : ScoreEntry = {
      playerName;
      score;
      timestamp = Time.now();
    };

    scoresMap.add(nextId, entry);
    nextId += 1;

    trimToTopEntries();
  };

  public query ({ caller }) func getLeaderboard() : async [ScoreEntry] {
    let entries = scoresMap.values().toArray().reverse();
    entries.sort();
  };

  func trimToTopEntries() {
    if (scoresMap.size() <= 20) {
      return;
    };

    let entriesArray = scoresMap.toArray();
    let sortedEntriesArray = entriesArray.sort(
      func(a, b) {
        Nat.compare(b.1.score, a.1.score);
      }
    );

    let topEntries = sortedEntriesArray.sliceToArray(0, 20);

    scoresMap.clear();

    for ((id, entry) in topEntries.values()) {
      scoresMap.add(id, entry);
    };
  };
};
