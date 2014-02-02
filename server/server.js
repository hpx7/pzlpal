var jsdom = Meteor.require("jsdom");
var sh = Meteor.require('execSync');

var count = 0;

Meteor.methods({
	parseImg: function (crosswordId) {
    var crossword = Crosswords.findOne(crosswordId);
    var wd = '/tmp/' + crosswordId;
    fs.mkdirSync(wd);
    console.log("WORKING DIR:  " + wd);

    var pathToCV = "/Users/Harsh/Dev/crossword-solver/imageparser";
    var execString = "ruby " + pathToCV + "/imageparser.rb " + crossword.url + " " + crossword.cols + " "
                      + crossword.rows + " " + wd + " " + pathToCV;
    console.log("EXEC: " + execString);

    // XXX make this more efficient?
    var result = sh.exec(execString);
    // console.log(result);
    console.log('done executing image parsing');

    var pathToJSON = wd + '/out.json';
    var data = JSON.parse(fs.readFileSync(pathToJSON, 'utf8'));

    for (var i = 0; i < data.length; i++) {
      var slot = _.extend(data[i], {crosswordId: crosswordId});
      Slots.insert(slot);
    }
    console.log('done parsing');
    
	},
  solve: function (crosswordId) {
    count = 0;
    var data = Slots.find({crosswordId: crosswordId}).fetch();
    for (var i = 0; i < data.length; i++) {
      var pattern = "";
      for (var j = 0; j < data[i].len; j++)
        pattern += "?";
      searchWordplays(data[i].clue, pattern, data, i, function (slots) {
        for (var i = 0; i < slots.length; i++)
          Slots.update(slots[i]._id, slots[i]);
        console.log('done searching for clues');
        runAlgo(slots);
      });
    }
  }
});

// XXX timeout?
function searchWordplays (clue, pattern, data, dataIdx, done) {
	var url = 'http://www.wordplays.com/crossword-solver';

  HTTP.post(url, { params: { clue: clue, pattern: pattern } }, function (error, result) {
    if (error) {
      console.log("ERROR1: ... retrying");
      searchWordplays(clue, pattern, data, dataIdx, done);
      return;
    }

    try {
      var body = result.content;

      var wrapped = Async.wrap(jsdom.env);
      var window = wrapped(body, ["http://code.jquery.com/jquery.js"]);
      var $ = window.$;

      var ranks = $.map($('.stars'), function (div) {
        return $(div).children().length;
      });

      var answers = $.map($('.stars').parent().next().find('a'), function (a) {
        return $(a).text();
      });

      var result = [];
      for (var i = 0; i < $('.stars').length; i++)
        result.push({ name: answers[i], conf: ranks[i] });

      data[dataIdx].answers = result;
    } catch (error) {
      console.log("ERROR2: ... retrying");
      searchWordplays(clue, pattern, data, dataIdx, done);
      return;
    }

    count++;
    console.log(count);
    if (count === data.length)
      done(data);
  });
}
