var getFbProfile = function(accessToken,options,user) {
  var userId = user._id;
  console.log("Make async call to grab the picture from Facebook.");
  Meteor.http.get("https://graph.facebook.com/me", {
    params: {
      access_token: accessToken,
      fields: 'picture, birthday, location' }
    }, function(error,result) {
      if(error) throw error;
      else {
        Meteor.users.update({_id: userId}, {$set: {'profile.birthday': result.data.birthday,
                                                   'profile.location.name': result.data.location.name }});
        downloadFbPicture(userId,result.data.id,accessToken);
        if(result.data.location.name) {
          //we also need to get coordinates from Google Maps
          Meteor.call('geoCode', result.data.location.name,
            function(err, res) {
              if(err) throw error;
              if(res.error_message) console.error(res);
              var data = res.data.results;
              if(data[0]) {
                var geometry = data[0].geometry;
                // Meteor.users.update({_id: userId}, {$set: {'profile.location.geocode.lat': geometry.location.lat}});
                // Meteor.users.update({_id: userId}, {$set: {'profile.location.geocode.lng': geometry.location.lng}});
                // Meteor.users.update({_id: userId}, {$set: {'profile.location.formatted_address': data[0].formatted_address}});
                // Meteor.users.update({_id: userId}, {$set: {'profile.location.location_type': geometry.location_type}});
                Meteor.users.update({_id: userId}, {$set: {"profile.location.type": "Feature",
                                                           "profile.location.geometry": {
                                                             "type": "Point",
                                                             "coordinates": [geometry.location.lng, geometry.location.lat]
                                                            },
                                                           "profile.location.properties": {
                                                             "name": data[0].formatted_address,
                                                             "location_type": geometry.location_type
                                                            }
                                                          }
                                                    }
                );
              }
          });
        }
      }
    }
  );
};

var downloadFbPicture = function(userId, fbUserId, accessToken) {
  var width = 960;
  var newFile = new FS.File();
  var pictureUrl = 'https://graph.facebook.com/me/picture?width=' + width +
    '&access_token=' + accessToken;
  newFile.attachData(pictureUrl, function (error) {
    if (error) throw error;
    newFile.userId = userId;
    newFile.mainPicture = true;
    Images.insert(newFile, function (error, fileObj) {
      if(error) throw error;
    });
  });
};

// during new account creation get user picture from Facebook and save it on user object
Accounts.onCreateUser(function(options, user) {
  if(options.profile) {
    console.log("Get users's facebook profile details.");
    var fbAccessToken = user.services.facebook.accessToken;
    //var fbResp = getFbProfile(user.services.facebook.accessToken);
    getFbProfile(fbAccessToken,options,user);
    console.log("User created");
    return user;
  } else {
    throw error;
  }
});
