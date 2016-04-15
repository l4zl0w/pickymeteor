Template.chaseNew.helpers({
  create: function(){

  },
  rendered: function(){

  },
  destroyed: function(){

  },
  disabledRoundButton: function() {
    return this.owner_answer ? "disabled" : "";
  },
  disabledChaseStartButton: function() {
    if(this.owner_answered_all && this.status == "new")
      return "";
    else
      return "disabled";
  }
});

Template.chaseNew.events({
  //Clicking on a round to answer the questions
  "click .answer-round": function(event) {
    var round = $(event.target).data("rnd");
    Session.set("round", round);
    var selector = "#" + round;
    $(selector).css("width", 6 * window.innerWidth + 'px');
    $(selector).css("display", "block");
    $(selector).addClass("answer-overlay");
    $(".question-group").css("width", window.innerWidth + 'px');
  },
  //Clicking on an answer
  "click .question-group input[type='radio']": function(event) {
    var round = $(event.target).data("rnd");
    //Session.set("round", round);
    var parentEl = $(event.target).parent().parent().parent();
    var selector = "form#" + round;
    //Showing 'previous' button after first question was answered
    if(parentEl.is((selector + " > div.question-group:first-of-type"))) {
      $(selector).after('<div id="previous-question"><i class="fa fa-angle-left"</i> Previous</div>');
    }
    //Moving to the next next question unless we are at the last question
    if(!parentEl.is(selector + " > .question-group:last-of-type")) {
      $(selector).animate({
        left: '-=' + window.innerWidth + 'px'},
        100
      );
    }
    //If all questions have been aswered, show 'submit' button
    if($(selector + " > .question-group input[type='radio']:checked").length == $(selector + " > .question-group").length) {
      if(!$("#submit-questions").length)
        $(selector).after('<div id="submit-questions">Submit <i class="fa fa-angle-right"</i></div>');
    } else {
      $("#submit-questions").remove();
    }
  },
  //Going back to previous question
  "click #previous-question": function(event) {
    if(Session.get("round")) {
      var onScreenForm = "form#" + Session.get("round");
      var secondQuestion = onScreenForm + " > div.question-group:nth-child(2)";
      var clientRect = $(secondQuestion)[0].getBoundingClientRect();
      //If we click on this button while second question is shown disable the button
      //as we mustn't have the button show at first question
      if(clientRect.left > 0) {
        $("#previous-question").remove();
      }
      $(onScreenForm).animate({
        left: '+=' + window.innerWidth + 'px'},
        100
      );
    }
  },
  "click .close-questions": function(event) {
    $("form").css("display", "none");
    $("#previous-question").remove();
    $("#submit-questions").remove();
    $("form").css("left", 0);
  },
  "click #submit-questions": function(event) {
    if(Session.get("round") && Session.get("chase")) {
      var onScreenForm = "form#" + Session.get("round");
      if($(onScreenForm + " > .question-group input[type='radio']:checked").length == $(onScreenForm + " > .question-group").length) {
        var answers = {};
        $(onScreenForm + " > .question-group input[type='radio']:checked").each(function(index){
          answers[$(this).attr("name")] = $(this).data("ansid");
        });
        console.log(answers);
        console.log(Object.keys(answers).length);
        Meteor.call('answerRound', Session.get("chase"), Session.get("round"), answers, function(error, result) {

        });
        $("form").css("display", "none");
        $("#previous-question").remove();
        $("#submit-questions").remove();
        $("form").css("left", 0);
      }
    }
  },
  "click #start-chase": function(event) {
    if(Session.get("chase")) {
      $("#start-chase").prop("disabled", true);
      Meteor.call('startChase', Session.get("chase"), function(error, result) {
      });


    }
  }
});

//
// 'submit #new-chase': function(event) {
//   event.preventDefault();
//   var selectedRounds = Session.get('selectedRounds');
//   var chaseTitle = $('.new-chase-name').val();
//
//   console.log(selectedRounds);
//   Meteor.call('createChase', chaseTitle, selectedRounds, function(error, results) {
//     if(error){
//           console.log(error.reason);
//       } else {
//           if(Session.get('listOfCategoriesRendered')) {
//             $('.new-chase-name').val('');
//             $('#submitnewchase-button').css('display', 'none');
//             $('#submitnewchase-button').attr('disabled', 'disabled');
//             Blaze.remove(listofCategoriesView);
//             Session.set('listOfCategoriesRendered', false );
//         }
//       }
//   });
//   //cleanup
//   window.history.back();
//   $('.fa-plus-circle').css('display', 'inline-block');
//   $('#cancel-new-chase-button').css('display', 'none');
//   $('#submitnewchase-button').css('display', 'none');
//   $('.new-chase-name').val('');
//   $('#submitnewchase-button').attr('disabled', 'disabled');
//   $('.list-of-subcategories').remove();
//   Session.set('selectedRounds', []);
// },
