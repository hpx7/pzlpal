Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound'
});

Router.map(function () {
  this.route('home', {
    path: '/'
  });
  this.route('puzzle', {
    path: '/crossword/:_id',
    before: function () {
      Session.set('crosswordId', this.params._id);
    }
  });
});

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}

function fillChar (c, x, y) {
  if (c !== ' ')
    $('td[data-coords="' + x + ',' + y + '"]').find('input').val(c);
}

function fillSlot (slot) {
  for (var i = 0; i < slot.answer.length; i++) {
    var curX = slot.startx;
    var curY = slot.starty;
    if (slot.orientation == "across")
      fillChar(slot.answer[i], curX + i, curY);
    else
      fillChar(slot.answer[i], curX, curY + i);
  }
}

Template.crossword.notSolved = function () {
  var slots = Slots.find({crosswordId: Session.get('crosswordId')}).fetch();
  return !slots.answers;
}

Template.home.events({
  'click .btn': function (e) {
    $('#loading').removeClass('hide');
    var crossword = {
      url: $('#url').val(),
      rows: $('#rows').val(),
      cols: $('#cols').val()
    };
    var id = Crosswords.insert(crossword);
    Meteor.call('parseImg', id, function (error, result) {
      Router.go('/crossword/' + id);
    });
  }
});

Template.crossword.events({
  'click .btn': function (e) {
    $('#loading2').removeClass('hide');
    Meteor.call('searchForClues', Session.get('crosswordId'));
  }
});

// XXX use waitOn?
Template.crossword.rendered = function () {
  var slots = Slots.find({crosswordId: Session.get('crosswordId')}).fetch();
  if (slots.length) {
    $('#puzzle-wrapper').html('');
    $('#puzzle-clues').html('');
    $('#puzzle-wrapper').crossword(clone(slots));
    for (var i = 0; i < slots.length; i++) {
      fillSlot(slots[i]);
    }
  }
}
