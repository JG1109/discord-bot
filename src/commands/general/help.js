module.exports = {
  data: {
    name: "help",
    description: "Show all commands.",
    callback: (client, interaction) => {
      if (!interaction.isChatInputCommand()) return;
      interaction.reply("Function under development...");
    },
  },
};
