const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// PrefrenceActivity
const PrefrenceActivitySchema = new mongoose.Schema({
  preferenceId: { type: mongoose.Schema.Types.ObjectId, required: [true, "preferenceId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const PrefrenceActivity = activitiesDB.model('preference_activities', PrefrenceActivitySchema);
const modelSecondary = activitiesSecondaryDB.model('preference_activities', PrefrenceActivitySchema);

module.exports = {
  collection: PrefrenceActivity,
  readOnlyCollection: modelSecondary,
};
