const { EmbedBuilder } = require("discord.js");

module.exports = {
  callback: async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const embed = new EmbedBuilder()
      .setColor("#393E46")
      .setTitle("All commands")
      .addFields(
        {
          name: "/rps",
          value: `Play rock paper and scissors with another player.`,
          inline: false,
        },
        { name: "/opgg", value: `Look up LoL player info.`, inline: false },
        {
          name: "/play",
          value: `Play Spotify music (track, album or playlist).`,
          inline: false,
        }
      )
      .setFooter({
        text: "Built by Ricky",
        iconURL: "https://img.icons8.com/avantgarde/100/discord-logo.png",
        url: "https://meet-ricky.netlify.app/",
      });

    await interaction.reply({
      content: "",
      embeds: [embed],
      components: [],
    });
  },
  data: {
    name: "help",
    description: "Show all commands.",
  },
};
