const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const rackSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId },
    warehouseId: { type: mongoose.Schema.Types.ObjectId },
    rackNumber: { type: String, required: true },
    rackName: { type: String, required: true },
    rackCategory: [{ type: String }],
    shelfNumbers: [{ type: String }],
    rackCapacity: {
        capacityInKg: { type: Number, required: true },
        height: { type: Number, required: true },
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        dimentionUnit: { type: String, required: true }
    },
    status: { type: Boolean, required: true }
}, { versionKey: false });

const model = mongoose.model('racks', rackSchema);
const modelSecondary = secondaryDB.model('racks', rackSchema);

/// rack Activity
const collectionActivitySchema = new mongoose.Schema({
    rackId: { type: mongoose.Schema.Types.ObjectId, required: [true, "rackId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    comments: { type: String, required: false, default: undefined },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('rack_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('rack_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const rackActivityJoiSchema = Joi.object({
    rackId: Joi.object().required(),
    action: Joi.string().required(),
    comments: Joi.string(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (rackActivityData) {
    if (rackActivityData.what.oldValues && rackActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(rackActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(rackActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                rackActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                rackActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // rackActivityData.what.oldValues === null && rackActivityData.what.newValues === null ? delete rackActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(rackActivityData, rackActivityJoiSchema, { abortEarly: false }).then(async (rackActivityData) => {
            await modelActivity(rackActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
}