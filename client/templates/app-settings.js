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
  },
  'click .genderselect': function(event, template) {
    event.preventDefault();
    var gender = $(event.target).attr("value");
    console.log(gender);
    Meteor.call("setGenderPreference", $(event.target).attr("value"), function(error, result) {});
  }
});
