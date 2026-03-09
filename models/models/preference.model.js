const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const PreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User ID is required"]
  },
  themeMode: {
    type: String,
    required: false,
    default: null
  },
  themeColor: {
    type: String,
    required: false,
    default: null
  },
  appLanguage: {
    type: Object,
    required: false,
    default: null
  },
  voiceInputLanguage: {
    type: String,
    required: false,
    default: null
  },
  timezone: {
    type: Object,
    required: false,
    default: null
  },
}, { versionKey: false });
const Prefrence = mongoose.model('preferences', PreferenceSchema);
const modelSecondary = secondaryDB.model('preferences', PreferenceSchema);

module.exports = {
  collection: Prefrence,
  readOnlyCollection: modelSecondary,
};
