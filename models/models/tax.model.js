const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Tax
const taxSchema = new mongoose.Schema({
  taxRegistrarName: { type: String, required: [true, "Tax registrar name is required"] },
  country: { type: String, required: [true, "country name is required"] },
  taxGroup: { type: String, required: [true, "Tax group is required"] },
  taxPercentage: { type: Number, required: [true, "Tax percentage is required"] },
  taxCategory: { type: String, required: [true, "Tax category is required"] },
  status: { type: Boolean, required: [true, "Status is required"], default: true },
}, { versionKey: false });
const Tax = mongoose.model('taxes', taxSchema);
const modelSecondary = secondaryDB.model('taxes', taxSchema);


/// TaxActivity
// const logValuesSchema = new mongoose.Schema({
//   _id: {type: mongoose.Schema.Types.ObjectId, required: false},
//   taxName: { type: String, required: false },
//   taxType: { type: String, required: false },
//   taxPercentage: { type: Number, required: false },
//   status: { type: Boolean, required: false },
//   updatedAt: { type: Date, required: false }
// });
const TaxActivitySchema = new mongoose.Schema({
  taxId: { type: mongoose.Schema.Types.ObjectId, required: [true, "taxId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const TaxActivity = activitiesDB.model('tax_activities', TaxActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('tax_activities', TaxActivitySchema);

module.exports = {
  Tax: Tax,
  TaxActivity: TaxActivity,
  readOnlyCollection: modelSecondary,
  readOnlyActivityCollection: modelActivitySecondary,
};
