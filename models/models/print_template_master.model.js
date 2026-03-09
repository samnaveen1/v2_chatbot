const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const modelSchema = new mongoose.Schema({
    templateName: { type: String, required: true },
    templateGroup: { type: String, required: true },
    templateSubGroup: { type: String, required: true },
    templateImage: { type: String, required: true },
    templateCode: { type: String, required: true },
    templatePrintConf: {
        unit: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        interpolation: { type: String, required: true },
        colorType: { type: String, required: true },
        copies: { type: Number, required: true }
    },
    templateStatus: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });

const model = mongoose.model('print_template_masters', modelSchema);
const modelSecondary = secondaryDB.model('print_template_masters', modelSchema);


/// Print template Activity
const collectionActivitySchema = new mongoose.Schema({
    printTemplateMasterId: { type: mongoose.Schema.Types.ObjectId, required: [true, "printTemplateMasterId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('print_template_master_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('print_template_master_activities', collectionActivitySchema);


/**
 * Activity Schema for Validation
 */
const printTemplateActivityJoiSchema = Joi.object({
    printTemplateMasterId: Joi.object().required(),
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
const createActivity = async function (printTemplateActivityData) {
    if (printTemplateActivityData.what.oldValues && printTemplateActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(printTemplateActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(printTemplateActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                printTemplateActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                printTemplateActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // printTemplateActivityData.what.oldValues === null && printTemplateActivityData.what.newValues === null ? delete printTemplateActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(printTemplateActivityData, printTemplateActivityJoiSchema, { abortEarly: false }).then(async (printTemplateActivityData) => {
            await modelActivity(printTemplateActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
};