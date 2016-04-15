var SERVER_KEY = "AIzaSyBmHROMY7HZmLI4BBHc273zbapbmYBpDwI";
var FIRST_ROUND_LENGTH = 12;

Meteor.methods({
    'createChase': function(chaseTitle, chaseRounds) {
      var currentUser = Meteor.userId();
      if(!currentUser)
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      if(chaseTitle == '')
        chaseTitle = currentUser;
      if(chaseRounds.length != 4)
        throw new Meteor.Error("invalid-rounds", "Invalid number of rounds.");
      //Get questions for each rounds
      var rounds = getQuestions(chaseRounds);
      var emptyArray = new Array();
      return Chases.insert({
        owner: currentUser,
        ownerName: Meteor.user().services.facebook.first_name,
        genderPreference: Meteor.user().profile.gender_preference,
        ownerLocation: Meteor.user().profile.location.geometry,
        title: chaseTitle,
        createdAt: new Date(),
        status: 'new',
        rounds: rounds,
        activeRound: 0,
        chasers: emptyArray
      });
    },
    'geoCode': function(location) {
      check(location, String);
      console.log("geoCode");
      console.log(location);
      location = location.replace(/ /g,"%20");
      this.unblock();
      try {
        var result = HTTP.call("GET", "https://maps.googleapis.com/maps/api/geocode/json",
          {params: { address: location, key: SERVER_KEY }});
        console.log(result);
        return result;
      } catch (e) {
        console.error('Http error: ' + e);
        return false;
      }
    },
    'getFbPhotos': function() {
      if(!this.userId) {
        console.error('Not allowed. User is not logged in.');
        throw error;
      }
      var accessToken = Meteor.user().services.facebook.accessToken;
      this.unblock();
      try {
        var result = Meteor.http.get("https://graph.facebook.com/me/photos?fields=images&width=960", {
          params: { access_token: accessToken }});
          console.log(result.data);
        return result.data;
      } catch (e) {
        console.error('Http error: ' + e);
        return false;
      }
    },
    'getSelectedFbPhotos': function(photos) {
      if(!this.userId) {
        console.error('Not allowed. User is not logged in.');
        throw error;
      }
      var userId = this.userId;
      if(photos) {
        for(var pic in photos) {
          var newFile = new FS.File();
          newFile.attachData(photos[pic], function (error) {
            if (error) throw error;
            newFile.userId = userId;
            Images.insert(newFile, function (error, fileObj) {
              if(error) throw error;
            });
          });
        }
      }
    },
    'getMoreFbPhotos': function(url) {
      check(url, String);
      this.unblock();
      try {
        var result = HTTP.call("GET", url);
        return result;
      } catch (e) {
        console.error('Http error: ' + e);
        return false;
      }
    },
    'answerRound': function(chaseId, round, answers) {
      check(chaseId, String);
      check(round, String);
      check(answers, Object);
      this.unblock();
      console.log("answerRound");
      console.log(chaseId);
      console.log(round);
      console.log(answers);
      var userId = this.userId;
      if(!userId) {
        console.error('Not allowed. User is not logged in.');
        throw error;
      }
      var chase = Chases.findOne({_id: chaseId});
      var roundObj = {};
      var owner_answered_all = true;
      //We iterate through the rounds and find the actual round. We add the
      //owner answers and will use this object during the database update.
      chase.rounds.forEach(function(rnd) {
        if(!rnd.owner_answer && rnd.subCatId != round)
          owner_answered_all = false;
        if(rnd.subCatId == round) {
          roundObj = rnd;
          roundObj["owner_answer"] = answers;
          // console.log(roundObj);
        }
      })
      //check if this is a chaser or chase owner
      if(chase.owner == Meteor.userId() && roundObj) {
        console.log("Updating chase with answers");
        Chases.update({"_id": chaseId, "rounds.subCatId": round},
                      {$set: { "rounds.$" : roundObj,
                               "owner_answered_all": owner_answered_all }},
                      function(error, result) {
                        if(error)
                          throw error;
                        else {
                          return true;
                        }
                      },
                      false,
                      false);
      }
      //check if it's a chaser
    },
    'startChase': function(chase_id) {
      check(chase_id, String);
      if(!Meteor.userId())
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      var chase = Chases.findOne({"_id": chase_id});
      if(Meteor.userId() != chase.owner)
        throw new Meteor.error("not-allowed", "Permission denied.");
      if(chase["status"] != "new")
        throw new Meteor.error("cannot-start-chase", "Cannot start the chase.");
      console.log(chase.rounds[0].subCatId);
      if(!chase.owner_answered_all)
        throw new Meteor.error("owner-not-answered", "Owner hasn't answered.");
      var dateObj = new Date(new Date().getTime() + FIRST_ROUND_LENGTH*60*60000);
      Chases.update({"_id": chase_id},
                    {$set: { "status" : "started",
                             "activeRound": chase.rounds[0].subCatId,
                             "endingAt": dateObj }},
                    function(error, result) {
                      if(error)
                        throw error;
                      else {
                        return true;
                      }
                    },
                    false,
                    false);
    },
    'setGenderPreference': function(gender) {
      check(gender, String);
      if(!Meteor.userId())
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      console.log(gender);
      if(gender == 'male' || gender == 'female') {
        Meteor.users.update({"_id": Meteor.userId()},
                     {$set: {"profile.gender_preference": gender}},
                     function(error, result) {
                       if(error) throw error;
                     });
        Chases.update(
          {"owner": Meteor.userId()},
          {$set: {"genderPreference": gender}},
          function(error, result) {
            if (error) throw error;
          });
        return true;
      }
    },
    'userDetails': function(userId) {
      check(userId, String);
      return Meteor.users.findOne({_id: userId},
                                  {fields: {
                                    "services.facebook.first_name": 1,
                                    "profile.birthday": 1,
                                    "services.facebook.gender": 1,
                                    "profile.location.name": 1
                                  }});
    },
    'joinChase': function(chaseId, chaserId) {
      check(chaseId, String);
      check(chaserId, String);
      //What happens if chaser has already joined?
      Chases.update({"_id": chaseId},
                    {$push: { chasers: {
                      chaser: chaserId,
                      chaserStatus: "active"
                    }}},
                    function(error, result) {
                      if(error)
                        throw error;
                      else {
                      }
                    },
                    false,
                    false);
      Meteor.users.update({"_id": chaserId},
        {$push: {chasing: {chaseId}}},
        function(error, result) {
          if(error)
            throw error;
          else {
          }
        },
        false,
        false);
      return true;
    },
    'chartData': function(chaseId, round) {
      console.log("Entering chartData...");
      check(chaseId, String);
      check(round, String);
      chartData = [];
      chase = Chases.findOne({"_id": chaseId});
      roundIndex = chase.rounds.findIndex(function(ele, ind, arr) {
        if(ele.subCatId == round)
          return true;
      });
      console.log("roundIndex: " + roundIndex);
      if(roundIndex == -1)
        return false;
      isChaser = false;
      if(chase.owner == Meteor.userId()) {

        //if this is the owner, then retrieve all info

      } else {
        //otherwise check if the user is a chaser
        chase.chasers.forEach(function(ele, ind, arr) {
          if(ele.chaser == Meteor.userId() && ele.chaserStatus == "active") {
            isChaser = true;
          }
        });
        if(isChaser) {
          //Add owner details with score
          ownerChartData = calculateOwnerScore(chase, roundIndex);
          ownerPicture = Images.findOne({"userId": chase.owner, "mainPicture": true});
          ownerChartData.image = "/cfs/files/images/" + ownerPicture._id;
          chartData.push(ownerChartData);
          //Add chaser details with score

          console.log("chartdata:");
          console.log(chartData);
          return chartData;
        } else {
          return false;
        }
      }
      // return Images.find({"userId": chase.owner, "mainPicture": true});
      //return Images.findOne({"userId": "rJjNfYPAHHocpSTj9"});
    }
});

