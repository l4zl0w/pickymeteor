Template.appPageTemplate.events({
  'click .page-back-button': function(event, template) {
    var openPages = Session.get('openPages');
    var noOfOpenPages = openPages.length;
    if(noOfOpenPages > 0 && noOfOpenPages == 1) {
      openPages.pop();
      $('.page-over')[0].style.transform = 'translateX('+(+1000)+'px)';
    }
      var topPage = openPages[noOfOpenPages - 1];

    //var view = Blaze.getView($("#settings")[0]);
    //Blaze.remove(view);
  }
});
