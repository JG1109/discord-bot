const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonInteraction,
  ComponentType,
} = require("discord.js");

module.exports = {
  callback: async (client, interaction) => {
    // check if user selected gender from the choices
    const choice = interaction.options.getString("for-what");

    let boy_count = 0;
    let girl_count = 0;

    if (choice === "gender") {
      const embed = new EmbedBuilder()
        .setColor("#393E46")
        .setTitle("Are you a boy or a girl?")
        .setDescription(`🩵 - Boy: ${boy_count}\n🩷 - Girl: ${boy_count}`);

      const button_0 = new ButtonBuilder()
        .setCustomId("Boy")
        .setLabel("🩵")
        .setStyle(ButtonStyle.Secondary);
      const button_1 = new ButtonBuilder()
        .setCustomId("Girl")
        .setLabel("🩷")
        .setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents([button_0, button_1]);

      const reply = await interaction.reply({
        content: "",
        embeds: [embed],
        components: [row],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "Boy") {
          embed.setDescription(
            `🩵 - Boy: ${++boy_count}\n🩷 - Girl: ${girl_count}`
          );
          await interaction.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        }
        if (interaction.customId === "Girl") {
          embed.setDescription(
            `🩵 - Boy: ${boy_count}\n🩷 - Girl: ${++girl_count}`
          );
          await interaction.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
        }
      });

      /* const userChoice = await reply.awaitMessageComponent({
        time: 6_000,
      });

      switch (userChoice.customId) {
        case "Boy":
          embed.setDescription(
            `🩵 - Boy: ${++boy_count}\n🩷 - Girl: ${girl_count}`
          );
          await userChoice.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
          break;
        case "Girl":
          embed.setDescription(
            `🩵 - Boy: ${boy_count}\n🩷 - Girl: ${++girl_count}`
          );
          await userChoice.update({
            content: "",
            embeds: [embed],
            components: [row],
          });
          break;
      } */
    } else if (choice === "games playing") {
      function bytesToBase64(bytes) {
        const binString = String.fromCodePoint(...bytes);
        return btoa(binString);
      }

      const games = {
        LoL: 0,
        Valorant: 0,
        TFT: 0,
        Palworld: 0,
        LethalCompany: 0,
        Minecraft: 0,
        GenshinImpact: 0,
        Apex: 0,
        Overwatch: 0,
      };

      const emojis = {};

      const description = [];
      for (const game in games) {
        const emoji = client.emojis.cache.find((emoji) => emoji.name === game);
        emojis[game] = emoji;
        description.push(`${emoji} - ${game}: ${games[game]}`);
      }

      const embed = new EmbedBuilder()
        .setColor("#393E46")
        .setTitle("What games are you playing?")
        .setDescription(description.join("\n\n"));

      const buttons = [];
      for (const game in games) {
        const emojiRef = "<:" + game + ":" + emojis[game].id + ">";
        const button = new ButtonBuilder()
          .setCustomId(game)
          .setEmoji(emojiRef)
          .setStyle(ButtonStyle.Secondary);
        buttons.push(button);
      }

      const row = new ActionRowBuilder().addComponents(buttons);

      const reply = await interaction.reply({
        content: "",
        embeds: [embed],
        components: [
          {
            type: 1,
            components: [
              buttons[0],
              buttons[1],
              buttons[2],
              buttons[3],
              buttons[4],
            ],
          },
          {
            type: 1,
            components: [buttons[5], buttons[6], buttons[7], buttons[8]],
          },
        ],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      collector.on("collect", async (interaction) => {
        const game = interaction.customId;
        games[game]++;
        const description = [];
        for (const game in games) {
          const emoji = client.emojis.cache.find(
            (emoji) => emoji.name === game
          );
          description.push(`${emoji} - ${game}: ${games[game]}`);
        }
        embed.setDescription(description.join("\n\n"));
        await interaction.update({
          content: "",
          embeds: [embed],
          components: [
            {
              type: 1,
              components: [
                buttons[0],
                buttons[1],
                buttons[2],
                buttons[3],
                buttons[4],
              ],
            },
            {
              type: 1,
              components: [buttons[5], buttons[6], buttons[7], buttons[8]],
            },
          ],
        });
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
