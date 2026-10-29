const fs = require("fs");

const quote = "No beauty shines brighter than that of a good heart 😊";

fs.writeFile("./awesome.html", quote, (err) => {
  if (err) {
    console.log(err);
  }

  console.log("Completed Writing");
});

const quote2 = "Live more, worry less 😄😊";
// Task 1.1
// Create the below files with quote2 as the content
// /backup/
// text-1.html
// text-2.html
// text-3.html
// ....
// text-10.html
