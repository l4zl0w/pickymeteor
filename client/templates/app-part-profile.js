Template.appPartProfile.onRendered(function() {
  var mySwiper = $(".swiper-container").swiper({
      mode: "horizontal",
      loop: true,
      pagination: ".swiper-pagination",
      calculateHeight: true
  });
});

Template.appPartProfile.helpers({
  acc: function() {
    self = this;
    Meteor.call('userDetails', self.owner, function(err, res) {
      if(err) {
        throw err;
      } else {
        Session.set('userDetails', res);
      }
    });
    return Session.get('userDetails');
  },
  pictures: function() {
    chase = Chases.findOne({_id: Session.get("chase")});
    return Images.find({"userId": chase.owner}, { sort : {mainPicture: -1}});
  },
  age: function(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }
});

Template.appPartProfile.events({

});
