const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// brands
const brandSchema = new mongoose.Schema({
  brandName: { type: String, required: [true, "brandName is required"] },
  status: { type: Boolean, default: true },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });
const Brand = mongoose.model('brands', brandSchema);
const readOnlyBrand = secondaryDB.model('brands', brandSchema);

/// brand activities
const brandActivitySchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, required: [true, "brandId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const BrandActivity = activitiesDB.model('brand_activities', brandActivitySchema);
const readOnlyBrandActivity = activitiesSecondaryDB.model('brand_activities', brandActivitySchema);

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
  }
  if (readOnlyModel == true) {
    return readOnlyBrand.find(findCondition, documentFields);
  } else {
    return Brand.find(findCondition, documentFields);
  }
}

module.exports = {
  collection: Brand,
  activityCollection: BrandActivity,
  readOnlyCollection: readOnlyBrand,
  readOnlyActivityCollection: readOnlyBrandActivity,
  findAll: findAll,
  activityKey: "brandId"
};

