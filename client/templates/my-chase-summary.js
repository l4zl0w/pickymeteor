Template.myChaseSummary.helpers({
  activeRound: function(parentContext) {
    if(parentContext.activeRound == this.subCatId)
      return "active-round-colour";
    else return "";
  },
  chaseStatus: function() {
    chase = this;
    var ret = "...";
    if(chase.status == "new")
      ret = "new";
    if(chase.status == "started" && chase.endingAt)
      ret = moment(chase.endingAt).toNow().substring(3);
    if(chase.status == "ended")
      ret = "ended";
    return ret;
  }
});

// Template.appChase.created = function(){
//   Tracker.autorun(function() {
//     Meteor.subscribe('chase');
//     //Meteor.subscribe('profileAndPictures');
//   });
// }
//
// Template.appChase.helpers({
//   chase: function() {
//     return Chases.find();
//   }
// });
