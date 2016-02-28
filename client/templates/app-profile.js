Template.appProfile.created = function(){
  Tracker.autorun(function() {
    //Meteor.subscribe('profilePictures');
    //Meteor.subscribe('profileAndPictures');
  });
}

Template.appProfile.onRendered(function() {
  $(".yourTabbedInterface-container").css("visibility", "hidden");
  var page = $('#app-profile');
  page.css('left', window.innerWidth + 'px');
  page.animate({
    left: '-=' + window.innerWidth + 'px'},
    100
  );
  var mySwiper = $(".swiper-container").swiper({
      mode: "horizontal",
      loop: true,
      pagination: ".swiper-pagination",
      calculateHeight: true
  });
});

Template.appProfile.helpers({
  // profileAndPictures: function() {
  //   Meteor.subscribe('profileAndPictures');
  // }
  prof: function() {
    return Meteor.users.find();
  },
  pictures: function() {
    return Images.find({"userId": Meteor.user()._id}, { sort : {mainPicture: -1}});
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

Template.appProfile.events({
  'click #edit-profile-button': function() {
    Router.go("/editphotos");
    /*bootbox.dialog({
      message: "yes",
      title: "Edit my pictures",
      buttons: {
        add: {
          label: "Add more...",
          className: "btn-primary",
          callback: function() {
            bootbox.dialog({
              message: "yes",
              title: "Select pictures to add to my profile...",
              buttons: {
                cancel: {
                  label: "Cancel",
                  className: "btn-primary",
                  callback: function() {
                    Example.show("uh oh, look out!");
                  }
                },
                ok: {
                  label: "OK",
                  className: "btn-primary",
                  callback: function() {
                    Example.show("Primary button");
                  }
                }
              }
            });
            Meteor.call('getFbPhotos', function (error, result) {
              if(error) throw error;
              if(result.data) {
                var elements = "";
                result.data.forEach(function(photo){
                  if(photo.link)
                    elements = elements +
                      "<img src='" + photo.link + "'/>";
                      console.log("<li><img src='" + photo.link + "'/></li>");
                });
                //TODO: set session variable with next link and automatically
                //call as user scrolls down
                //elements = elements + "</ul>";
                $(".modal-body").after(elements);
              }
            });
          }
        },
        ok: {
          label: "OK",
          className: "btn-primary",
          callback: function() {
            Example.show("Primary button");
          }
        }
      }
    });*/
  }
});