//This function gets the rounds the user selected at case creation and
//finds and appends questions.
var getQuestions = function(chaseRounds) {
  console.log("getQuestions");
  var rounds = new Array();
  chaseRounds.forEach(function(round){
    var r = round;
    var questions = Questions.find({"sub_cat_id": round.subCatId},{limit: 5}).fetch();
    r.questions = new Array();
    r.questions = questions;
    rounds.push(r);
  });
  console.log("return:");
  console.log(rounds);
  return rounds;
};

var calculateOwnerScore = function(chaseObj, roundIndex) {
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

// var calculateScore = function(chaseObj, roundIndex) {
//   score = {};
//   chaserAnswers = chaseObj.rounds[roundIndex].chaser_answers;
//   //Looping through owner answers: { Question1Id: Answer1Id, ...}
//   userScore = 0;
//   for (var key in ownerAnswers) {
//     if (ownerAnswers.hasOwnProperty(key)) {
//       console.log(key + " -> " + ownerAnswers[key]);
//       //Looping through questions in specified round
//       questionWeight = 0;
//       chase.rounds[roundIndex].questions.forEach(function(ele, ind, arr) {
//         console.log("q: " + ele._id);
//         answerWeight = 0;
//         if(ele._id == key) {
//           questionWeight = ele.weight;
//           console.log("qweight: " + questionWeight);
//           //Finding index of answer the user has given under the question
//           answerIndex = ele.answers.findIndex(function(element, index, array) {
//             console.log("a: " + element.answer_id);
//             if(element.answer_id == ownerAnswers[key])
//               return true;
//           });
//           answerWeight = ele.answers[answerIndex].weight;
//           console.log("aweight: " + answerWeight);
//           userScore = userScore + questionWeight * answerWeight;
//         }
//       });
//     }
//   }
//   score = { "userId": chase.owner, "score": userScore };
//   return score;
// };
