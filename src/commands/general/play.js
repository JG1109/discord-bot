const Spotify = require("spotify-api.js");
const { Client } = require("spotify-api.js");
const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");

const { EmbedBuilder } = require("discord.js");

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  callback: async (client, interaction) => {
    // Connect to Spotify API
    const spotify_client = await Client.create({
      refreshToken: true,
      token: {
        clientID: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_TOKEN,
      },
      // This event is emitted whenever the token is refreshed by either 429 requests or [Client.refresh] method.
      onRefresh() {
        console.log(`Token has been refreshed. New token: ${client.token}!`);
      },
    });

    // Get the link from the command
    const link = interaction.options.getString("link");

    // Get the type of the link
    const type = link.split("/")[3];

    // Check if the link is valid
    if (!link.includes("open.spotify.com")) {
      return interaction.reply({
        content: "Please provide a valid Spotify link.",
        ephemeral: true,
      });
    }

    // Check if user is in a voice channel
    if (!interaction.member.voice.channel) {
      return interaction.reply({
        content: "Please join a voice channel.",
        ephemeral: true,
      });
    }

    // Get the voice channel
    const voice_channel = interaction.member.voice.channel;

    // Get the voice connection
    const voice_connection = getVoiceConnection(voice_channel.guild.id);

    // Check if the bot is in a voice channel
    /* if (!voice_connection) {
      const connection = joinVoiceChannel({
        channelId: voice_channel.id,
        guildId: voice_channel.guild.id,
        adapterCreator: voice_channel.guild.voiceAdapterCreator,
      });
      /* console.log(connection);
    } */

    // Get the id of the link
    const id = link.split("/")[4];

    // Create a new DisTube instance
    const distube = new DisTube(client, {
      searchSongs: 10,
      emitNewSongOnly: true,
      plugins: [new SpotifyPlugin()],
    });

    // Play the track, playlist or album
    let src;
    switch (type) {
      case "track":
        src = await spotify_client.tracks.get(id);
        distube.play(voice_channel, `https://open.spotify.com/track/${src.id}`);
        break;
      case "playlist":
        src = await spotify_client.playlists.get(id);
        src.tracks.items.forEach((track) => {
          distube.play(
            voice_channel,
            `https://open.spotify.com/track/${track.track.id}`
          );
        });
        break;
      case "album":
        src = await spotify_client.albums.get(id);
        src.tracks.items.forEach((track) => {
          distube.play(
            voice_channel,
            `https://open.spotify.com/track/${track.id}`
          );
        });
        break;
    }

    // Send an embed to the user
    // Include artist, album, track name, album cover, duration
    const embed = new EmbedBuilder()
      .setColor("#929AAB")
      .setTitle("Now playing")
      .setDescription(`[${src.name}](${link})`)
      .addFields(
        {
          name: "Link",
          value: `[Spotify](${link})`,
          inline: true,
        },
        {
          name: "Artist",
          value: `${src.artists[0].name}`,
          inline: true,
        },
        {
          name: "Album",
          value: `${src.album.name}`,
          inline: true,
        },
        {
          name: "Duration",
          value: `${Math.floor(src.duration_ms / 60000)}:${Math.floor(
            (src.duration_ms % 60000) / 1000
          )}`,
          inline: true,
        }
      )
      .setThumbnail(`${src.album.images[0].url}`)
      .setFooter({
        text: "Src from YouTube",
        iconURL:
          "https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/395_Youtube_logo-512.png",
        url: " https://meet-ricky.netlify.app/",
      });

    await interaction.reply({
      content: "",
      embeds: [embed],
      components: [],
    });
  },
  data: {
    name: "play",
    description: "Play Spotify music (track, playlist or album).",
    options: [
      {
        name: "link",
        description: "Spotify link.",
        type: 3,
        required: true,
      },
    ],
  },
};
