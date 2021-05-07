# chongluadao-extension
An extension aims to detect phishing websites and warns the user. User can submit (report/rating) a website that to be considered as phishing site. The classification is done on the client side with one-time download of classifier model and auto updating.

Origin source code based on [Phishing Site Detector Plugin](https://github.com/picopalette/phishing-detection-plugin).

# What we are doing here
We modified the source code and implemented the additional features:

Frontend:
- Localization the UI (support Vietnamese language)
- Warning user accessing from the phishing sites
- The user is able to submit / report / rate the website
- Reputation icon for Google search page

Backend:
- Reporting API
- Enrich the dataset
- Traning / classifier model
- Admin dashboard for reviewing / approving the user reports


... and much more

# Testing
You can use the developer version with Chrome (or Chromium browser family), as just following this installation guide:
- Enter the URL: chrome://extensions/
- On the top right conner, turning on Developer mode
- Click Load unpacked and browser to the folder 'frontend'
- You might need to pin the plugin as well
- Ignore all the error, it' just a developement version
- Enjoy the protection

# Setup for local dev:
Run `npm i` to install dependecies
If not yet have `build` and or `build-firefox` directory, create them with `mkdir build` and or `mkdir build-firefox`
- To build for chrome, run `npm run build`
- To build for firefox, run `npm run build-firefox`. Then go into `build-firefox` directory and remove `incognito` rule from the `manifest.json`
