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

const { Client, VoiceState } = require("discord.js");
const Level = require("../../schemas/level");
const calculateLevelXP = require("../../utils/calculateLevelXP");

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
      const interval = setInterval(async () => {
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
            xp: 0,
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
            channel.send(
              `Congrats, <@${newState.member.id}> has reached level ${
                level.level + 1
              }!`
            );
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
      }, 300_000); // 5 minutes
    } catch (error) {
      console.log(`Error giving xp: ${error}`);
    }
  }

  // check if the user has left a voice channel
  if (oldState.channelID && !newState.channelID) {
    // user has left a voice channel
    // stop giving them XP
    console.log(
      `[event:voiceStateUpdate] ${newState.member.user.username} has left the voice channel: ${newState.channel.name}`
    );
  }
};
