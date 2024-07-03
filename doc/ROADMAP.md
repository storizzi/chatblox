# Roadmap

Upcoming releases aim to focus on (in rough order of implementation) the following...

Note that this is subject to change as everything changes quickly these days, doesn't it!

## To Do

- [ ] Project MVP - Creating 'Projects' to link into ChatBlox - Basically like plugins but without need to conform to plugin specification - e.g. existing non-Chatblox projects - these could then be turned into plugins if required
- [ ] Add Set environment variable command - either global or for specific command
- [ ] Add python to languages list
- [ ] Split API from rest of logic
- [ ] API - Add simple optional authentication
- [ ] Web Site - Add simple optional authentication
- [ ] Better examples / README
- [ ] Instructions for accessing the project from outside of home network
- [ ] Plugin MVP - Link in projects from external repos and automating setup of a project / plugin
- [ ] Command Memory / Interrogation (e.g. search in history for command)
- [ ] Simple LLM agent implementation - use [crewAI](https://docs.crewai.com/) / ChatGpt + [Ollama](https://docs.crewai.com/how-to/LLM-Connections/#crewai-agent-overview) to start with
- [ ] Create chatblox commands as [crewAI commands](https://docs.crewai.com/core-concepts/Tools/#creating-your-own-tools) (and vice versa)
- [ ] Create installable native version that can run using Electron + system process
- [ ] Simple Kanban board (have version working now but not integrated)
- [ ] Timed triggers (e.g. to check for things regularly and enact a command)
- [ ] Run code based on LLM input - package as a command if it works ok
- [ ] Simple mail client interrogation - wait for a mail with a specific configuration and then trigger a command
- [ ] MemGPT (or similar) integration linked to history
- [ ] Integrate Open Interpreter commands / Chatblox commands
- [ ] Very simple static web site generator as a plugin - probably use node next.js doc project as inspiration
- [ ] Repo created for Chatblox web site using static site generator as PoC
- [ ] Docker container implementation - simple Dockerfile
- [ ] Develop initial pipeline process for releasing Chatblox
- [ ] Instructions on implementation on cloud infrastructure - e.g. AWS / Azure

## Done

- [x] Initial Release - v0.1
- [ ] Plugin MVP - Creating locally created 'Plugins' to include in ChatBlox - v.0.2

Use at your own risk. It really is very early days!
