const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Unit
const unitSchema = new mongoose.Schema({
  unitName: { type: String, required: true },
  unitCategory: { type: String, required: true },
  unitSymbol: { type: String, required: true },
  conversionRate: { type: Number, required: true },
  isBaseUnit: { type: Boolean, required: true },
  status: { type: Boolean, required: true }
}, { versionKey: false });
const Unit = mongoose.model('units', unitSchema);
const modelSecondary = secondaryDB.model('units', unitSchema);

/// UnitActivity
// const logValuesSchema = new mongoose.Schema({
//   _id: {type: mongoose.Schema.Types.ObjectId},      
//   unitName: { type: String},
//   unitCategory: {type: String},
//   unitSymbol: {type: String},
//   conversionRate: {type: Number},
//   isBaseUnit: {type: Boolean},
//   status: {type: Boolean}
// });
const unitActivitySchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const UnitActivity = activitiesDB.model('unit_activities', unitActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('unit_activities', unitActivitySchema);

module.exports = {
  Unit: Unit,
  UnitActivity: UnitActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
};

