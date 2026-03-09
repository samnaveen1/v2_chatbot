const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const modelSchema = new mongoose.Schema({
    gspName: { type: String, required: true },
    gspApiAuthUrl: { type: String, required: true },
    gspApiValidationUrl: { validationSchema: { type: String, required: true } },
    gspApiGenerateUrl: { type: String, required: true },
    requestData: { type: String, required: false, default: null },
    validation: { type: String, required: false, default: null },
    gspUsername: { type: String, required: true },
    gspPassword: { type: String, required: true },
    aspId: { type: String, required: true },
    aspPassword: { type: String, required: true },
    organizationGstin: { type: String, required: true },
    QrCodeSize: { type: Number, required: true },
    authToken: { type: String, required: false },
    authTokenExpireAt: { type: Date, required: false },
    isDefault: { type: Boolean, required: true },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

const model = mongoose.model('e_invoice_setup', modelSchema);
const readOnlyModel = secondaryDB.model('e_invoice_setup', modelSchema);


/// e-invoice Activity
const collectionActivitySchema = new mongoose.Schema({
    eInvoiceSetupId: { type: mongoose.Schema.Types.ObjectId, required: [true, "eInvoiceSetupId is required"] },
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

const modelActivity = activitiesDB.model('e_invoice_setup_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('e_invoice_setup_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
*/
const eInvoiceSetupActivityJoiSchema = Joi.object({
    eInvoiceSetupId: Joi.object().required(),
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
const createActivity = async function (eInvoiceSetupActivityData) {
    if (eInvoiceSetupActivityData.what.oldValues && eInvoiceSetupActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(eInvoiceSetupActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(eInvoiceSetupActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                eInvoiceSetupActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                eInvoiceSetupActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // eInvoiceSetupActivityData.what.oldValues === null && eInvoiceSetupActivityData.what.newValues === null ? delete eInvoiceSetupActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(eInvoiceSetupActivityData, eInvoiceSetupActivityJoiSchema, { abortEarly: false }).then(async (eInvoiceSetupActivityData) => {
            await modelActivity(eInvoiceSetupActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};



module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity
};