module.exports = {
  callback: (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    interaction.reply("Function under development...");
  },
  data: {
    name: "help",
    description: "Show all commands.",
  },
};
