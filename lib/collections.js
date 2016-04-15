Questions = new Mongo.Collection('questions');

Categories = new Mongo.Collection('categories');

Chases = new Mongo.Collection('chases');

var imageStore = new FS.Store.FileSystem('images');
Images = new FS.Collection('images', {
 stores: [imageStore],
 filter: {
   allow: {
     contentTypes: ['image/*']
   }
 }
});

Images.allow({
  insert: function(userId) { return userId == Meteor.user()._id; },
  //update: function() { return true; },
  remove: function(userId, image) { return userId === image.userId; },
  download: function() { return true; }
});

if (Meteor.isClient) {
  Chasesearch = new Mongo.Collection("chase-search");

  ChartData = new Mongo.Collection("chartdata");
}
