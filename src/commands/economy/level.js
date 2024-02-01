const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} = require("discord.js");
const calculateLevelXP = require("../../utils/calculateLevelXP");
const Level = require("../../schemas/level");

const { Font, RankCardBuilder, BuiltInGraphemeProvider } = require("canvacord");
const { writeFileSync } = require("fs");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const mentionedUserId = interaction.options.getMentionable("user")?.value;
    const targetUserId = mentionedUserId || interaction.user.id;
    const targetUserObject = await interaction.guild.members.fetch(
      targetUserId
    );

    const fetchedLevel = await Level.findOne({
      guildId: interaction.guild.id,
      userId: targetUserId,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObject.user.tag} has no level.`
          : "You have no level."
      );
      return;
    }

    let allLevels = await Level.find({
      guildId: interaction.guild.id,
    }).select("userId xp level -_id");

    // sort the levels, handle the case where users have the same level
    allLevels = allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      }
      return b.level - a.level;
    });

    // get the current rank of the target user
    const targetUserRank =
      allLevels.findIndex((level) => level.userId === targetUserId) + 1;

    Font.loadDefault();

    const card = new RankCardBuilder()
      .setAvatar(targetUserObject.user.displayAvatarURL({ format: "png" }))
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXP(fetchedLevel.level))
      .setLevel(fetchedLevel.level)
      .setRank(targetUserRank)
      .setUsername(targetUserObject.user.username)
      .setDisplayName(targetUserObject.displayName)
      .setStatus(targetUserObject.presence.status)
      .setGraphemeProvider(BuiltInGraphemeProvider.FluentEmojiFlat);

    const image = await card.build({ format: "png"});
    /* const attachment = new AttachmentBuilder(image, "rank.png");
    interaction.editReply({ files: [attachment] }); */
    interaction.editReply({ files: [image] });
  },
  data: {
    name: "level",
    description: "The user whose level you want to see.",
    options: [
      {
        name: "user",
        description: "The user whose level you want to see.",
        type: ApplicationCommandOptionType.Mentionable,
      },
    ],
  },
};
