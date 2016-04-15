Template.appChaseSearch.onCreated(function(){
  var self = this;
  self.autorun(function() {
    self.subscribe("chaseSearch", Meteor.userId());
  });
});

Template.appChaseSearch.helpers({
  chases: function () {
    return Chasesearch.find({"status": "started", owner: { $ne: Meteor.userId()}, chasers: { $not: { $elemMatch: {chaser: Meteor.userId()}}}}, {sort: { "calculatedDistance": 1 }});
  }
});
