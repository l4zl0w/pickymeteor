Template.signin.events({
    'click #facebook-login': function(event) {
      Meteor.loginWithFacebook({
        requestPermissions: ['public_profile', 'email', 'user_birthday', 'user_location', 'user_photos' ]
        }, function(err){
            if (err) {
                throw new Meteor.Error("Facebook login failed");
            }
        });
    }
});
