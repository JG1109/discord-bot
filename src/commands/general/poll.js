const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");

module.exports = {
  callback: async (client, interaction) => {
    // check if user selected gender from the choices
    const choice = interaction.options.getString("for-what");

    if (choice === "gender") {
      const embed = new EmbedBuilder()
        .setColor("#393E46")
        .setTitle("Are you a boy or a girl?")
        .setDescription(`🩵 - Boy\n🩷 - Girl`);

      const reply = await interaction.reply({
        content: "",
        embeds: [embed],
        components: [],
      });

      // fetch the message
      const message = await interaction.fetchReply();

      // react to the message
      await message.react("🩵");
      await message.react("🩷");
    } else if (choice === "games playing") {
      const embed = new EmbedBuilder()
        .setColor("#393E46")
        .setTitle("1")
        .setDescription(`1`);

      const reply = await interaction.reply({
        content: "",
        embeds: [embed],
        components: [],
      });
    }
  },
  data: {
    name: "poll",
    description: "Create a poll.",
    options: [
      {
        name: "for-what",
        description: "What poll are you interested in?",
        required: true,
        choices: [
          { name: "gender", value: "gender" },
          { name: "games playing", value: "games playing" },
        ],
        type: ApplicationCommandOptionType.String,
      },
    ],
  },
};
