Meteor.publish("categories", function () {
  return Categories.find({});
});

Meteor.publish("chases", function () {
  return Chases.find({});
});

Meteor.publish("chase", function(chaseId){
  check(chaseId, String);
  return Chases.find({_id: chaseId});
});

Meteor.publish("profile", function ( profileId ) {
  check(profileId, String);
  return Meteor.users.find(profileId, { fields: { accessToken: 0, hashedToken: 0 }});
});

Meteor.publish("pictures", function( userId ) {
  check(userId, String);
  return Images.find({"userId": userId}, { sort : {mainPicture: -1}});
});

Meteor.publish("thumbnail", function( userId ) {
  check(userId, String);
  return Images.find({"userId": userId, "mainPicture": true});
});

Meteor.publish("imchasing", function() {
  currentUserId = this.userId;

  if(!currentUserId)
    return this.ready();

  chases = {};
  usrAcc = Meteor.users.findOne({_id: currentUserId});
  db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
  pipeline = [{
    $geoNear: {
      near: usrAcc.profile.location.geometry.coordinates,
      distanceField: "calculatedDistance",
      spherical: true,
      limit: 100,
      distanceMultiplier: 3959.2,
      maxDistance: 0.075,
      query: {
        "chasers" : { $elemMatch: {chaser: currentUserId}} }
    }
  }];
  db.collection("chases").aggregate(
    pipeline,
    Meteor.bindEnvironment(
      function (err, result) {
        console.log('result', result);
        _.each(result, function (r) {
          chases[r._id] = r;
          subscription.added("chase-search", r._id, r);
        })
      }
    )
  );
  subscription.ready();
});

// Meteor.publish("chaseSearch", function(userId) {
//   check(userId, String);
//   self = this;
//   console.log(userId);
//   usrAcc = Meteor.users.findOne({_id: userId});
//   //console.log(usrAcc._id);
//   return Chases.aggregate([{
//     $geoNear: {
//       near: usrAcc.profile.location.geometry,
//       distanceField: "calculatedDistance",
//       spherical: true,
//       limit: 100,
//       distanceMultiplier: 3959.2,
//       maxDistance: 0.075
//     }
//   }]);
// });
Meteor.publish("chartdata", function(chaseId, round) {
  check(chaseId, String);
  check(round, String);
  currentUserId = this.userId;
  if(!currentUserId)
    return this.ready();

  console.log('chart-data');
  console.log(chaseId);
  console.log(round);
  subscription = this;
  chartData = [];
  isChaser = false;

  chase = Chases.findOne({"_id": chaseId});
  roundIndex = chase.rounds.findIndex(function(ele, ind, arr) {
    if(ele.subCatId == round)
      return true;
  });
  console.log("roundIndex: " + roundIndex);

  if(roundIndex == -1)
    subscription.ready();

  if(chase.owner == currentUserId) {

    //if this is the owner, then retrieve all info
    console.log("chase owner");

  } else {
    //otherwise check if the user is a chaser
    console.log("checking if chaser");
    chase.chasers.forEach(function(ele, ind, arr) {
      console.log('chaser id: ' + ele.chaser);
      console.log('my id: ' + currentUserId);
      if(ele.chaser == currentUserId && ele.chaserStatus == "active") {
        console.log('chaser found');
        isChaser = true;
      }
    });
    console.log("isChaser: " + isChaser);
    if(isChaser) {
      //Add owner details with score
      console.log("chaser...")
      ownerChartData = calculateOwnerScore(chase, roundIndex);
      ownerPicture = Images.findOne({"userId": chase.owner, "mainPicture": true});
      ownerChartData.image = "/cfs/files/images/" + ownerPicture._id;
      chartData.push(ownerChartData);
      //Add chaser details with score

      console.log("chartdata:");
      console.log(chartData);
      subscription.added("chartdata", Random.id(), ownerChartData);
    } else {
      subscription.ready();
    }
    subscription.ready();
  }
});

Meteor.publish("chaseSearch", function(userId) {
  check(userId, String);
  var subscription = this;
  //var initiated = false;
  var chases = {};
  var userId = this.userId;
  var usrAcc = Meteor.users.findOne({_id: userId});
  var db = MongoInternals.defaultRemoteCollectionDriver().mongo.db;
  console.log(usrAcc.profile.location.geometry.coordinates);
  var pipeline = [{
    $geoNear: {
      near: usrAcc.profile.location.geometry.coordinates,
      distanceField: "calculatedDistance",
      spherical: true,
      limit: 100,
      distanceMultiplier: 3959.2,
      maxDistance: 0.075,
      query: {
        "status": "started",
        "owner": {$ne: userId} },
    }
  }];
  db.collection("chases").aggregate(
    pipeline,
    Meteor.bindEnvironment(
      function (err, result) {
        console.log('result', result);
        _.each(result, function (r) {
          chases[r._id] = r;
          subscription.added("chase-search", r._id, r);
        })
      }
    )
  );
  subscription.ready();
});

var calculateOwnerScore = function(chaseObj, roundIndex) {
  console.log('calculateOwnerScore called');
  score = {};
  ownerAnswers = chaseObj.rounds[roundIndex].owner_answer;
  //Looping through owner answers: { Question1Id: Answer1Id, ...}
  userScore = 0;
  for (var key in ownerAnswers) {
    if (ownerAnswers.hasOwnProperty(key)) {
      console.log(key + " -> " + ownerAnswers[key]);
      //Looping through questions in specified round
      questionWeight = 0;
      chase.rounds[roundIndex].questions.forEach(function(ele, ind, arr) {
        console.log("q: " + ele._id);
        answerWeight = 0;
        if(ele._id == key) {
          questionWeight = ele.weight;
          console.log("qweight: " + questionWeight);
          //Finding index of answer the user has given under the question
          answerIndex = ele.answers.findIndex(function(element, index, array) {
            console.log("a: " + element.answer_id);
            if(element.answer_id == ownerAnswers[key])
              return true;
          });
          answerWeight = ele.answers[answerIndex].weight;
          console.log("aweight: " + answerWeight);
          userScore = userScore + questionWeight * answerWeight;
        }
      });
    }
  }
  score = { "userId": chase.owner, "score": userScore };
  return score;
};


// Meteor.publish("profileAndPictures", function (profileId) {
//     check(profileId, String);
//     return [
//       Meteor.users.find({"_id": profileId}, { fields: { _id: 1, services: 1, profile: 1 }}),
//       Images.find({"userId": profileId}, { sort : {mainPicture: -1}})
//     ];
// });
