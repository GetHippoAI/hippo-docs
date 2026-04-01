---
slug: /
sidebar_position: 1
title: Introduction
---

# Hippo Developer Documentation

Hippo is an AI-powered personal assistant platform available on WhatsApp, Telegram, and Web. It helps users manage their daily tasks, reminders, notes, and more through natural language conversations.

## What are Plugins?

Plugins extend Hippo with new capabilities. Each plugin provides **AI tools** that the assistant can use to perform actions on behalf of users. When a user asks Hippo to do something, the AI analyzes the request and decides which tools to invoke.

For example:
- The **Google Calendar** plugin adds tools for creating and managing calendar events
- The **Price Tracker** plugin adds tools for monitoring product prices
- The **Weather** plugin adds tools for fetching weather forecasts

## How Plugins Work

1. **Users install plugins** from the Hippo marketplace
2. **Plugins register tools** with the AI assistant
3. **AI decides when to use tools** based on user messages
4. **Handlers execute the tool logic** and return results to the user

## Plugin Categories

| Category | Description | Examples |
|----------|-------------|----------|
| Integration | Connect external services | Google Calendar, Gmail, Slack |
| Productivity | Task and note management | Todoist, Notion |
| Finance | Money and price tracking | Price Tracker, Expense Tracker |
| Social | Social media tools | Instagram Saver, Twitter |
| Utility | General-purpose helpers | Weather, Calculator |

## Getting Started

Ready to build your first plugin? Head to the [Getting Started](/plugins/getting-started) guide.

## Official Plugins

Hippo ships with several official plugins maintained by the Hippo team:

- [Google Calendar](/official-plugins/google-calendar) - Sync reminders and events
- [Gmail](/official-plugins/gmail) - Read and draft emails
- [Price Tracker](/official-plugins/price-tracker) - Track product prices
- [Weather](/official-plugins/weather) - Get weather forecasts
- [Social Media Saver](/official-plugins/social-media) - Save content from social platforms
