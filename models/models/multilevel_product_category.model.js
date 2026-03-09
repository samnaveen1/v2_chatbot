const mongoose = require('mongoose');
const Joi = require('joi');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Multilevel Product Category.
const multilevelProductCategorySchema = new mongoose.Schema({
    productCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productCategoryName: { type: String, require: true },
    children: { type: Array, default: null },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });

const model = mongoose.model('multilevel_product_categories', multilevelProductCategorySchema);
const modelSecondary = secondaryDB.model('multilevel_product_categories', multilevelProductCategorySchema);

/// MultilevelProductCategoryActivity
// const multilevelProductCategoryActivitySchema = new mongoose.Schema({
//     multilevelProductCategoryId: { type: mongoose.Schema.Types.ObjectId, required: [true, "multilevelProductCategoryId is required"] },
//     action: { type: String, required: [true, "action is required"] },
//     what: { type: Object, required: [true, "what is required"] },
//     who: { type: Object, required: [true, "who is required"] },
//     mode: { type: String, required: [true, "mode is required"] },
//     when: { type: Date, default: Date.now, required: [true, "when is required"] },
//     comments: { type: String, required: false, default: undefined },
//     isRestored: { type: Boolean, required: false },
//     approvalType: { type: String, required: false, default: null },
//     approvalStatus: { type: String, required: false, default: "auto approved" }
// }, { versionKey: false });

// const modelActivity = mongoose.model('multilevel_product_category_activities', multilevelProductCategoryActivitySchema);

// /**
//  * Activity Schema for Validation
//  */
// const multilevelProductCategoryActivityJoiSchema = Joi.object({
//     multilevelProductCategoryId: Joi.object().required(),
//     action: Joi.string().required(),
//     who: Joi.object().required(),
//     what: Joi.object().required(),
//     mode: Joi.string().required(),
//     when: Joi.date(),
//     comments: Joi.string(),
//     isRestored: Joi.bool(),
//     approvalType: Joi.string(),
//     approvalStatus: Joi.string()
// });

// /// create activity
// const createActivity = function (multilevelProductCategoryActivityData) {
//     return new Promise(function (resolve, reject) {
//         Joi.validate(multilevelProductCategoryActivityData, multilevelProductCategoryActivityJoiSchema, { abortEarly: false }).then(async (multilevelProductCategoryActivityData) => {
//             await modelActivity(multilevelProductCategoryActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
//         }).catch((error) => { reject(error); });
//     });
// }



module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
    // activityCollection: modelActivity,
    // createActivity: createActivity
}