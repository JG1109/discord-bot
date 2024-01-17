const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonInteraction,
} = require("discord.js");
require("dotenv").config({ path: ".env" });
const axios = require("axios");

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  callback: async (client, interaction) => {
    const nametag = interaction.options.getString("nametag").split("#");
    const account_api_str =
      "https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/" +
      nametag[0] +
      "/" +
      nametag[1] +
      "?api_key=" +
      process.env.RIOT_KEY;
    let summoner_api_str = "";
    let summoner_data;
    let spectator_api_str = "";
    let spectator_data;
    let puuid;
    await axios
      .get(account_api_str)
      .then((response) => {
        puuid = response.data.puuid;
        summoner_api_str =
          "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/" +
          response.data.puuid +
          "?api_key=" +
          process.env.RIOT_KEY;
      })
      .catch((error) => {
        console.log("Error with /opgg (looking up player puuid)");
        console.log(error);
      });
    await axios
      .get(summoner_api_str)
      .then((response) => {
        summoner_data = response.data;
        spectator_api_str =
          "https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" +
          response.data.id +
          "?api_key=" +
          process.env.RIOT_KEY;
      })
      .catch((error) => {
        console.log("Error with /opgg (looking up summoner data)");
        console.log(error);
      });
    await axios
      .get(spectator_api_str)
      .then((response) => {
        spectator_data = response.status;
      })
      .catch((error) => {
        console.log("Error with /opgg (looking up player status)");
        console.log(error);
      });

    const profile_icon_uri =
      "https://ddragon.leagueoflegends.com/cdn/14.1.1/img/profileicon/" +
      summoner_data.profileIconId +
      ".png";

    const embed = new EmbedBuilder()
      .setColor("#5383E8")
      .setAuthor({
        name: "OP.GG",
        iconURL: "https://asset.brandfetch.io/idrLeSINfM/idzqWoCdeq.png",
        url: "https://www.op.gg/summoners/na/" + nametag[0] + "-" + nametag[1],
      })
      .setTitle(`${nametag[0]}`)
      .setThumbnail(profile_icon_uri)
      .setDescription(`#${nametag[1]}`)
      .addFields(
        {
          name: "Level",
          value: `${summoner_data.summonerLevel}`,
          inline: true,
        },
        { name: "Name", value: `${summoner_data.name}`, inline: true },
        {
          name: "Status",
          value: `${spectator_data === undefined ? "N/A" : "In Game"}`,
          inline: true,
        }
      )
      .setTimestamp()
      .setFooter({
        text: "Powered by Riot API",
        iconURL: "https://img.icons8.com/color/48/riot-games.png",
        url: "https://developer.riotgames.com/",
      });

    const button_0 = new ButtonBuilder()
      .setCustomId("Summary")
      .setLabel("Summary")
      .setStyle(ButtonStyle.Primary);
    const button_1 = new ButtonBuilder()
      .setCustomId("Match History")
      .setLabel("Match History")
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents([button_0, button_1]);

    const reply = await interaction.reply({
      content: "",
      embeds: [embed],
      components: [row],
    });

    // provide match history data
    const initialUserInteraction = await reply.awaitMessageComponent({});
    if (!initialUserInteraction) return;
    if (initialUserInteraction.customId === "Summary") {
      const matches_api_str =
        "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" +
        puuid +
        "/ids?api_key=" +
        process.env.RIOT_KEY;

      let match_api_strs = [];

      await axios
        .get(matches_api_str)
        .then((response) => {
          for (const ind in response.data) {
            const match_id = response.data[ind];
            const match_api_str =
              "https://americas.api.riotgames.com/lol/match/v5/matches/" +
              match_id +
              "?api_key=" +
              process.env.RIOT_KEY;
            match_api_strs.push(match_api_str);
          }
        })
        .catch((error) => {
          console.log("Error with /opgg (matches info)");
          console.log(error);
        });

      const matchPerformances = {};

      for (let ind = 0; ind < match_api_strs.length; ind++) {
        await axios
          .get(match_api_strs[ind])
          .then((response) => {
            for (
              let pos = 0;
              pos < response.data.metadata.participants.length;
              pos++
            ) {
              if (response.data.metadata.participants[pos] === puuid) {
                matchPerformances[ind] = response.data.info.participants[pos];
              }
            }
          })
          .catch((error) => {
            console.log("Error with /opgg (single match lookup)");
            console.log(error);
          });
      }

      let totalKills = 0;
      let totalDeaths = 0;
      let totalAssists = 0;
      let gameLength = 0;
      let damage = 0;
      let gold = 0;
      let skillshots_dodged = 0;
      for (const ind in matchPerformances) {
        totalKills += matchPerformances[ind].kills;
        totalDeaths += matchPerformances[ind].deaths;
        totalAssists += matchPerformances[ind].assists;
        skillshots_dodged += matchPerformances[ind].challenges.skillshotsDodged;
        damage +=
          matchPerformances[ind].challenges.damagePerMinute *
          (matchPerformances[ind].challenges.gameLength / 60);
        gold +=
          matchPerformances[ind].challenges.goldPerMinute *
          (matchPerformances[ind].challenges.gameLength / 60);
        gameLength += matchPerformances[ind].challenges.gameLength / 60;
      }

      embed
        .setTitle(`Recent 20 Games`)
        .setDescription(`${nametag[0]}#${nametag[1]}`)
        .setFields(
          {
            name: "KDA",
            value: `${
              Math.round(((totalKills + totalAssists) / totalDeaths) * 100) /
              100
            }`,
          },
          {
            name: "DPM",
            value: `${Math.round((damage / gameLength) * 100) / 100}`,
            inline: true,
          },
          {
            name: "Gold/Min",
            value: `${Math.round((gold / gameLength) * 100) / 100}`,
          },
          { name: "Skillshots Dodged", value: `${skillshots_dodged}` }
        );

      await reply.edit({ embeds: [embed], components: [] });
    }
  },
  data: {
    name: "opgg",
    description: "Look up League of Legends summoner info.",
    options: [
      {
        name: "nametag",
        description: "Summoner you want to look up.",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
};
