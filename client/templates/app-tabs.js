OPEN_PAGES = [];
Session.set('openPages', []);

ReactiveTabs.createInterface({
  template: 'yourTabbedInterface',
  onChange: function (slug, template) {
    // This callback runs every time a tab changes.
    // The `template` instance is unique per {{#basicTabs}} block.
    console.log('[tabs] Tab has changed! Current tab:', slug);
    console.log('[tabs] Template instance calling onChange:', template);
  }
});

Template.appTabs.helpers({
  tabs: function () {
    // Every tab object MUST have a name and a slug!
    return [
      { name: 'Messages', slug: 'messages', icon: 'fa fa-envelope' },
      { name: 'My Chases', slug: 'mychases', icon: 'fa fa-star'},
      { name: 'I\'m Chasing', slug: 'imchasing', icon: 'fa fa-users' },
      { name: 'Search', slug: 'search', icon: 'fa fa-search' }
    ];
  },
  activeTab: function () {
    // Use this optional helper to reactively set the active tab.
    // All you have to do is return the slug of the tab.

    // You can set this using an Iron Router param if you want--
    // or a Session variable, or any reactive value from anywhere.

    // If you don't provide an active tab, the first one is selected by default.
    // See the `advanced use` section below to learn about dynamic tabs.
    return Session.get('activeTab'); // Returns "people", "places", or "things".
  },
  getUserId: function () {
    return Meteor.user()._id;
  }
});

Template.appTabs.events({
  // 'click .fa-cog': function(event, template) {
  //   //Meteor.logout();
  //   Blaze.render(Template.appSettings, $('.page-placeholder').get(0));
  //   var appSettingsPage = $('#app-settings-page')[0];
  //   if(appSettingsPage)
  //   {
  //     $('#app-settings-page').width($(window).width());
  //     $('#app-settings-page').height($(window).height());
  //     appSettingsPage.style.transform = 'translateX('+(-window.innerWidth)+'px)';
  //     OPEN_PAGES.push(appSettingsPage);
  //   }
  // },
  'click #settings-button': function(event, template) {
    Router.go('/settings');
  },
  'click #profile-button': function(event, template) {
    //var openPages = Session.get('openPages');
    $(".yourTabbedInterface-container").css("visibility", "none");
    Router.go('/profile/' + Meteor.user()._id);
    //var newPage = $('.page-over')[0];
    //newPage.style.transform = 'translateX('+(-window.innerWidth)+'px)';
    //openPages.push(Router.current().url);
    //Session.set('openPages', openPages);
  }
});
