const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const priceMarkupSchema = new mongoose.Schema({
    customerGroupName: { type: String, required: [true, "customerGroupName is required"] },
    customerGroupDesc: { type: String, required: [false, "customerGroupDesc is required"] },
    customers: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    defaultMarkupPercentage: { type: Number, required: true },
    mapProducts: {
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        toAllProductInCategory: { type: Boolean, required: true },
        markupPercentage: { type: Number, required: true },
        products: [
            {
                masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
                markupPercentage: { type: Number, required: true },
            }
        ]
    },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    status: { type: Boolean, required: true },
    isArchived: { type: Boolean, required: false, default: false },
    isDeleted: { type: Boolean, required: false, default: false },
}, { versionKey: false });

const model = mongoose.model('price_markup_groups', priceMarkupSchema);
const modelSecondary = secondaryDB.model('price_markup_groups', priceMarkupSchema);

/// Price markup group request Activity
const collectionActivitySchema = new mongoose.Schema({
    customerGroupId: { type: mongoose.Schema.Types.ObjectId, required: [true, "customerGroupId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('price_markup_group_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('price_markup_group_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const priceMarkupGroupActivityJoiSchema = Joi.object({
    customerGroupId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (priceMarkupGroupActivityData) {
    if (priceMarkupGroupActivityData.what.oldValues && priceMarkupGroupActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(priceMarkupGroupActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(priceMarkupGroupActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                priceMarkupGroupActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                priceMarkupGroupActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // priceMarkupGroupActivityData.what.oldValues === null && priceMarkupGroupActivityData.what.newValues === null ? delete priceMarkupGroupActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(priceMarkupGroupActivityData, priceMarkupGroupActivityJoiSchema, { abortEarly: false }).then(async (priceMarkupGroupActivityData) => {
            await modelActivity(priceMarkupGroupActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};

/// common conditions.
let commonWhereConditions = { "approvalStatus": { "$in": ["approved", "auto approved"] }, "isDeleted": { $ne: true } };


/// find all records.
const findAll = function ({ where = null, allowCondition = true, documentFields = {} } = {}) {
    let findCondition = {};
    if (where && allowCondition) {
        findCondition["$and"] = [where, commonWhereConditions];
    } else if (where) {
        findCondition = where;
    } else if (allowCondition) {
        findCondition = commonWhereConditions;
    }
    return model.find(findCondition, documentFields);
}

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
    findAll: findAll,
    commonWhereConditions: commonWhereConditions
}