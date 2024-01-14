const {
  ChatInputCommandInteraction,
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
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
    await axios
      .get(account_api_str)
      .then((response) => {
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

    await interaction.reply({
      content: "",
      embeds: [embed],
      components: [row],
    });
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
