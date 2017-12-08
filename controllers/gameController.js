const moment = require('moment');

// Display Composite Schedules
exports.composite_schedule = function(req, res) {
  function getData(url, composite) {
    return getGames(url, composite).then(function(games) {
      res.json({
        title: 'UK Athletics Schedules',
        scheduleName: 'Composite',
        compositeSchedule: true,
        games
      });
    });
  }

  getData('http://www.ukathletics.com/calendar.ashx/calendar.rss', true);
};

// Display specific team schedule
exports.schedule_detail = function(req, res) {
  var scheduleId = req.params.scheduleId;
  var scheduleName;

  switch (scheduleId) {
    case "1":
      scheduleName = "Baseball";
      break;
    case "33":
      scheduleName = "Cross Country";
      break;
    case "2":
      scheduleName = "Football";
      break;
    case "4":
      scheduleName = "Men's Basketball";
      break;
    case "6":
      scheduleName = "Men's Golf";
      break;
    case "8":
      scheduleName = "Men's Soccer";
      break;
    case "10":
      scheduleName = "Men's Tennis";
      break;
    case "35":
      scheduleName = "Rifle";
      break;
    case "12":
      scheduleName = "Softball";
      break;
    case "31":
      scheduleName = "Swimming & Diving";
      break;
    case "29":
      scheduleName = "Track & Field";
      break;
    case "22":
      scheduleName = "Volleyball";
      break;
    case "13":
      scheduleName = "Women's Basketball";
      break;
    case "15":
      scheduleName = "Women's Golf";
      break;
    case "16":
      scheduleName = "Gymnastics";
      break;
    case "18":
      scheduleName = "Women's Soccer";
      break;
    case "20":
      scheduleName = "Women's Tennis";
      break;
    default:
      scheduleName = "Composite";
  }

  function getData(url, composite) {
    return getGames(url, composite).then(function(games) {
      res.json({
        title: 'UK Athletics Schedules',
        scheduleName: scheduleName,
        compositeSchedule: false,
        games
      });
    });
  }

  getData('http://www.ukathletics.com/calendar.ashx/calendar.rss' + "?sport_id=" + scheduleId, false);
};

function getGames(url, composite) {
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
        "upcomingGame": "",
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

        var gameDay = moment(entry.localStartDate).format('MMM D (ddd)');
        var gameTime = moment(entry.localStartDate).format('h:mm a');
        var fullGameTime = moment(entry.localStartDate).format('YYYY-MM-DD')

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
          "gameDay": moment(entry.localStartDate).format('MMM D (ddd)'),
          "gameTime": gameTime,
          "fullGameTime": fullGameTime,
          "opponentLogo": entry.opponentLogo,
          "gamePromoName": entry.gamePromoName,
          "gameResult": gameResult
        });
      });
      games.gameData.some(function(item, index) {
        if (moment(item.fullGameTime).isSameOrAfter(moment().format('YYYY-MM-DD'), 'day')) {
          games.upcomingGame = item.gameId;
          return true;
        }
      });
      resolve(games);
    });
  });
}
