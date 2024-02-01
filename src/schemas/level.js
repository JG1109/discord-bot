const { Schema, model } = require("mongoose");

const levelSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
  /* lastUpdated: {
    type: Date,
    default: new Date(),
  }, */
});

module.exports = model("level", levelSchema);
