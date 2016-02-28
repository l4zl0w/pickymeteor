Template.appSettings.onRendered(function() {
  var page = $('#app-settings');
  page.css('left', window.innerWidth + 'px');
  page.animate({
    left: '-=' + window.innerWidth + 'px'},
    200
  );
});

Template.appSettings.events({
  'click #bye': function(event, template) {
    Meteor.logout();
  }
});
