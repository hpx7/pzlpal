var jsdom = Meteor.require("jsdom");
var sh = Meteor.require('execSync');

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
    console.log('DATA from image file: ' + data)
    go(data);
	}
});

function go (data) {
  for (var i = 0; i < data.length; i++) {
    var pattern = "";
    for (var j = 0; j < data[i].len; j++)
      pattern += "?";
    searchWordplays(data[i].clue, pattern, data, i);
    console.log(i+1);
  }
  runAlgo(data);
}

function searchWordplays (clue, pattern, data, dataIdx) {
	var url = 'http://www.wordplays.com/crossword-solver';

  while (true) {
    try {
      var result = HTTP.post(url, { params: { clue: clue, pattern: pattern } });

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

      break;
    } catch (err) {
      console.error("ERROR: " + error + " ... retrying");
    }
  }
}
