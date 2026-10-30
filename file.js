import fs from "node:fs";

// const quote = "No beauty shines brighter than that of a good heart 😊";

// fs.writeFile("./awesome.html", quote, (err) => {
//   if (err) {
//     console.log(err);
//   }

//   console.log("Completed Writing");
// });

function task1() {
  const quote2 = "Live more, worry less 😄😊";

  for (let i = 1; i <= 10; i++) {
    fs.writeFile(`./backup/test-${i}.html`, quote2, (err) => {
      if (err) {
        console.log(err);
      }

      console.log(`Completed Writing - ${i}`);
    });
  }
}

task1();

function task2(noOfFiles) {
  const quote2 = "Live more, worry less 😄😊";

  for (let i = 1; i <= noOfFiles; i++) {
    fs.writeFile(`./backup/test-${i}.html`, quote2, (err) => {
      if (err) {
        console.log(err);
      }

      console.log(`Completed Writing - ${i}`);
    });
  }
}

const [, , noOfFiles] = process.argv;
task2(+noOfFiles);
// Task 1.1
// Create the below files with quote2 as the content
// /backup/
// text-1.html
// text-2.html
// text-3.html
// ....
// text-10.html

// Task 1.2
// node file.js 30 -> 30 files to be created | text-1.html ...  text-30.html
