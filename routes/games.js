var express = require('express');
var router = express.Router();
const moment = require('moment');

/* GET users listing. */
router.get('/', function(req, res, next) {
  function getData(url) {
    return getGames(url).then(function(games) {
      res.render('games', { title: 'UK Athletics Schedules', games });
    });
  }

  getData('http://www.ukathletics.com/calendar.ashx/calendar.rss');
});

function getGames(url) {
  return new Promise(function(resolve, reject) {
    var parser = require('rss-parser');

    var options = {
      customFields: {
        item: [
          ['title', 'title'],
          ['description', 'description'],
          ['ev:location', 'location'],
          ['s:localstartdate', 'localStartDate'],
          ['s:opponentlogo', 'opponentLogo'],
          ['s:gamepromoname', 'gamePromoName'],
          ['s:gameid', 'gameId']
        ]
      }
    };

    parser.parseURL(url, options, function(err, parsed) {

      var games = {
        "upcomingGame": 0,
        "teamStats": [],
        "gameData": []
      };

      parsed.feed.entries.forEach(function(entry, index) {
        var descriptionArray = entry.description.split('\\n');

        var tvProvider = '';
        var gameResult = '';

        descriptionArray.forEach(function(item) {
          if (item.toLowerCase().includes('tv:')) {
            tvProvider = item;
          }
          if (item.toLowerCase().startsWith('w ') || item.toLowerCase().startsWith('l ') || item.toLowerCase().startsWith('n ') || item.toLowerCase().startsWith('t ')) {
            gameResult = item;
          }
        });

        var homeGame = false;
        var opponentName;
        var sportType;

        var entryTitle = entry.title;
        var opponentNameSplit = entryTitle.split(' at  ');

        if (entryTitle.indexOf(" at  ") == -1) {
          homeGame = true;
          opponentName = entryTitle.substring(entryTitle.indexOf("vs") + 2);
          sportType = entryTitle.match(new RegExp("University of Kentucky" + "(.*)" + " vs  "))[1].trim();
        } else {
          opponentName = entryTitle.substring(entryTitle.indexOf("at") + 2);
          sportType = entryTitle.match(new RegExp("University of Kentucky" + "(.*)" + " at  "))[1].trim();
        }

        switch (sportType) {
          case "Baseball":
            break;
          case "Cross Country":
            sportType = "Cross";
            break;
          case "Football":
            break;
          case "Men's Basketball":
            sportType = "Mbball";
            break;
          case "Men's Golf":
            sportType = "Mgolf";
            break;
          case "Men's Soccer":
            sportType = "Msoc";
            break;
          case "Men's Tennis":
            sportType = "Mten";
            break;
          case "Rifle":
            break;
          case "Softball":
            break;
          case "Swimming & Diving":
            sportType = "Swimming";
            break;
          case "Track & Field":
            sportType = "Track";
            break;
          case "Volleyball":
            sportType = "Wvball";
            break;
          case "Women's Basketball":
            sportType = "Wbball";
            break;
          case "Women's Golf":
            sportType = "Wgolf";
            break;
          case "Women's Gymnastics":
            sportType = "Wgym";
            break;
          case "Women's Soccer":
            sportType = "Wsoc";
            break;
          case "Women's Tennis":
            sportType = "Wten";
            break;
          default:
            sportType = "";
        }

        var homeWins = 0;
        var awayWins = 0;
        var neutralWins = 0;
        var homeLosses = 0;
        var awayLosses = 0;
        var neutralLosses = 0;
        var homeTies = 0;
        var awayTies = 0;
        var neutralTies = 0;

        var gameDay = moment(entry.localStartDate).format('MMM D (ddd)');
        var gameTime = moment(entry.localStartDate).format('h:mm a');

        if (gameTime === '8:00 am' || gameTime === '12:00 am') {
          gameTime = '';
        }

        games.gameData.push({
          "sport": sportType,
          "game": index + 1,
          "gameId": entry.gameId,
          "opponentName": opponentName.trim(),
          "homeGame": homeGame,
          "conferenceGame": "",
          "location": entry.location,
          "tvProvider": tvProvider,
          "fullGameTime": moment(entry.localStartDate).format('YYYY-MM-DD'),
          "gameDay": moment(entry.localStartDate).format('MMM D (ddd)'),
          "gameTime": gameTime,
          "opponentLogo": entry.opponentLogo,
          "gamePromoName": entry.gamePromoName,
          "gameResult": gameResult
        });
      });

      // "teamStats": [{
      //   "overallRecord": "0-0",
      //   "overallWinPercentage": ".000",
      //   "conferenceRecord": "0-0",
      //   "conferenceWinPercentage": ".000",
      //   "currentStreak": "W0",
      //   "homeRecord": "0-0",
      //   "awayRecord": "0-0",
      //   "neutralRecord": "0-0",
      // }]

      games.gameData.some(function(item, index) {
        if (moment(item.fullGameTime).isSameOrAfter(moment().format('YYYY-MM-DD'), 'day')) {
          games.upcomingGame = index;
          return true;
        }
      });
      console.log(games.gameData[games.upcomingGame].fullGameTime);
      resolve(games);
    });
  });
}

module.exports = router;
