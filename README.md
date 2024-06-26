# Chatblox

![Chatblox Logo](./doc/assets/chatblox_icon.webp)

## Links

* [README page on github](https://github.com/storizzi/chatblox/README.md)
* [License Details](./LICENSE.md)
* [Command Summary](./doc/LLM_SUMMARY_commands.md) - LLM Generated
* [Release Notes](./release/RELEASE.md)
* [Roadmap](./doc/ROADMAP.md)

## Introduction

Chatblox is an early work-in-progress, with the aim of producing something like a chat experience in the browser to access a variety of tooling that helps me get things done in a more formalized plug-in kind of a way, but being able to use a mixed variety of scripts and tools to help me.

This is in an effort to try to bring back a lot of the productivity tools I use to my computer, so I am less reliant on external services, and so I know I have a copy of the data I own in one place (on my computer) rather than floating around a hundred different cloud locations. And to automate a lot of the tasks (many of which would benefit from joining up some of these dispirate sources of information) once I've got enough together to be useful.

## Intentions for project

The long-term goal is to build a bunch of tools I can use on different devices to help me in my day-to-day life, and work out ways over time to use these tools, so that I can hand this work off to agents

I'm starting basic, but over time I'm aiming to bring in other projects I'm working on such as:

* Managing working projects on my computer (mostly git-based)
* Managing documentation on my computer (in various forms - some of it held on the cloud by default - e.g. in Apple Notes and Evernote). See my project for export Apple Notes - that'll probably be one of the first things I'll bring in.
* Generating documentation from various data in various formats - e.g. blog post, social media post, book (e.g. PDF / Kindle book), web page etc. - see my Storizzi project for an example of how dispirate data sources can be brought together to generate documentation.
* Managing my Kanbans / To-Dos / Journal
  * I have a Trello-based working version of a system of working which aims to focus everything onto just a couple of lists (one for stuff to do today and the other for stuff destined for an automated daily journal).
  * I'm also looking to include another version I'm working on, perhaps as an embedded component - no reason all of the output has to be text-based. That's early stages too, but I've got it working on web and as an iOS app so far albeit with no authentication yet!!!
* One other area I've been working on is Email automation. I've got a basic PoC working which uses Thunderbird email client, and then leverages the fact that it uses standard mailbox files so you don't have all the configuration angst with things like gmail. This seems to work ok, but again - early days. I've just about got it to do a simple search through emails, but it needs a lot more work
  * I've got some old mailbox files that would be nice to refer to as and when needed too without actually being active
* Searchability
  * Makes sense to index the data for easy data retrieval. Maybe Solr as I know that well. Maybe something a bit more lightweight.
  * 
* LLM integration - initially very basic local LLM integration most likely using Ollama (as I'm finding that really easy to use), simple ChatGPT integration, and Langchain integration - with a view to utilising the various other locally stored knowledge as extended memory - e.g. using something like MemGPT or using local / online search tools. Also using plugins as tools that agents can be asked to use. Also some thought of building agents to help work on projects on my computer, or create their own projects based on guidelines. There are so many approaches to this right now, I'll be tinkering to start with, probably using tools like AutoGPT, LangGraph and CrewAI
* Form factors
  * iOS and Android apps so I can run the front end from a mobile, and utilise various tools and telemetry from the devices. Earlier I do that the better because it will make it clearer how to best do plugins that can work on different devices
  * Desktop versions for Windows, Linux and MacOS so
  * Work out skills for alexa, siri, and google assistant to see how these could integrate in to fire off commands too
  * Chatblox in VR. Wonder what that would look like?
* Plugin architecture to bring in external tools - installing them, uninstalling them etc
  * Would be nice to be able to be able to tweak (rather than duplicate) plugins to have special abilities for different devices

So this will start looking a bit like other LLM agent solutions popping up everywhere, except I'm looking to work from a tools-first approach. Work out what tools you would want to use to do the job manually and use them from a chat style interface. Then start finding ways to automate everyday tasks that can be run by LLMs over time, so you are handing off more and more of the drudge stuff.

The current iteration is very much with a mac in mind, although it should work fine on Linux and WSL (for Windows) as well. I just haven't tested it yet. Feel free to do so and give feedback.

I have yet another concept that I have never found a good way of implementing based on developing tooling based on the user's current overlap of contexts. I parked this some years ago, but I have a feeling that once we have this in place, it's going to become more helpful at joining up the LLM side of things, the tooling, and what data is relevant to expose (thus helping with the restricted context window you get with most LLMs). Not quite the 'working memory' model that MemGPT has, but possibly something that can better work out what data is relevant in different contexts.

No idea of timescales right now. I have created a big heap of PoCs, and this is where I start gluing them together. So please be patient.

At the moment, the only people likely to be vaguely interested in this are those with some development skills in node.js. Feel free to play, and give me some feedback.

[![Simple Chatblox Demo](./doc/assets/chatblox-eg-video-still-frame.png)](https://github.com/storizzi/chatblox/assets/26940113/eb5a1d77-80d7-467c-a805-254e23cb4e79)

# Installation / Start Up

* [Command Summary](./doc/LLM_SUMMARY_commands.md) - LLM Generated

The types of commands cover shell, node.js

`cd node/src`

Set up using using `npm i`

Start up using `npm start`

If you have chrome installed, a browser window will be opened to (by default): http://localhost:3000

The default port is 5001. Set the port number in the .env file or pass as an environment variable from the environment you are calling the script from - see `.env-sample` file as an example (which you would rename to .env to use it)