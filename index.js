//use const instead of let
const { writeFile } = require("fs");
const { join } = require("path");

//all 3 packages have vulerbilties
// let request = require("request"); //deprecated package use axios instead
const axios = require("axios");
const mergeImg = require("merge-img");
const argv = require("minimist")(process.argv.slice(2));

let {
  greeting = "Hello",
  who = "You",
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
} = argv;

//to-do: refactor - dont need obj, redundant

let firstReq = {
  // https://cataas.com/cat/says/Hi%20There?width=500&amp;height=800&amp;c=Cyan&amp;s=150
  //Use template literal instead -> modern ES6
  url: `https://cataas.com/cat/says/${greeting}?width=${width}&height=${height}&color=${color}&s={size}`,
  encoding: "binary",
};

let secondReq = {
  url: `https://cataas.com/cat/says/${who}?width=${width}&height=${height}&color=${color}&s={size}`,
  encoding: "binary",
};

const fetchPhotos = async (photo1, photo2) => {
  try {
    return await Promise.all([axios.get(photo1.url), axios.get(photo2.url)]);
  } catch {
    throw Error("Promise failed");
  }
};

// console.log(fetchPhotos(firstReq, secondReq));
fetchPhotos(firstReq, secondReq).then((data) => {
  // console.log(data);
  const [firstBody, secondBody] = data;

  console.log("typeof firstBody.data: ", typeof firstBody.data);
  // const test = Buffer.from(firstBody.data);
  // console.log(12, typeof test, test);
  // console.log(1, firstBody);

  //________

  // { src: new Buffer(firstBody, "binary"), x: 0, y: 0 },
  // { src: new Buffer(secondBody, "binary"), x: width, y: 0 },
  mergeImg([
    { src: Buffer.from(firstBody.data), x: 0, y: 0 }, //offsetY
    { src: Buffer.from(secondBody.data), x: width, y: 0 },
  ]).then((img) => {
    img.getBuffer("image/jpeg", (err, buffer) => {
      if (err) {
        console.log(err);
      }
      const fileOut = join(process.cwd(), `/cat-card.jpg`);
      writeFile(fileOut, buffer, "binary", (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("The file was saved!");
      });
    });
  });
});
