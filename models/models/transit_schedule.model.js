const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const transitScheduleSchema = new mongoose.Schema({
    transitRouteId: { type: mongoose.Schema.Types.ObjectId, required: true },
    recurrance: { type: String, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: false },
    occurences: [{
        transitDate: { type: Date, required: true },
        transitPoint: [{
            branchType: { type: String, required: true },
            storeId: { type: mongoose.Schema.Types.ObjectId },
            storeName: { type: String },
            warehouseId: { type: mongoose.Schema.Types.ObjectId },
            warehouseName: { type: String },
            mapLocation: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true }
            },
            transitStopOrderNumber: { type: Number, required: true },
            arrivalTime: { type: String, required: true },
            dispatchTime: { type: String, required: true }
        }],
    }],
    driver: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });

const model = mongoose.model('transit_schedule', transitScheduleSchema);
const modelSecondary = secondaryDB.model('transit_schedule', transitScheduleSchema);


/// Transit schedule Activity
const collectionActivitySchema = new mongoose.Schema({
    transitScheduleId: { type: mongoose.Schema.Types.ObjectId, required: [true, "transitScheduleId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('transit_schedule_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('transit_schedule_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const transitScheduleActivityJoiSchema = Joi.object({
    transitScheduleId: Joi.object().required(),
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
const createActivity = async function (transitScheduleActivityData) {
    if (transitScheduleActivityData.what.oldValues && transitScheduleActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(transitScheduleActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(transitScheduleActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                transitScheduleActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                transitScheduleActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // transitScheduleActivityData.what.oldValues === null && transitScheduleActivityData.what.newValues === null ? delete transitScheduleActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(transitScheduleActivityData, transitScheduleActivityJoiSchema, { abortEarly: false }).then(async (transitScheduleActivityData) => {
            await modelActivity(transitScheduleActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity
};