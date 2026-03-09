const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const collectionSchema = new mongoose.Schema({
    driver: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    shiftStartsAt: { type: Date, required: true, default: Date.now },
    shiftEndsAt: { type: Date, default: null },
    transportVehicleId: { type: mongoose.Schema.Types.ObjectId, required: true, default: null },
    startOdometerReading: { type: Number, required: true, default: null },
    endOdometerReading: { type: Number, required: false, default: null },
    transitRouteId: { type: mongoose.Schema.Types.ObjectId, required: true, default: null },
    transitIds: [{ type: mongoose.Schema.Types.ObjectId, required: false, default: null }],
    currentloc: {
        latitude: { type: Number, required: false, default: null },
        longitude: { type: Number, required: false, default: null }
    },
    shiftStatus: { type: String, required: true },//Scheduled, Active, Closed.
    locUpdatedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

const model = mongoose.model('driver_shifts', collectionSchema);
const readOnlyModel = secondaryDB.model('driver_shifts', collectionSchema);


/// Driver shift Activity
const collectionActivitySchema = new mongoose.Schema({
    driverShiftId: { type: mongoose.Schema.Types.ObjectId, required: [true, "driverShiftId is required"] },
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

const modelActivity = activitiesDB.model('driver_shift_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('driver_shift_activities', collectionActivitySchema);


/**
 * Activity Schema for Validation
 */
const driverShiftActivityJoiSchema = Joi.object({
    driverShiftId: Joi.object().required(),
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
const createActivity = async function (driverShiftActivityData) {
    if (driverShiftActivityData.what.oldValues && driverShiftActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(driverShiftActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(driverShiftActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                driverShiftActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                driverShiftActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // driverShiftActivityData.what.oldValues === null && driverShiftActivityData.what.newValues === null ? delete driverShiftActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(driverShiftActivityData, driverShiftActivityJoiSchema, { abortEarly: false }).then(async (driverShiftActivityData) => {
            await modelActivity(driverShiftActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}


const collectionLogSchema = new mongoose.Schema({
    driverShiftId: { type: mongoose.Schema.Types.ObjectId, required: [true, "driverShiftId is required"] },
    currentloc: {
        latitude: { type: Number, required: true, default: null },
        longitude: { type: Number, required: true, default: null }
    },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });


const modelLog = mongoose.model('driver_shift_loc_logs', collectionLogSchema);
const readOnlyModelLog = secondaryDB.model('driver_shift_loc_logs', collectionLogSchema);


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    locationLog: modelLog,
    readOnlyLoocationLog: readOnlyModelLog,
    createActivity: createActivity,
}