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
    const embed = new EmbedBuilder()
      .setTitle("Summoner Info")
      .setTimestamp(new Date());

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
        console.log("Error with /opgg");
        console.log(error);
      });
    await axios
      .get(summoner_api_str)
      .then((response) => {
        summoner_data = response.data;
      })
      .catch((error) => {
        console.log("Error with /opgg");
        console.log(error);
      });
    await interaction.reply({
      content: `${nametag[0]}#${nametag[1]}: Lv. ${summoner_data.summonerLevel}`,
      embeds: [embed],
      components: [],
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
