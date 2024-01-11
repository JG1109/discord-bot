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
  callback: async (client, interaction) => {
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
        components: [row],
      });

      // collect player 2 button cicks
      const targetUserInteraction = await reply
        .awaitMessageComponent({
          filter: (i) => i.user.id === targetUser.id,
          time: 30_000,
        })
        .catch(async (error) => {
          embed.setDescription(
            `Game over. ${targetUser} did not respond in time.`
          );
          await reply.edit({ embeds: [embed], components: [] });
        });
      if (!targetUserInteraction) return;
      const targetUserChoice = choices.find(
        (choice) => choice.name === targetUserInteraction.customId
      );
      await targetUserInteraction.reply({
        content: `You picked ${targetUserChoice.name + targetUserChoice.emoji}`,
        // ephemeral: true
      });

      // collect player 1 button clicks
      embed.setDescription(`It's currenlty ${interaction.user}'s turn.`);
      await reply.edit({
        content: `${interaction.user} it's your turn now.`,
        embeds: [embed],
      });
      const initialUserInteraction = await reply
        .awaitMessageComponent({
          filter: (i) => i.user.id === interaction.user.id,
          time: 30_000,
        })
        .catch(async (error) => {
          embed.setDescription(
            `Game over. ${interaction.user} did not respond in time.`
          );
          await reply.edit({ embeds: [embed], components: [] });
        });
      if (!initialUserInteraction) return;
      const initialUserChoice = choices.find(
        (choice) => choice.name === initialUserInteraction.customId
      );

      let result;
      if (targetUserChoice.beats === initialUserChoice.name) {
        result = `${targetUser} won!`;
      }
      if (targetUserChoice.name === initialUserChoice.beats) {
        result = `${interaction.user} won!`;
      }
      if (targetUserChoice.name === initialUserChoice.name) {
        result = "It was a tie!";
      }
      embed.setDescription(
        `${targetUser} picked ${
          targetUserChoice.name + targetUserChoice.emoji
        }\n${interaction.user} picked ${
          initialUserChoice.name + initialUserChoice.emoji
        }\n\n${result}`
      );

      await reply.edit({ embeds: [embed], components: [] });
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
