require('dotenv').config();

const fs = require('fs');
const WebStore = require('chrome-webstore-upload');
const zipFolder = require('zip-folder');

// For zipping build folder
const zipBuild = () => {
  return new Promise(function(resolve, reject) {
    zipFolder('./build', './build.zip', function(err) {
      if (err) {
        reject(err);
      } else {
        resolve('Zipped to build.zip');
      }
    });
  });
};

const webStoreClient = WebStore({
  extensionId: process.env.CHROME_EXTENSION_ID,
  clientId: process.env.CHROME_CLIENT_ID,
  clientSecret: process.env.CHROME_CLIENT_SECRET,
  refreshToken: process.env.CHROME_REFRESH_TOKEN
});

console.log('Fetching token...');
webStoreClient
  .fetchToken()
  .then(async (token) => {
    if (!process.env.CHROME_EXTENSION_ID) {
      console.log('Publishing a new extension...');
      webStoreClient
        .publish('default', token)
        .then((res) => {
          webStoreClient.extensionId = res.item_id;
          console.log(res);
          console.log(`Your new extension id is ${res.item_id}`);
          console.log('Please paste it into your .env');
        })
        .catch((err) => console.error(err));
    }

    zipBuild()
      .then(async (message) => {
        console.log(message);
        const file = fs.createReadStream('./build.zip');
        console.log('Uploading...');
        try {
          const res = await webStoreClient.uploadExisting(file, token);
          if (res.uploadState === 'FAILURE') {
            console.error(res);
            return console.error('Upload failed...');
          }
          console.log('Publishing...');
          console.log(res);
          await webStoreClient.publish('default', token);
        } catch (err) {
          console.error(err);
        }
      })
      .catch((err) => console.log(err));
  })
  .catch((err) => console.error(err));
