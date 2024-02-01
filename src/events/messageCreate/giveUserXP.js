const { Client, Message } = require("discord.js");
const Level = require("../../schemas/level");
const calculateLevelXP = require("../../utils/calculateLevelXP");

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
        message.channel.send(
          `Congrats, <@${message.author.id}> has reached level ${
            level.level + 1
          }!`
        );
      } else {
        await Level.updateOne(query, { xp });
      }
    }
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
};
