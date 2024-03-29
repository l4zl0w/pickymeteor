Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  //notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  //loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
//      Meteor.subscribe('publicLists'),
//      Meteor.subscribe('privateLists')
    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();

  // Show the loading screen on desktop
  Router.onBeforeAction('loading', {except: ['signin']});
  //Router.onBeforeAction('genderPreferenceNotFound', {except: ['signin']});

  Meteor.subscribe('categories');
  Meteor.subscribe("chases");

  Router.route('/categories', {
    template: 'appNewChase',
    data: function() {
        return Categories.find({});
    }
  });

  Router.route('/profile/:_id', {
    template:       'appProfile',
    waitOn: function() {
      return [
        Meteor.subscribe('profile', this.params._id),
        Meteor.subscribe("pictures", this.params._id)
      ];
    },
    data: function() {
      return {
        profile: Meteor.users.find(this.params._id, { fields: { _id: 1, services: 1, profile: 1 }}),
        pictures: Images.find({"userId": this.params._id}, { sort : {mainPicture: -1}})
      }
    }
  });

  Router.route('/', {
    action: function() {
      if(Meteor.user().profile.gender_preference)
        $(".yourTabbedInterface-container").css("display", "block");
      else {
        Router.go('/settings');
      }
    }
  });

  Router.route('/settings', {
    template: 'appSettings'
  });

  Router.route('/addphotos', function(){
    var self = this;
    Meteor.call('getFbPhotos', function(error, result) {
      if(result) {
        if(result.paging.next && result.data) {
          if(Session.get('nextPageUrl')) {
            Session.set('nextPageUrl', result.paging.next);
          }
          else {
            Session.setDefault('nextPageUrl', result.paging.next);
          }
          if(Session.get('pictureUrls'))
            Session.set('pictureUrls', result.data);
          else
            Session.setDefault('pictureUrls', result.data);
          self.render('appPhotos');
        }
      } else {
      self.next();
      }
    });
  });

  Router.route("/chase/:_id", function() {
    Session.set("chase", this.params._id);
    this.render("appChase", {
      data: function() {
        console.log(this.params._id);
        return Chases.findOne({_id: this.params._id});
      }
    });
  });
}

//Router.route('join');
//Router.route('signin');

/*Router.route('listsShow', {
  path: '/lists/:_id',
  // subscribe to todos before the page is rendered but don't wait on the
  // subscription, we'll just render the items as they arrive
  onBeforeAction: function () {
    this.todosHandle = Meteor.subscribe('todos', this.params._id);

    if (this.ready()) {
      // Handle for launch screen defined in app-body.js
      dataReadyHold.release();
    }
  },
  data: function () {
    return Lists.findOne(this.params._id);
  },
  action: function () {
    this.render();
  }
});*/

/*Router.route('home', {
  path: '/',
  action: function() {
    Router.go('listsShow', Lists.findOne());
  }
});
*/
