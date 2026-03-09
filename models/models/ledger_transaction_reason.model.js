const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const ledgerTransactionReasonSchema = new mongoose.Schema({
    reasonType: { type: String, default: null },
    reasonName: { type: String, default: null },
}, { versionKey: false });

const model = mongoose.model('ledger_transaction_reasons', ledgerTransactionReasonSchema);
const readOnlyModel = secondaryDB.model('ledger_transaction_reasons', ledgerTransactionReasonSchema);


/// ledger transaction reason Activity
const collectionActivitySchema = new mongoose.Schema({
    ledgerTransactionReasonId: { type: mongoose.Schema.Types.ObjectId, required: [true, "ledgerTransactionReasonId is required"] },
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

const modelActivity = activitiesDB.model('ledger_transaction_reason_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('ledger_transaction_reason_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const ledgerTransacionActivityJoiSchema = Joi.object({
    ledgerTransactionReasonId: Joi.object().required(),
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
const createActivity = async function (ledgerTrasactionReasonActivityData) {
    if (ledgerTrasactionReasonActivityData.what.oldValues && ledgerTrasactionReasonActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(ledgerTrasactionReasonActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(ledgerTrasactionReasonActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                ledgerTrasactionReasonActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                ledgerTrasactionReasonActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // ledgerTrasactionReasonActivityData.what.oldValues === null && ledgerTrasactionReasonActivityData.what.newValues === null ? delete ledgerTrasactionReasonActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(ledgerTrasactionReasonActivityData, ledgerTransacionActivityJoiSchema, { abortEarly: false }).then(async (ledgerTrasactionReasonActivityData) => {
            await modelActivity(ledgerTrasactionReasonActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
}