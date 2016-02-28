Template.appProfile.onRendered(function() {
  var page = $('#app-fb-photos');
  page.css('left', window.innerWidth + 'px');
  page.animate({
    left: '-=' + window.innerWidth + 'px'},
    200
  );
});
