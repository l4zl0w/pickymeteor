Meteor.subscribe("categories");

Template.appNewChase.rendered = function() {
  Session.set('selectedSubCategories', 0);
  Session.set('selectedRounds', []);
  $('.fa-plus-circle').css('display', 'none');
  $('#cancel-new-chase-button').css('display', 'inline-block');
};

Template.appNewChase.helpers({
  categories: function () {
    var categs = Categories.find({});
    Session.set('categories', categs);
    return categs;
  }
});

Template.appNewChase.events({
  //Counts the number of sub-categories selected, enables submit button when
  //four categories are selected and input text length is more than 2.
  'scroll': function(event) {

  },
  'click .subcategory-item': function(event) {
    event.preventDefault();
    console.log(event);
    var roundsArray = Session.get('selectedRounds');
    var clicked = $(event.currentTarget).data('sub-cat-id');
    var isSelected = false;
    var unSelected = '';
    $.each(roundsArray, function(i, obj) {
      if(obj.subCatId == clicked) {
        unSelected = obj;
        isSelected = true;
      }
    });

    if(isSelected) {
      roundsArray.splice($.inArray(unSelected, roundsArray), 1);
      //$(event.currentTarget.firstElementChild).removeAttr('checked');
      //$(event.currentTarget.firstElementChild).attr('checked', false);
      event.currentTarget.firstElementChild.checked = false;
      console.log(roundsArray);
      Session.set('selectedRounds', roundsArray);
    } else if (roundsArray.length < 4) {
      roundsArray.push({
        subCatId  : $(event.currentTarget).data('sub-cat-id'),
        catId     : $(event.currentTarget).data('cat-id'),
        icon      : $(event.currentTarget).data('icon'),
        subCat    : $(event.currentTarget).data('sub-cat'),
        lowScore  : $(event.currentTarget).data('low-score'),
        highScore : $(event.currentTarget).data('high-score'),
        roundStat : ''
      });
      //$(event.currentTarget.firstElementChild).attr('checked', 'checked');
      event.currentTarget.firstElementChild.checked = true;
      //$(event.currentTarget.firstElementChild).attr('checked', true);
      console.log(roundsArray);
      Session.set('selectedRounds', roundsArray);
    }

    if(roundsArray.length == 4 && $('.new-chase-name').val().length > 2)
      $('#submitnewchase-button').removeAttr('disabled');
    else if (roundsArray.length < 4 ||  $('.new-chase-name').val().length < 3)
      $('#submitnewchase-button').attr('disabled', 'disabled');
  }
});
