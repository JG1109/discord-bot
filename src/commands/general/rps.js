const {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} = require("discord.js");

const choices = [
  { name: "Rock", emoji: "🪨", beats: "Scissors" },
  { name: "Paper", emoji: "📄", beats: "Rock" },
  { name: "Scissors", emoji: "✂️", beats: "Paper" },
];

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      const targetUser = interaction.options.getUser("user");
      //   check if two players are the same
      if (interaction.user.id === targetUser.id) {
        interaction.reply({
          content: "You cannot play with yourself.",
          //   ephemeral: true,
        });
        return;
      }
      //   check if trying to play with bots
      if (targetUser.bot) {
        interaction.reply({
          content: "You cannot play with bots.",
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle("Rock Paper Scissors")
        .setDescription(`It's currently ${targetUser}'s turn.`)
        .setColor("Yellow")
        .setTimestamp(new Date());

      const buttons = choices.map((choice) => {
        return new ButtonBuilder()
          .setCustomId(choice.name)
          .setLabel(choice.name)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(choice.emoji);
      });

      const row = new ActionRowBuilder().addComponents(buttons);

      const reply = await interaction.reply({
        content: `${targetUser}, you have been challenged to a game of Rock Paper Scissors, by ${interaction.user}. To start playing, click one of the buttons below.`,
        embeds: [embed],
        components: row,
      });
    } catch (error) {
      console.log(`Error with /rps`);
      console.log(error);
    }
  },

  data: {
    name: "rps",
    description: "Play rock paper scissors with another user.",
    dm_permission: false,
    options: [
      {
        name: "user",
        description: "User you want to play with.",
        type: ApplicationCommandOptionType.User,
        required: true,
      },
    ],
  },
};
