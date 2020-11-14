var fs = require("fs");
var parse = require("csv-parse");
var async = require("async");

var inputFile = "Analytics-20201001-20201031.csv";
var dataArray = [];
var parser = parse({ delimiter: "," }, function (err, data) {
  async.eachSeries(data, function (line, callback) {
    // do something with the line
    doSomething(line).then(function () {
      // when processing finishes invoke the callback to move to the next one
      callback();
    });
  });
});
fs.createReadStream(inputFile)
  .pipe(parser)
  .on("data", (row) => {
    dataArray.push(row);
  })

  .on("end", () => {
    console.log(dataArray);
  });
