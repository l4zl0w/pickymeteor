Template.chaseSummary.onCreated(function(){
  var self = this;
  console.log(self);
  self.autorun(function() {
    self.subscribe("thumbnail", self.owner);
    // self.subscribe("chaseSearch", Meteor.userId());
  });
});

Template.chaseSummary.helpers({
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
  },
  thumbnail: function() {
    chase = this;
    Meteor.subscribe("thumbnail", chase.owner);
    return Images.find({"userId": chase.owner, "mainPicture": true});
  },
  distance: function () {
      chase = this;
      if(chase.calculatedDistance <= 1 && chase.calculatedDistance >= 0)
        return "1 mile";
      else if (chase.calculatedDistance > 1)
        return Math.round(chase.calculatedDistance) + " miles";
      else return "";
  }
});
