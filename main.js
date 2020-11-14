const csv = require("csv-parser");
const fs = require("fs");
var groupBy = require("json-groupby");
var async = require("async");

var dataArray = [];
var parser = csv({ delimiter: "," }, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    // do something with the line
    doSomething(line).then(function () {
      // when processing finishes invoke the callback to move to the next one
      callback();
    });
  });
});

fs.createReadStream("Analytics-20201001-20201031.csv")
  .on("error", function () {
    console.log("Error:", error.message);
  })

  .pipe(parser)
  .on("data", (row) => {
    dataArray.push(row);
  })

  .on("end", () => {
    const uniqueIdentifier = require("uuid").v4();
    console.log(uniqueIdentifier);
    // Average pageview per day for different traffic type
    function getGroupedData(data, list) {
      const reduced = data.reduce(function (m, d) {
        if (!m[d.Date]) {
          m[d.Date] = { ...d, count: 1 };
          return m;
        }
        list.forEach(function (Pageviews) {
          m[d.Date][Pageviews] =
            parseInt(m[d.Date][Pageviews]) + parseInt(d[Pageviews]);
        });
        m[d.Date].count += 1;
        return m;
      }, {});
      return Object.keys(reduced).map(function (k) {
        const item = reduced[k];
        const itemAverage = list.reduce(function (m, Pageviews) {
          m[Pageviews] = parseInt(item[Pageviews]) / parseInt(item.count);
          return m;
        }, {});
        return {
          ...item, // Preserve any non white-listed keys
          ...itemAverage, // Add computed averege for listed keys
        };
      });
    }
    var AveragePagePerView = getGroupedData(dataArray, ["Pageviews"]);
    for (var i in AveragePagePerView) {
      console.log(
        "Date ",
        AveragePagePerView[i].Date,
        " Average Pageview ",
        AveragePagePerView[i].Pageviews
      );
    }

    // Ratio of users and sessions per day
    var groupedByDateUsers = groupBy(dataArray, ["Date"], ["Users"]);
    var groupByDateSessions = groupBy(dataArray, ["Date"], ["Sessions"]);
    var dates = [];
    dates = Object.keys(groupedByDateUsers);
    var iteration = 0;
    for (var i in groupedByDateUsers) {
      var sumUsers = 0;
      var sumSessions = 0;
      for (var j in groupedByDateUsers[i].Users) {
        sumUsers = sumUsers + parseInt(groupedByDateUsers[i].Users[j]);
        sumSessions =
          sumSessions + parseInt(groupByDateSessions[i].Sessions[j]);
      }
      var ratioUserSessions = sumUsers / sumSessions;

      console.log(
        "Date",
        dates[iteration],
        "Ratio of users and sessions per day",
        ratioUserSessions
      );
      iteration = iteration + 1;
    }
    /*
    var groupByTrafficType = groupBy(dataArray, ["Traffic Type", "Date"]);
    //  console.log(groupByTrafficType);
    for (var i in groupByTrafficType) {
      var sumUsers = 0;
      var sumSessions = 0;
      for (var j in groupByTrafficType[i]) {
        for (var s in groupByTrafficType[i][j]) {
          // console.log(groupByTrafficType[i][j][s]);
        }
        //var ratioUserSessions = sumUsers / sumSessions;
        //  console.log("Ratio of User and Sessioons per day", ratioUserSessions);
      }
    }
    var d = "20201023";
    var date = new Date(2020 - 11 - 15);
    var n = date.getDay();
    console.log(n);

    /*
    console.log(
      date.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    var weekday = [];
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    //  var n = weekday[d.getDay()];

    //  lodash.groupBy(dataArray, "Traffic Type");
*/
    console.log("CSV file successfully processed");
  });
