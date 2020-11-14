const csvFilePath = "Analytics-20201001-20201031.csv";
const csv = require("csvtojson");
var groupBy = require("json-groupby");
csv()
  .fromFile(csvFilePath)
  .then((jsonObj) => {
    var dataArray = [];
    var keys = Object.keys(jsonObj);
    keys.forEach(function (key) {
      dataArray.push(jsonObj[key]);
    });
    // console.log(dataArray);
    var groupedByDate = groupBy(dataArray, ["Date"], ["Pageviews"]);
    //console.log(groupedByDate["20201001"].Pageviews);
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    //    var as = 0;
    //  as = as + parseInt(groupedByDate["20201001"].Pageviews[0]);
    // console.log(as);

    for (var i in groupedByDate) {
      var sum = 0;
      var count = 0;
      // console.log("i", i);
      for (var j in groupedByDate[i].Pageviews) {
        count = count + 1;
        sum = sum + parseInt(groupedByDate[i].Pageviews[j]);
        //  console.log("j", j);
        //console.log(groupedByDate[i].Pageviews[j]);
      }
      console.log("Date", groupedByDate[i], "Count", count, "Sum", sum);
    }
  });
