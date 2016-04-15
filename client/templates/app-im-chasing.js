Template.imChasing.onCreated(function(){
  var self = this;
  self.autorun(function() {
    self.subscribe("imchasing", Meteor.userId());
  });
});

Template.imChasing.helpers({
  chases: function () {
    // return Chases.find({chasers: { $elemMatch: {chaser: Meteor.userId()}}});
    return Chasesearch.find({chasers: { $elemMatch: {chaser: Meteor.userId()}}}, {sort: { "calculatedDistance": 1 }});
  }
});
