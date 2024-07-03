# Roadmap

Upcoming releases aim to focus on (in rough order of implementation) the following...

Note that this is subject to change as everything changes quickly these days, doesn't it!

## To Do

- [ ] ENV VAR inclusion - When loading environment variables and properties, allow already loaded environment variables to be included in an environment variable to allow for additive environment variables
- [ ] Add Set environment variable command - can set in memory, or set in properties file for command / plugin, in app env file, in home dir env file, or in cwd env file
- [ ] Downloadable Plugins - Plugin to download other plugins from the internet
- [ ] Plugin repositories - Define plugin repositories - move some plugins to this
- [ ] Batch Plugin - Run batch of commands sequentially
- [ ] Add python to languages list - include use of conda projects
- [ ] package.json option for node.js plugin so auto-install can use specific versions
- [ ] Storage plugin - use local database to store / retrieve data
- [ ] Call between plugins - Make a call to another plugin's command to return information
- [ ] Plugin dependencies - allow plugin to specify dependencies (other plugins) to install before it is able to be used - auto-install feature?
- [ ] API plugin / hooks - Add very simple optional authentication
- [ ] Web Site - Add simple optional authentication
- [ ] Better examples / README / Video demo
- [ ] Instructions for accessing the project from outside of home network
- [ ] Command Memory / Interrogation (e.g. search in history for command)
- [ ] Simple LLM agent implementation - use [crewAI](https://docs.crewai.com/) / ChatGpt + [Ollama](https://docs.crewai.com/how-to/LLM-Connections/#crewai-agent-overview) to start with
- [ ] Create chatblox commands as [crewAI commands](https://docs.crewai.com/core-concepts/Tools/#creating-your-own-tools) (and vice versa)
- [ ] Projects - Include Project directories that can be used for other purposes - initially can define git information but could also use to edit projects, include plugins as projects etc.
- [ ] Create installable native version that can run using Electron + system process
- [ ] Simple Kanban board (have version working now but not integrated)
- [ ] Timed triggers (e.g. to check for things regularly and enact a command)
- [ ] Run code based on LLM input - package as a command if it works ok
- [ ] Split API from rest of logic so could invoke logic in other ways (potentially)
- [ ] Simple mail client interrogation - wait for a mail with a specific configuration and then trigger a command
- [ ] MemGPT (or similar) integration linked to history
- [ ] Integrate Open Interpreter commands / Chatblox commands
- [ ] Very simple static web site generator as a plugin - probably use node next.js doc project as inspiration
- [ ] Repo created for Chatblox web site using static site generator as PoC
- [ ] Docker container implementation - simple Dockerfile
- [ ] Develop initial pipeline process for releasing Chatblox
- [ ] Instructions on implementation on cloud infrastructure - e.g. AWS / Azure
- [ ] Test cases defined and used for pipeline

## Done

- [x] Initial Release - v0.0.1
- [x] Plugin MVP - Creating locally created 'Plugins' to include in ChatBlox - v.0.0.3

Use at your own risk. It really is very early days!
