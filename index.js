// use const instead of let
const { writeFile } = require("fs");
const { join } = require("path");

// let request = require("request"); //deprecated package use axios as alternative
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

// create function to reduce redundant code of requests
const createPhotoRequest = (text) => {
  // refactor to use axios + return arrayBuffer responseType
  return axios.get(
    // https://cataas.com/cat/says/Hi%20There?width=500&amp;height=800&amp;c=Cyan&amp;s=150
    `https://cataas.com/cat/says/${text}?width=${width}&height=${height}&color=${color}&s={size}`,
    { responseType: "arraybuffer" }
  );
};

// use async to fetch both photos without blocking
const fetchPhotos = async () => {
  try {
    return await Promise.all([
      createPhotoRequest(greeting),
      createPhotoRequest(who),
    ]);
  } catch {
    throw Error("Promise failed");
  }
};

const savePhoto = async (img) => {
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

  // @@@@
  // @@ Note: I would refactor to Async/Await but getBufferAsync doesn't work in the version
  // @@ of jimp used by merge-img, due to the scope of the exercise, I left as promise chaining.
  // @@@@@
  // const imgBuffer = await img.getBufferAsync("image/jpeg");
  // const fileOut = join(process.cwd(), `/cat-card.jpg`);
  // writeFile(fileOut, imgBuffer, "binary");
  // savePhoto(img);
};

const mergePhotos = async () => {
  const [firstBody, secondBody] = await fetchPhotos();

  const img = await mergeImg([
    { src: firstBody.data, x: 0, y: 0 },
    { src: secondBody.data, x: width, y: 0 },
  ]);

  savePhoto(img);
};

mergePhotos();
