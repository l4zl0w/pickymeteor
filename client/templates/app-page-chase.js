Template.appChase.onRendered(function() {
  $(".yourTabbedInterface-container").css("display", "none");
  var page = $('#app-chase');
  page.css('left', window.innerWidth + 'px');
  page.animate({
    left: '-=' + window.innerWidth + 'px'},
    100
  );
});

Template.appChase.helpers({
  own: function() {
    chase = Chases.findOne({_id: Session.get("chase")});
    if(chase.owner == Meteor.user()._id)
      return true;
    else
      return false;
  },
  ch: function() {
    return Chases.findOne({_id: Session.get("chase")});
  },
  isAlreadyChasing: function() {
    self = this;
    console.log("isAlreadyChasing");
    console.log(self.chasers.indexOf(Meteor.user()._id));
    response = false;
    self.chasers.forEach(function(element, index, array) {
      if(element.chaser == Meteor.user()._id) {
        response = true;
      }
    });
    return response;
  },
  isChaserActive: function() {
    self = this;
    response = false;
    self.chasers.forEach(function(element, index, array) {
      if(element.chaser == Meteor.user()._id && element.chaserStatus == "active") {
        response = true;
      }
    });
    return response;
  },
  isFirstRound: function() {
    self = this;
    response = false;
    console.log("isFirstRound");
    console.log(self.activeRound);
    console.log(self.rounds[0].subCatId);
    if(self.activeRound == self.rounds[0].subCatId) {
      response = true;
    } else {
      response = true;
    }
    return response;
  },
  hasAnsweredActiveRound: function() {
    //TODO
  }
});

Template.appChase.events({
  'click #join-chase': function() {
    self = this;
    success = false;
    Meteor.call("joinChase", self._id, Meteor.user()._id, function(err, res) {
      if(err) {
        throw err;
      }
      else {
        success = true;
      }
    });
    console.log(this);
    return success;
  }
});
