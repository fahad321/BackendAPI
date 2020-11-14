const csv = require("csv-parser");
const fs = require("fs");
var groupBy = require("json-groupby");
var async = require("async");

var dataArray = [];
var parser = csv({ delimiter: "," }, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    doSomething(line).then(function () {
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

    console.log("CSV file successfully processed");
  });
