const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const priceMarkupSchema = new mongoose.Schema({
    customerGroupName: { type: String, required: [true, "customerGroupName is required"] },
    customerGroupDesc: { type: String, required: [false, "customerGroupDesc is required"] },
    customers: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    defaultCreditLimit: { type: Boolean, required: true, default: false },
    maxCreditLimit: { type: Number, required: false },
    maxCreditDays: { type: Number, required: false },
    maxCreditBills: { type: Number, required: false },
    status: { type: Boolean, required: true },
    isArchived: { type: Boolean, required: false, default: false },
    isDeleted: { type: Boolean, required: false, default: false },
    approvalStatus: { type: String, required: false, default: "auto approved" },  
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }
}, { versionKey: false });

const model = mongoose.model('credit_limit_groups', priceMarkupSchema);
const readOnlyModel = secondaryDB.model('credit_limit_groups', priceMarkupSchema);

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

const modelActivity = activitiesDB.model('credit_limit_group_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('credit_limit_group_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const creditMarkupGroupActivityJoiSchema = Joi.object({
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
const createActivity = async function (creditMarkupGroupActivityData) {
      if (creditMarkupGroupActivityData.what.oldValues && creditMarkupGroupActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(creditMarkupGroupActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(creditMarkupGroupActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                creditMarkupGroupActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                creditMarkupGroupActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // creditMarkupGroupActivityData.what.oldValues === null && creditMarkupGroupActivityData.what.newValues === null ? delete creditMarkupGroupActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
      if (creditMarkupGroupActivityData.what) {
        Joi.validate(creditMarkupGroupActivityData, creditMarkupGroupActivityJoiSchema, { abortEarly: false }).then(async (creditMarkupGroupActivityData) => {
            await modelActivity(creditMarkupGroupActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
      } else {
        resolve("")
    }
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
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    findAll: findAll,
    commonWhereConditions: commonWhereConditions
}