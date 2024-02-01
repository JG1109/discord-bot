const {
  Client,
  Message,
  AttachmentBuilder,
  EmbedBuilder,
} = require("discord.js");
const Level = require("../../schemas/level");
const calculateLevelXP = require("../../utils/calculateLevelXP");

const { Font, RankCardBuilder, BuiltInGraphemeProvider } = require("canvacord");
Font.loadDefault();

/* function getRandomXP(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
} */

/**
 *
 * @param {Client} client
 * @param {Message} message
 */
module.exports = async (client, message) => {
  // check if the message is in the server
  // also check if the message is from a bot
  if (!message.guild || message.author.bot) return;

  /* const xpToGive = getRandomXP(5, 15); */
  const xpToGive = 50;

  const query = {
    guildId: message.guild.id,
    userId: message.author.id,
  };

  try {
    const level = await Level.findOne(query);
    if (!level) {
      const newLevel = new Level({
        guildId: message.guild.id,
        userId: message.author.id,
        xp: xpToGive,
        level: 1,
      });
      await newLevel
        .save()
        .catch((err) => console.log(`Error saving new level: ${err}`));
    } else {
      const xp = level.xp + xpToGive;
      const levelXP = calculateLevelXP(level.level);
      if (xp >= levelXP) {
        await Level.updateOne(query, {
          xp: 0,
          level: level.level + 1,
        });
        // send a message congratulating the user, and telling them their new level, mentioning the user
        // send the message to a specific channel
        const channel = message.guild.channels.cache.get("1202537360856711189");
        /* channel.send(
          `Congrats, <@${message.author.id}> has reached level ${
            level.level + 1
          }!`
        ); */

        // find the level rank of the user
        let allLevels = await Level.find({
          guildId: message.guild.id,
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
          allLevels.findIndex((level) => level.userId === message.author.id) +
          1;

        // fetch the user object
        const userObj = await message.guild.members.fetch(message.author.id);

        // build a card with user's rank, level, XP, and avatar
        const card = new RankCardBuilder()
          .setAvatar(message.author.displayAvatarURL({ format: "png" }))
          .setLevel(level.level + 1)
          .setCurrentXP(0)
          .setRequiredXP(calculateLevelXP(level.level + 1))
          .setRank(targetUserRank)
          .setUsername(message.author.username)
          .setStatus(userObj.presence.status);

        // send the card to the channel
        const image = await card.build({
          format: "png",
        });
        /*  const attachment = new AttachmentBuilder(image, "rank.png"); */

        // send the congrats message and the card together
        channel.send({
          content: `Congrats, <@${message.author.id}> has reached level ${
            level.level + 1
          }!`,
          files: [image],
        });
      } else {
        await Level.updateOne(query, { xp });
      }
    }
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
};
