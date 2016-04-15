Template.appPhotos.onRendered(function() {
  $(".yourTabbedInterface-container").css("display", "none");
  var pageTitle = "<div class='page-headline text-center'>Add photos</div>";
  $(".settings-back-button").after(pageTitle);
  var page = $('#app-profile-photos');
  page.css('left', window.innerWidth + 'px');
  page.animate({
    left: '-=' + window.innerWidth + 'px'},
    100
  );
  //Reaching the bottom of the window will load more pictures if available
  $(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() == $(document).height()) {
     if(Session.get('nextPageUrl') && Session.get('nextPageUrl') != '') {
       Meteor.call('getMoreFbPhotos', Session.get('nextPageUrl'), function(error,result) {
          if(error)
            alert("Couldn't retrieve more pictures");
          else {
            console.log(result.data);
            var pictureUrls = Session.get('pictureUrls');
            pictureUrls = pictureUrls.concat(result.data.data);
            Session.set('pictureUrls', pictureUrls);
            if(result.data.paging.next)
              Session.set('nextPageUrl', result.data.paging.next);
            else
              Session.set('nextPageUrl','');

          }
       });
     }
   }
  });
});

Template.appPhotos.helpers({
  pictures: function() {
    return Session.get('pictureUrls');
  }
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
        Session.setDefault('fbPictures', fbPictures);
      }
    } else {
      if(!Session.get('fbPictures'))
        Session.setDefault('fbPictures',{});
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
          Session.set('pictureUrls', {});
          Session.set('nextPageUrl', '');
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
