const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
  MessageAttachment,
} = require("discord.js");
const calculateLevelXP = require("../../utils/calculateLevelXP");
const Level = require("../../schemas/level");

const { Font, RankCardBuilder, BuiltInGraphemeProvider } = require("canvacord");
const { writeFileSync } = require("fs");

Font.loadDefault();

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const mentionedUser = interaction.options.getUser("user");
    const targetUserId = mentionedUser ? mentionedUser.id : interaction.user.id;
    const targetUserObject = await interaction.guild.members.fetch(
      targetUserId
    );

    const fetchedLevel = await Level.findOne({
      guildId: interaction.guild.id,
      userId: targetUserId,
    });

    // make sure to mention the target user
    if (!fetchedLevel) {
      interaction.editReply(
        targetUserId
          ? `<@${targetUserObject.id}> has no level.`
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

    const card = new RankCardBuilder()
      .setAvatar(
        targetUserObject.user.displayAvatarURL({ format: "png", size: 1024 })
      )
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXP(fetchedLevel.level))
      .setLevel(fetchedLevel.level)
      .setRank(targetUserRank)
      .setUsername(targetUserObject.user.username)
      .setDisplayName(targetUserObject.displayName)
      .setStatus(targetUserObject.presence.status)
      .setGraphemeProvider(BuiltInGraphemeProvider.FluentEmojiFlat)
      // set background
      .setBackground(
        "https://w0.peakpx.com/wallpaper/607/74/HD-wallpaper-monochrome-city-house-scenic-hakurei-reimu-black-and-white-home-run-city-anime-touhou-anime-girl-scenery-female-town-black-ibuki-suika-monochrome-building-girl-running-reimu-ibuki.jpg"
      )
      // set overlay color to black
      .setOverlay("#171717");

    const image = await card.build({ format: "png", width: 1024, height: 256 });
    const attachment = new AttachmentBuilder(image, "rank.png");
    interaction.editReply({ files: [attachment] });
    /* writeFileSync("./rank.png", image); */
  },
  data: {
    name: "level",
    description: "The user whose level you want to see.",
    options: [
      {
        name: "user",
        description: "The user whose level you want to see.",
        type: ApplicationCommandOptionType.User,
      },
    ],
  },
};
