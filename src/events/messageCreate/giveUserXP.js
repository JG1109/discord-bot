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

const Canvas = require("canvas");

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
  const xpToGive = 4000;

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
          xp: xp - levelXP,
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

        // create an image with the user's rank, level, XP, and avatar using canvas
        const canvas = Canvas.createCanvas(550, 250);
        const ctx = canvas.getContext("2d");

        // load image from the file system
        const background = await Canvas.loadImage(
          "https://i.postimg.cc/gj1D1Hgf/level-Up-Card-Background.png"
        );
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // draw the user avatar
        const avatarURL = message.author.displayAvatarURL({ extension: "png" });
        /* if (!avatarURL.endsWith(".png")) {
          console.error(`Invalid avatar URL: ${avatarURL}`);
          return;
        } */
        // make the avartar rounded and load it
        const avatar = await Canvas.loadImage(avatarURL);
        // make avartar border
        const border = await Canvas.loadImage(
          "https://i.postimg.cc/LsBMzjjV/Rectangle-17.png"
        );

        // draw the border
        ctx.save();
        ctx.beginPath();
        ctx.arc(275, 90, 60, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(border, 215, 30, 120, 120);
        ctx.restore();

        // draw the avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(275, 90, 55, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 220, 35, 110, 110);
        ctx.restore();

        // draw the user's rank, level
        ctx.font = "20px sans-serif";
        ctx.fillStyle = "#d9d9d9";
        // right below the avatar, mention the user
        // center the text
        ctx.textAlign = "center";
        ctx.fillText(
          `lvl: ${level.level + 1}`,
          canvas.width / 2,
          canvas.height / 2 + 90
        );

        ctx.font = "15px sans-serif";
        ctx.fillText(
          `rank: #${targetUserRank}`,
          canvas.width / 2,
          canvas.height / 2 + 60
        );

        // send the image to the channel
        const attachment = new AttachmentBuilder(
          canvas.toBuffer(),
          "canvas.png"
        );
        channel.send({
          content: `GG <@${message.author.id}> has reached level ${
            level.level + 1
          }!`,
          files: [attachment],
        });

        // build a card with user's rank, level, XP, and avatar
        /* const card = new RankCardBuilder()
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

        // send the congrats message and the card together
        channel.send({
          content: `Congrats, <@${message.author.id}> has reached level ${
            level.level + 1
          }!`,
          files: [image],
        }); */
      } else {
        await Level.updateOne(query, { xp });
      }
    }
  } catch (error) {
    console.log(`Error giving xp: ${error}`);
  }
};
