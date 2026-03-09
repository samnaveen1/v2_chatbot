const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const creditNoteSchema = new mongoose.Schema({
    creditNoteNumber: { type: String, required: true },
    creditDate: { type: Date, required: true },
    reason: {
        type: new mongoose.Schema({              
            creditID: { type: mongoose.Schema.Types.ObjectId, default: null },              
            creditReason: { type: String, default: null  },
        }), required: false, default: null          
    },
    salesIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    creditNoteCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String, require: true }
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    creditNoteValue: { type: Number, required: true },

    invoiceID: { type: mongoose.Schema.Types.ObjectId, default: null },
    invoiceNumber: { type: String, default: null },
    claims: [{
        storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        creditNoteValue: { type: Number, required: true },
        saleBillId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true }
        },
        createdAt: { type: Date, default: Date.now, required: false },
        updatedAt: { type: Date, default: Date.now, required: false }
    }],
    creditNote: { type: String, default: null },
    creditTC: { type: String, default: null },
    creditNoteStatus: { type: String, default: null },
    creditNoteCancelReason: { type: String, default: null },
    creditNoteCancelComment: { type: String, default: null },
    isDeleted: { type: Boolean, required: false, default: false },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }
}, { versionKey: false });

const model = mongoose.model('credit_notes', creditNoteSchema);
const readOnlyModel = secondaryDB.model('credit_notes', creditNoteSchema);



/// credit note Activity
const collectionActivitySchema = new mongoose.Schema({
    creditNoteId: { type: mongoose.Schema.Types.ObjectId, required: [true, "creditNoteId is required"] },
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

const modelActivity = activitiesDB.model('credit_note_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('credit_note_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const creditNoteActivityJoiSchema = Joi.object({
    creditNoteId: Joi.object().required(),
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
const createActivity = async function (creditNoteActivityData) {

    if (creditNoteActivityData.what.oldValues && creditNoteActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(creditNoteActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(creditNoteActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                creditNoteActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                creditNoteActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // creditNoteActivityData.what.oldValues === null && creditNoteActivityData.what.newValues === null ? delete creditNoteActivityData.what : null
            }
        })
    }
    
    return new Promise(function (resolve, reject) {
        if (creditNoteActivityData.what) {
            Joi.validate(creditNoteActivityData, creditNoteActivityJoiSchema, { abortEarly: false }).then(async (creditNoteActivityData) => {
                await modelActivity(creditNoteActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
            }).catch((error) => { reject(error); });
        }else {
            resolve("")
        }
    });
}




module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    activityKey: "creditNoteId"
}