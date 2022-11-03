//use const instead of let
const { writeFile } = require("fs");
const { join } = require("path");

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

let firstReq = {
  // https://cataas.com/cat/says/Hi%20There?width=500&amp;height=800&amp;c=Cyan&amp;s=150
  //Use template literals instead -> modern ES6
  url: `https://cataas.com/cat/says/${greeting}?width=${width}&height=${height}&color=${color}&s={size}`,
  encoding: "binary",
};

let secondReq = {
  url: `https://cataas.com/cat/says/${who}?width=${width}&height=${height}&color=${color}&s={size}`,
  encoding: "binary",
};

//use async to fetch both photos without blocking
const fetchPhotos = async (photo1, photo2) => {
  try {
    return await Promise.all([
      axios.get(photo1.url, { responseType: "arraybuffer" }),
      axios.get(photo2.url, { responseType: "arraybuffer" }),
    ]).then((values) => {
      values.map((value) =>
        console.log(`Received response with status: ${value.status}`)
      );
      return values;
    });
  } catch {
    throw Error("Promise failed");
  }
};

fetchPhotos(firstReq, secondReq).then((data) => {
  const [firstBody, secondBody] = data;

  mergeImg([
    { src: firstBody.data, x: 0, y: 0 },
    { src: secondBody.data, x: width, y: 0 },
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
