const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const groupSchema = new mongoose.Schema({
    name: { type: String, required: false },  
    customers: [{ type: mongoose.Schema.Types.ObjectId, required: false, default:[] }],    
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    approvalStatus: { type: String, default: "auto approved" },  
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { versionKey: false });

const model = mongoose.model('loyalty_restrictions', groupSchema);
const readOnlyModel = secondaryDB.model('loyalty_restrictions', groupSchema);

/// Price markup group request Activity
const groupActivitySchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, required: [true, "customerGroupId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('loyalty_restrictions_activities', groupActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('loyalty_restrictions_activities', groupActivitySchema);

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
        Joi.validate(creditMarkupGroupActivityData, creditMarkupGroupActivityJoiSchema, { abortEarly: false }).then(async (creditMarkupGroupActivityData) => {
            await modelActivity(creditMarkupGroupActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
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
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    findAll: findAll,
    commonWhereConditions: commonWhereConditions
}