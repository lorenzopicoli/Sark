

<p align="center">
  <img align="center" src="/src/public/assets/img/logo.png" width="300" height="300">
</p>

# Sark
[![Build Status](https://travis-ci.org/lorenzopicoli/Sark.svg?branch=master)](https://travis-ci.org/lorenzopicoli/Sark) [![Coverage Status](https://coveralls.io/repos/github/lorenzopicoli/Sark/badge.svg?branch=master)](https://coveralls.io/github/lorenzopicoli/Sark?branch=master)

Sark is an application that helps you build an XCode project in your Macbook/iMac from any OS without the use of any applications such as Team Viewer.

## How to use?


You should always run

```javascript
npm install
```

right after download
### To test

- Mocha
- Istanbul

```javascript
gulp test
```


### To run the server as development

- Babel
- Copy package.json to /dist
- Copy public folder to /dist
- Lint
- Nodemon

```javascript
gulp dev
```

### To prepare for a commit

- Lint
- Test
- Clean dist folder

```javascript
gulp commit
```



