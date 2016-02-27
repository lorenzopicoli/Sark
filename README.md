

<p align="center">
  <img align="center" src="http://i.imgur.com/kVhbYz1.jpg" width="300" height="300">
</p>

# Sark

Sark is an application that helps you build an XCode project in your Macbook/iMac from any OS without the use of any applications. All you need is to setup your Mac and open a browser anywhere!


The goal of this application is not to replace Xcode or to compete with Macbooks, we aim to help young programmers who have an iMac or know someone who does and can't afford a Macbook, we aim to help those who for some reason need to edit and test Xcode projects, but forgot their Macbook at home.
Using Sark those people will be able to edit their project using a native application like Sublime Text using all of their computer speed and confort without needing to rely on a fast internet connection to remote access their Macs.

##How does it works?

If you follow along the usage instructions you'll notice that Sark is a Node.js server that is suppose to run on a Mac machine and be accecible through the internet. The server will execute commands and use Socket.io to communicate with the client.

#WARNING: Even though Sark is usable it's under heavy development, you can help by reporting any issue (see FAQ).

## What does Sark needs to run?

- A Mac running OSX with Xcode installed (duh!)
- [XCPretty](https://github.com/supermarin/xcpretty)
- [Node/NPM](https://nodejs.org/en/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) with [cached credentials](https://help.github.com/articles/caching-your-github-password-in-git/)

## How to?

### Use

#### Downloading

- [Download the source code](https://github.com/lorenzopicoli/Sark/archive/master.zip)
- Uncompress the downloaded zip
- Open terminal and [navigate to the folder created](http://stackoverflow.com/questions/9547730/how-to-navigate-to-to-different-directories-in-the-terminal-mac)

#### Configuring

- Leave the terminal window open, but also open Finder
- Navigate to the created folder (uncompressed)
- Open the file "config.json". You can open it with any text editor.
- Change "123" to your desired password
- Navigate to /src/public/assets/js/ and open "script.js", we'll use that in a moment.

#### Make your Mac accessible from anywhere

TODO: Insert NoIP configuration here

#### Running the server
- Type: npm install


This should get you up and running!

### Run test

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

### FAQ

#### I found a bug, what should I do?
- Can you reproduce the bug?
- Do you know how to fix it?
- If you do know to fix create a pull request. If you don't create a issue on Github.
- Do you need more help? Head over to our chat.

#### Why don't you use Travis CI?
- Sark uses a lot of specific stuff and using Travis was being more of a problem than a solution

#### But don't you use Coveralls?
- Run the tests locally and you'll see the coverage status.



