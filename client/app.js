Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound'
});

Router.map(function () {
  this.route('home', {
    path: '/'
  });
  this.route('puzzle', {
    path: '/crossword/:_id'
  });
});

function clone (obj) {
  return JSON.parse(JSON.stringify(obj));
}

function fillChar (c, x, y) {
  // console.log('fillChar ' + c + ' ' + x + ' ' + y);
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

Template.home.events({
  'click .btn': function (e) {
    var crossword = {
      url: $('#url').val(),
      rows: $('#rows').val(),
      cols: $('#cols').val()
    };
    var id = Crosswords.insert(crossword);
    Meteor.call('parseImg', id);
  }
});

// XXX use waitOn?
Template.crossword.rendered = function () {
  var slots = Slots.find().fetch();
  if (slots.length) {
    $('#puzzle-wrapper').crossword(clone(slots));
    for (var i = 0; i < slots.length; i++) {
      fillSlot(slots[i]);
    }
  }
}
