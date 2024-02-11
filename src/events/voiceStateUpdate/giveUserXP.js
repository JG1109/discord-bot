/**
 * When a user enters a voice channel, give them XP
 * the amount of XP is based on the duration of time they spend in the voice channel
 * the longer they stay, the more XP they get
 * the XP is given every 5 minutes
 * the XP is given based on the following formula:
 * XP = (time in minutes) * 10
 *
 * When a user leaves a voice channel, stop giving them XP
 */

const { Client, VoiceState, AttachmentBuilder } = require("discord.js");
const Level = require("../../schemas/level");
const calculateLevelXP = require("../../utils/calculateLevelXP");

const { Font } = require("canvacord");
Font.loadDefault();

const Canvas = require("canvas");

/**
 *
 * @param {Client} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */
module.exports = async (client, oldState, newState) => {
  // check if the user is a bot
  if (newState.member.user.bot) return;

  // check if the user has entered a voice channel
  if (
    newState.channelId &&
    (!oldState.channelId || oldState.channelId !== newState.channelId)
  ) {
    // show in the console that the user has entered a voice channel
    console.log(
      `[event:voiceStateUpdate] ${newState.member.user.username} has entered the voice channel: ${newState.channel.name}`
    );
    // user has entered a voice channel
    // give them XP
    const query = {
      guildId: newState.guild.id,
      userId: newState.member.id,
    };

    try {
      const level = await Level.findOne(query);
      if (!level) {
        const newLevel = new Level({
          guildId: newState.guild.id,
          userId: newState.member.id,
          xp: 0,
          level: 1,
        });
        await newLevel
          .save()
          .catch((err) =>
            console.log(
              `[error:voiceStateUpdate] Error saving new level: ${err}`
            )
          );
      }
      // give user XP every 5 minutes
      // break the interval if the user leaves the voice channel
      const interval = setInterval(async () => {
        try {
          const level = await Level.findOne(query);
          // show in the console that the user has been given XP
          console.log(
            `[event:voiceStateUpdate] Giving XP to ${newState.member.user.username}: voice channel: ${newState.channel.name}`
          );

          const user = newState.guild.members.cache.get(newState.member.id);
          if (!user.voice.channel) {
            clearInterval(interval);
            return;
          }

          const xpToGive = 30;
          const xp = level.xp + xpToGive;
          const levelXP = calculateLevelXP(level.level);
          if (xp >= levelXP) {
            await Level.updateOne(query, {
              xp: xp - levelXP,
              level: level.level + 1,
            });
            // send a message congratulating the user, and telling them their new level, mentioning the user
            // send the message to a specific channel
            const channel = newState.guild.channels.cache.get(
              "1202537360856711189"
            );
            if (channel) {
              console.log(
                `[event:voiceStateUpdate] user: ${
                  newState.member.user.username
                }, leveled up to: ${level.level + 1}`
              );
              /* channel.send(
              `Congrats, <@${newState.member.id}> has reached level ${
                level.level + 1
              }!`
            ); */

              // find the level rank of the user
              let allLevels = await Level.find({
                guildId: newState.guild.id,
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
                allLevels.findIndex(
                  (level) => level.userId === newState.member.id
                ) + 1;

              // create an image with the user's rank, level, XP, and avatar using canvas
              const canvas = Canvas.createCanvas(550, 250);
              const ctx = canvas.getContext("2d");

              // load image from the file system
              const background = await Canvas.loadImage(
                "https://i.postimg.cc/gj1D1Hgf/level-Up-Card-Background.png"
              );
              ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

              // draw the user avatar
              const avatarURL = newState.member.user.displayAvatarURL({
                extension: "png",
              });

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
                content: `GG <@${newState.member.id}> has reached level ${
                  level.level + 1
                }!`,
                files: [attachment],
              });
            } else {
              console.log(
                `[error:voiceStateUpdate] Could not find the channel with the ID: 1202537360856711189`
              );
            }
          } else {
            await Level.updateOne(query, { xp });
            console.log(
              `[event:voiceStateUpdate] Database updated: ${xp} XP, user: ${newState.member.user.username}`
            );
          }
        } catch (error) {
          console.log(
            `[event:voiceStateUpdate] ${newState.member.user.username} has left the voice channel`
          );
          clearInterval(interval);
          return;
        }
      }, 300_000); // 5 minutes
    } catch (error) {
      console.log(`Error giving xp: ${error}`);
    }
  }
};
