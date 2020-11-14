const csv = require("csv-parser");
const fs = require("fs");
var groupBy = require("json-groupby");
//var groupBy = require("lodash.groupby");

var dataArray = [];
fs.createReadStream("Analytics-20201001-20201031.csv")
  .pipe(csv())
  .on("data", (row) => {
    dataArray.push(row);
  })
  .on("end", () => {
    const uniqueIdentifier = require("uuid").v4();
    console.log(uniqueIdentifier);
    var groupedByDateUsers = groupBy(dataArray, ["Date"], ["Users"]);
    var groupByDateSessions = groupBy(dataArray, ["Date"], ["Sessions"]);

    for (var i in groupedByDateUsers) {
      var sumUsers = 0;
      var sumSessions = 0;
      for (var j in groupedByDateUsers[i].Users) {
        sumUsers = sumUsers + parseInt(groupedByDateUsers[i].Users[j]);
        sumSessions =
          sumSessions + parseInt(groupByDateSessions[i].Sessions[j]);
      }
      var ratioUserSessions = sumUsers / sumSessions;
      //  console.log("Ratio of User and Sessioons per day", ratioUserSessions);
    }

    var groupByTrafficType = groupBy(dataArray, [
      "Traffic Type",
      "Date",
      "Sessions",
    ]);
    console.log(groupByTrafficType);
    //  lodash.groupBy(dataArray, "Traffic Type");

    function getGroupedData(data, whitelist) {
      const reduced = data.reduce(function (m, d) {
        if (!m[d.Date]) {
          m[d.Date] = { ...d, count: 1 };
          return m;
        }
        whitelist.forEach(function (Pageviews) {
          m[d.Date][Pageviews] =
            parseInt(m[d.Date][Pageviews]) + parseInt(d[Pageviews]);
        });
        m[d.Date].count += 1;
        return m;
      }, {});

      // Create new array from grouped data and compute the average
      return Object.keys(reduced).map(function (k) {
        const item = reduced[k];
        const itemAverage = whitelist.reduce(function (m, Pageviews) {
          m[Pageviews] = parseInt(item[Pageviews]) / parseInt(item.count);
          return m;
        }, {});
        return {
          ...item, // Preserve any non white-listed keys
          ...itemAverage, // Add computed averege for whitelisted keys
        };
      });
    }
    var AveragePagePerView = JSON.stringify(
      getGroupedData(dataArray, ["Pageviews"]),
      null,
      2
    );
    //  console.log(AveragePagePerView);

    /*
    console.log(
      "Date=",
      AveragePagePerView.Date,
      "AveragePage=",
      AveragePagePerView.Pageviews
    );
*/
    console.log("CSV file successfully processed");
  });
