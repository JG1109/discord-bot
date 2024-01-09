require("dotenv").config({ path: ".env" });
const { Client, IntentsBitField } = require("discord.js");
const eventHandlers = require("./handlers/eventHandlers");

const client = new Client({
  // declare intents for authorized events
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandlers(client);

client.login(process.env.TOKEN);
