# How to contribute to Votum

## Do you want to create a patch or a feature?

Sounds a great idea! Please, create a Pull Request describing the issue/enhancement as detailed as possible.

## Running Votum locally:

Here is the step-by-step if you want to execute the project locally:

### Crate the Bot

1. Copy the file `.env.example` to `.env`, that's where you're going to store the Bot Token and Client ID generated in the following steps.
1. [Create an App](https://discord.com/developers/docs/getting-started) and add a bot user to it.
   1. You will need to allow `SERVER MEMBERS INTENT` and `MESSAGE CONTENT INTENT` intents for the bot
1. When you generate the **bot token**, copy it and paste in the `TOKEN` key in the `.env` file (created in step 1)
1. From the OAuth general page, copy the **Client ID** and paste in the `OWNER` key in the `.env` file
1. In order to install the bot in your server, modify the follow URL and access it:
   1. `https://discord.com/api/oauth2/authorize?client_id=<ClientID>&permissions=266370&scope=bot`
1. Or go to OAuth2 URL Generator page:
   1. Check `bot` for Scope
   2. Check Manage Roles, Manage Nicknames, Read Messages/View Channels, Send Messages for Bot Permissions
   3. You can access the generate URL to install the bot in a server

### Run Project

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the server
