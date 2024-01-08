require("dotenv").config({ path: ".env" });
const { Client, IntentsBitField } = require("discord.js");

const client = new Client({
  // declare intents for authorized events
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`> bot ${c.user.tag} is online`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content === "hello") {
    message.reply("hello");
  }
});

client.login(process.env.TOKEN);
