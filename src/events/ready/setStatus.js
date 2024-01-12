const { ActivityType } = require("discord.js");

let status = [
  {
    name: "VISION (드림캐쳐)",
    type: ActivityType.Streaming,
    url: "https://www.youtube.com/watch?v=jKrJBVLnRiM",
  },
  {
    name: "BONVOYAGE (드림캐쳐)",
    type: ActivityType.Streaming,
    url: "https://www.youtube.com/watch?v=RPNaYj6etb8",
  },
  {
    name: "MAISON (드림캐쳐)",
    type: ActivityType.Streaming,
    url: "https://www.youtube.com/watch?v=z4t9LLq1Nk0",
  },
  {
    name: "Dreamcatcher",
    type: ActivityType.Listening,
  },
  {
    name: "The Great Gatsby",
    type: ActivityType.Watching,
  },
  {
    name: "Cyberfunk 7022",
    type: ActivityType.Playing,
  },
  {
    name: "Bootleg Tournament",
    type: ActivityType.Competing,
  }
];

module.exports = (client) => {
  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 300000);
};
