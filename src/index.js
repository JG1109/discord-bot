require("dotenv").config({ path: ".env" });
const { Client, IntentsBitField } = require("discord.js");
const mongoose = require("mongoose");
const eventHandlers = require("./handlers/eventHandlers");

const client = new Client({
  // declare intents for authorized events
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_CONNECTION_STR);
    console.log("> connected to db");

    eventHandlers(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log("error with db");
  }
})();
