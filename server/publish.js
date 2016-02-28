Meteor.publish("categories", function () {
  return Categories.find({});
});

Meteor.publish("chases", function () {
  return Chases.find({});
});

Meteor.publish("profile", function ( profileId ) {
  check(profileId, String);
  return Meteor.users.find(profileId, { fields: { accessToken: 0, hashedToken: 0 }});
});

Meteor.publish("pictures", function( userId ) {
  check(userId, String);
  return Images.find({"userId": userId}, { sort : {mainPicture: -1}});
});

// Meteor.publish("profileAndPictures", function (profileId) {
//     check(profileId, String);
//     return [
//       Meteor.users.find({"_id": profileId}, { fields: { _id: 1, services: 1, profile: 1 }}),
//       Images.find({"userId": profileId}, { sort : {mainPicture: -1}})
//     ];
// });
