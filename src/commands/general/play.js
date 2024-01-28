const Spotify = require("spotify-api.js");

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  callback: async (client, interaction) => {
    // Connect to Spotify API
    const spotify_client = new Spotify.Client({
      token: process.env.SPOTIFY_TOKEN,
    });

    // Check if user is in a voice channel
    // If not, send an error message
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      await interaction.reply({
        content: "You must be in a voice channel to play music.",
        ephemeral: true,
      });
      return;
    }

    // Check if the link provided is a valid Spotify link
    // If not, send an error message
    const spotify_link = interaction.options.getString("link");
    if (!spotify_link.includes("spotify")) {
      await interaction.reply({
        content: "Invalid Spotify link.",
        ephemeral: true,
      });
      return;
    }

    // Get the Spotify link type
    // If the link is a track, play the track
    // If the link is a playlist, play the playlist
    // If the link is an album, play the album
    const spotify_link_type = spotify_link.split("/")[3];
    if (spotify_link_type === "track") {
      const track = await spotify_client.tracks.get(spotify_link.split("/")[4]);
      console.log(1);
      await interaction.reply({
        content: `Now playing **${track.name}** by **${track.artists[0].name}**`,
        ephemeral: true,
      });
      await client.distube.playVoiceChannel(voiceChannel, track.url);
    } else if (spotify_link_type === "playlist") {
      const playlist = await spotify_client.playlists.get(
        spotify_link.split("/")[4]
      );
      await interaction.reply({
        content: `Now playing **${playlist.name}** by **${playlist.owner.display_name}**`,
        ephemeral: true,
      });
      await client.distube.playVoiceChannel(
        voiceChannel,
        playlist.tracks[0].url
      );
    } else if (spotify_link_type === "album") {
      const album = await spotify_client.albums.get(spotify_link.split("/")[4]);
      await interaction.reply({
        content: `Now playing **${album.name}** by **${album.artists[0].name}**`,
        ephemeral: true,
      });
      await client.distube.playVoiceChannel(voiceChannel, album.tracks[0].url);
    }

    // Add the song to the queue
    // If the queue is empty, play the song
    // If the queue is not empty, send a message
    client.distube.on("addSong", (queue, song) => {
      if (queue.songs.length === 1) return;
      interaction.followUp({
        content: `Added **${song.name}** to the queue.`,
        ephemeral: true,
      });
    });

    // Send a message when the song ends
    client.distube.on("finish", (queue) => {
      interaction.followUp({
        content: `Finished playing **${queue.songs[0].name}**.`,
        ephemeral: true,
      });
    });

    // Send a message when the queue ends
    client.distube.on("empty", (queue) => {
      interaction.followUp({
        content: `Queue ended.`,
        ephemeral: true,
      });
    });

    // Send a message when an error occurs
    client.distube.on("error", (queue, error) => {
      interaction.followUp({
        content: `An error occurred.`,
        ephemeral: true,
      });
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
