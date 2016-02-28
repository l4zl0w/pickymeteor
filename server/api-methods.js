var SERVER_KEY = "AIzaSyBmHROMY7HZmLI4BBHc273zbapbmYBpDwI";

Meteor.methods({
    'createChase': function(chaseTitle, chaseRounds) {
      var currentUser = Meteor.userId();
      if(!currentUser)
        throw new Meteor.Error("not-logged-in", "You're not logged-in.");
      if(chaseTitle == '')
        chaseTitle = currentUser;
      if(chaseRounds.length != 4)
        throw new Meteor.Error("invalid-rounds", "Invalid number of rounds.");
      return Chases.insert({
        owner: currentUser,
        title: chaseTitle,
        createdAt: new Date(),
        status: 'new',
        rounds: chaseRounds,
        activeRound: 0
      });
    },
    'geoCode': function(location) {
      check(location, String);
      location = location.replace(/ /g,"%20");
      this.unblock();
      try {
        var result = HTTP.call("GET", "https://maps.googleapis.com/maps/api/geocode/json",
          {params: { address: location, key: SERVER_KEY }});
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
    }
});
