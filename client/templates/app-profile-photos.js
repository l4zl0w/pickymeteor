Session.set('fbPictures', {});

Template.appPhotos.onRendered(function() {
  $(".yourTabbedInterface-container").css("visibility", "hidden");
  var pageTitle = "<div class='page-headline text-center'>Add photos</div>";
  $(".settings-back-button").after(pageTitle);
  var page = $('#app-profile-photos');
  page.css('left', window.innerWidth + 'px');
  page.animate({
    left: '-=' + window.innerWidth + 'px'},
    100
  );
});

Template.appPhotos.events({
  'click .fbpicture': function(event) {
    if($(event.currentTarget).hasClass("selected")) {
      $(event.currentTarget).removeClass("selected");
      $(event.currentTarget).css({"background-color": "white"});
      var fbPictures = Session.get("fbPictures");
      var fbPicId = $(event.target).data("id");
      if(fbPictures.hasOwnProperty(fbPicId)) {
        delete fbPictures[fbPicId];
        Session.set('fbPictures', fbPictures);
      }
    } else {
      $(event.currentTarget).addClass("selected");
      $(event.currentTarget).css({"background-color": "lightskyblue"});
      var fbPictures = Session.get("fbPictures");
      var fbPicId = $(event.target).data("id");
      if(!fbPictures.hasOwnProperty(fbPicId)) {
        fbPictures[fbPicId] = $(event.target).attr("src");
        Session.set('fbPictures', fbPictures)
      }
    }
  },
  'click #submit-fb-pictures': function() {
    var fbPictures = Session.get('fbPictures');
    if(Object.keys(fbPictures).length !== 0) {
      Meteor.call('getSelectedFbPhotos',fbPictures,function(error, result) {
        if(error) {
          alert("Something went wrong");
        } else {
          Session.set('fbPictures', {});
          window.history.back();
          var $current = $('page');
          $current.remove();
        }
      });
    } else {
      alert("No pictures selected");
    }
  }
});
