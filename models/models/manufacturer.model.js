const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const manufacturerSchema = new mongoose.Schema({
  manufacturerName: { type: String, required: [true, "manufacturerName is required"] },
  status: { type: Boolean, default: true },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });
const Manufacturer = mongoose.model('manufacturers', manufacturerSchema);
const readOnlyManufacturer = secondaryDB.model('manufacturers', manufacturerSchema);

/// Manufacturer Activity
const manufacturerActivitySchema = new mongoose.Schema({
  manufacturerId: { type: mongoose.Schema.Types.ObjectId, required: [true, "manufacturerId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const ManufacturerActivity = activitiesDB.model('manufacturer_activities', manufacturerActivitySchema);
const readOnlyManufacturerActivity = activitiesSecondaryDB.model('manufacturer_activities', manufacturerActivitySchema);

/// common conditions.
let commonWhereConditions = { "approvalStatus": { "$in": ["approved", "auto approved"] }, "isDeleted": { $ne: true } };


/// find all records.
const findAll = function ({ where = null, allowCondition = true, documentFields = {}, readOnlyModel = false, } = {}) {
  let findCondition = {};
  if (where && allowCondition) {
    findCondition["$and"] = [where, commonWhereConditions];
  } else if (where) {
    findCondition = where;
  } else if (allowCondition) {
    findCondition = commonWhereConditions;
  } if (readOnlyModel == true) {
    return readOnlyManufacturer.find(findCondition, documentFields);
  } else {
    return Manufacturer.find(findCondition, documentFields);
  }
}

module.exports = {
  collection: Manufacturer,
  activityCollection: ManufacturerActivity,
  readOnlyCollection: readOnlyManufacturer,
  readOnlyActivityCollection: readOnlyManufacturerActivity,
  findAll: findAll,
  activityKey: "manufacturerId"
};

