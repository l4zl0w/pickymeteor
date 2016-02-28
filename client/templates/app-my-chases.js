Template.appMyChases.helpers({
  myChases: function () {
    return Chases.find({ owner: Meteor.user()._id }, {sort: { createdAt: -1 }});
  }
});

Template.appMyChases.events({
  /*'focus .new-chase-name': function() {
      if(!Session.get('listOfCategoriesRendered')) {
        Session.set('listOfCategoriesRendered', true );
        listofCategoriesView = Blaze.render(Template.appNewChase, $('.new-chase').get(0));
        $('#submitnewchase-button').css('display', 'block');
      }
  },*/
  'input .new-chase-name': function(event) {
    var roundsArray = Session.get('selectedRounds');
    console.log('input length: ' + $('.new-chase-name').val().length);
    if(roundsArray.length == 4 && $('.new-chase-name').val().length > 2)
      $('#submitnewchase-button').removeAttr('disabled');
    else if (roundsArray.length < 4 || $('.new-chase-name').val().length < 3)
      $('#submitnewchase-button').attr('disabled', 'disabled');
  },
  'focus .new-chase-name': function(event) {
    Router.go('/categories');
    $('#submitnewchase-button').css('display', 'block');
  },
  'submit #new-chase': function(event) {
    event.preventDefault();
    var selectedRounds = Session.get('selectedRounds');
    var chaseTitle = $('.new-chase-name').val();

    console.log(selectedRounds);
    Meteor.call('createChase', chaseTitle, selectedRounds, function(error, results) {
      if(error){
            console.log(error.reason);
        } else {
            if(Session.get('listOfCategoriesRendered')) {
              $('.new-chase-name').val('');
              $('#submitnewchase-button').css('display', 'none');
              $('#submitnewchase-button').attr('disabled', 'disabled');
              Blaze.remove(listofCategoriesView);
              Session.set('listOfCategoriesRendered', false );
          }
        }
    });
    //cleanup
    window.history.back();
    $('.fa-plus-circle').css('display', 'inline-block');
    $('#cancel-new-chase-button').css('display', 'none');
    $('#submitnewchase-button').css('display', 'none');
    $('.new-chase-name').val('');
    $('#submitnewchase-button').attr('disabled', 'disabled');
    $('.list-of-subcategories').remove();
    Session.set('selectedRounds', []);
  },
  'click #cancel-new-chase-button': function (event) {
      window.history.back();
      $('.fa-plus-circle').css('display', 'inline-block');
      $('#cancel-new-chase-button').css('display', 'none');
      $('#submitnewchase-button').css('display', 'none');
      $('.new-chase-name').val('');
      $('#submitnewchase-button').attr('disabled', 'disabled');
      $('.list-of-subcategories').remove();
      Session.set('selectedRounds', []);
  }
});
