const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const debitNoteSchema = new mongoose.Schema({
    debitNoteNumber: { type: String, required: true },
    debitDate: { type: Date, required: true },
    reason: {
        debitID: { type: mongoose.Schema.Types.ObjectId, required: true },
        debitReason: { type: String, required: true },
    },
    purchaseIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    debitNoteCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String, require: true }
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    debitNoteValue: { type: Number, required: true },

    invoiceID: { type: mongoose.Schema.Types.ObjectId, default: null },
    invoiceNumber: { type: String, default: null },
    claims: [{
        storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        debitNoteValue: { type: Number, required: true },
        saleBillId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true }
        },
        createdAt: { type: Date, default: Date.now, required: false },
        updatedAt: { type: Date, default: Date.now, required: false }
    }],
    debitNote: { type: String, default: null },
    debitTC: { type: String, default: null },
    debitNoteStatus: { type: String, default: null },
    debitNoteCancelReason: { type: String, default: null },
    debitNoteCancelComment: { type: String, default: null },
    isDeleted: { type: Boolean, required: false, default: false },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }
}, { versionKey: false });

const model = mongoose.model('debit_notes', debitNoteSchema);
const readOnlyModel = secondaryDB.model('debit_notes', debitNoteSchema);



/// debit note Activity
const collectionActivitySchema = new mongoose.Schema({
    debitNoteId: { type: mongoose.Schema.Types.ObjectId, required: [true, "debitNoteId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    comments: { type: String, required: false, default: null },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('debit_note_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('debit_note_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const debitNoteActivityJoiSchema = Joi.object({
    debitNoteId: Joi.object().required(),
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
const createActivity = async function (debitNoteActivityData) {
    if (debitNoteActivityData.what.oldValues && debitNoteActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(debitNoteActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(debitNoteActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                debitNoteActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                debitNoteActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // debitNoteActivityData.what.oldValues === null && debitNoteActivityData.what.newValues === null ? delete debitNoteActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(debitNoteActivityData, debitNoteActivityJoiSchema, { abortEarly: false }).then(async (debitNoteActivityData) => {
            await modelActivity(debitNoteActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}




module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    activityKey: "debitNoteId"
}