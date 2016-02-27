

<p align="center">
  <img align="center" src="http://i.imgur.com/kVhbYz1.jpg" width="300" height="300">
</p>

# Sark

Sark is an application that helps you build an XCode project in your Macbook/iMac from any OS without the use of any applications such as Team Viewer.

#WARNING: THIS IS UNDER DEVELOPMENT, DO NOT USE! (We are open for PR's though)

## What does Sark needs to run?

- [XCPretty](https://github.com/supermarin/xcpretty)
- [Node/NPM](https://nodejs.org/en/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) with [cached credentials](https://help.github.com/articles/caching-your-github-password-in-git/)

## How to?

### Use

- [Download the source code](https://github.com/lorenzopicoli/Sark/archive/master.zip)
- Uncompress the downloaded zip
- Open terminal and [navigate to the folder created](http://stackoverflow.com/questions/9547730/how-to-navigate-to-to-different-directories-in-the-terminal-mac)
- Type: npm install
- Type: gulp run

This should make you up and running for working on local networks. You can also make the server available over the internet.

### Test

- Mocha
- Istanbul

```javascript
> npm install
> gulp test
```

### Run the server as development

- Babel
- Copy package.json to /dist
- Copy public folder to /dist
- Lint
- Nodemon

```javascript
> npm install
> gulp dev
```

### Prepare for a commit

- Lint
- Test
- Clean dist folder

```javascript
> npm install
> gulp commit
```



