

<p align="center">
  <img align="center" src="http://i.imgur.com/kVhbYz1.jpg" width="300" height="300">
</p>


# Sark

Sark is an application that helps you build an XCode project in your Macbook/iMac from any OS without the use of any applications. All you need is to setup your Mac and open a browser anywhere!


The goal of this application is not to replace Xcode or to compete with Macbooks, we aim to help young programmers who have an iMac or know someone who does and can't afford a Macbook, we aim to help those who for some reason need to edit and test Xcode projects, but forgot their Macbook at home.
Using Sark those people will be able to edit their project using a native application like Sublime Text using all of their computer speed and confort without needing to rely on a fast internet connection to remote access their Macs.

##How does it works?

If you follow along the usage instructions you'll notice that Sark is a Node.js server that is suppose to run on a Mac machine and be accecible through the internet. The server will execute commands and use Socket.io to communicate with the client.

## What does Sark needs to run?

- A Mac running OSX with Xcode installed (duh!)
- [XCPretty](https://github.com/supermarin/xcpretty)
- [Node/NPM](https://nodejs.org/en/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) with [cached credentials](https://help.github.com/articles/caching-your-github-password-in-git/)

## How to use?

#### Downloading

- [Download the source code](https://github.com/lorenzopicoli/Sark/archive/master.zip)
- Uncompress the downloaded zip
- Open terminal and [navigate to the folder created](http://stackoverflow.com/questions/9547730/how-to-navigate-to-to-different-directories-in-the-terminal-mac)

#### Running the server

- Leave the terminal window open, but also open Finder
- Navigate to the created folder (uncompressed)
- Open the file "config.json". You can open it with any text editor.
- Change "123" to your desired password
- Type on terminal: 
```javascript
  gulp dev
```

Now you server is up and running. If you go to localhost:3000 you should get the Sark's homepage. But you can't access from anywhere, so you'll need to...

#### Make your Mac accessible from anywhere

I like to use NoIP for a easy (and free) way to remember my iMac IP address.
- [Create a NoIP account](https://www.noip.com/)
- [Download the OSX client](https://www.noip.com/download?page=mac)
- [Add a new host](https://www.noip.com/members/dns/host.php) (your Mac). (Almost) Like this:

<p align="center">
  <img align="center" src="http://i.imgur.com/4479ltS.png">
</p>

- Open the NoIP app that you've downloaded and go to the hosts tab
- Select the host you've created before
- [Configure your router to do port fowarding](http://www.noip.com/support/knowledgebase/general-port-forwarding-guide/)

This should get you up and running!

## I want to contribute!
Thank you, here are some stuff that might help you:

#### Run test

- Mocha
- Istanbul

```javascript
> npm install
> gulp test
```

#### Run the server as development (the same as running the server for now)

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
