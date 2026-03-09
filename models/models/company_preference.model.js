const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Company Preferences
const companyPreferenceSchema = new mongoose.Schema({
  preferenceName: { type: String, required: [true, "preferenceName is required"] },
  preferenceKey: { type: String, required: [true, "preferenceKey is required"] },
  preferenceValue: { type: mongoose.Schema.Types.Mixed },
  dataType: { type: String, required: [true, "dataType is required"] },
  preferenceCategory: { type: String, required: [true, "dataType is required"] },
  preferenceGroup: { type: String, required: [true, "dataType is required"] }
}, { versionKey: false });

/// Company Preferences Activity
const companyPreferenceActivitySchema = new mongoose.Schema({
  companyPreferenceId: { type: mongoose.Schema.Types.ObjectId, required: [true, "companyPreferenceId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });

module.exports = {
  CompanyPreference: mongoose.model('company_preferences', companyPreferenceSchema),
  CompanyPreferenceActivity: activitiesDB.model('company_preference_activities', companyPreferenceActivitySchema),
  readOnlyCompanyPreference: secondaryDB.model('company_preferences', companyPreferenceSchema),
  readOnlyCompanyPreferenceActivity: activitiesSecondaryDB.model('company_preference_activities', companyPreferenceActivitySchema)
};

