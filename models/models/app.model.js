const mongoose = require('mongoose');
const Joi = require('joi');

const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const appSchema = new mongoose.Schema({
    appName: { type: String, required: true },
    appIcon: { type: String, required: true },
    appLink: { type: String, required: true },
    themeName: { type: String, required: true },
    status: { type: Boolean, required: true }
}, { versionKey: false });


/// brand activities
const activitySchema = new mongoose.Schema({
    appId: { type: mongoose.Schema.Types.ObjectId, required: [true, "appId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" }, 
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const model = mongoose.model('apps', appSchema);
const activityModel = activitiesDB.model('app_activities', activitySchema);
const modelSecondary = secondaryDB.model('apps', appSchema);
const activityModelSecondary = activitiesSecondaryDB.model('app_activities', activitySchema);


/**
 * Activity Schema for Validation
 */
const activityJoiSchema = Joi.object({
    appId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string(),
    comments: Joi.string(),
  });

/// create activity
const createActivity = async function (activityData) {   
    if (activityData.what.oldValues && activityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(activityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(activityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                activityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                activityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // activityData.what.oldValues === null && activityData.what.newValues === null ? delete activityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        if (activityData.what) {
            Joi.validate(activityData, activityJoiSchema, { abortEarly: false }).then(async (activityData) => {
                await activityModel(activityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
            }).catch((error) => { reject(error); });
        } else {
            resolve("")
        }
    });
}

module.exports = { 
    collection: model, 
    activityCollection: activityModel,
    readOnlyCollection: modelSecondary, 
    readOnlyActivityCollection: activityModelSecondary,
    createActivity: createActivity   
};
