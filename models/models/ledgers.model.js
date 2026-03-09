const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const ledgerSchema = new mongoose.Schema({
    ledgerName: { type: String, required: true },
    ledgerFor: { type: String, required: true },  // Store, businessUnit
    // storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ledgerShortName: { type: String },
    ledgerType: { type: String, required: true }, // Cash, CC / OD account, Current account, Credit card   
    creditCardNumbers: [
        {
            type: new mongoose.Schema({             
                cardNumber: { type: String, required: true },              
                isExpired: { type: Boolean, default: false, required: true }
            }),
            required: false, default: []
        },
    ],
    ledgerBank: {
        type: new mongoose.Schema({
            // accountname: { type: String, required: true },
            accountNumber: { type: String, required: true },
            bankName: { type: String, required: true },
            branchName: { type: String, required: true },
            bankIFSC: { type: String, required: true }
        }), required: false, default: null
    },
    // posDeviceId: { type: mongoose.Schema.Types.ObjectId, required: false },
    posDeviceId: { type: String, required: false },
    associateLedgerId: { type: mongoose.Schema.Types.ObjectId, required: false },
    associateLedgerName: { type: String, required: false },
    currencyId: { type: mongoose.Schema.Types.ObjectId, required: true },
    minimumBalance: { type: Number },
    interestRate: { type: Number },
    isFavoriteLedger: { type: Boolean, required: true },
    allowStoreAccess: { type: Boolean, required: true },
    // toAllStores: { type: Boolean, required: true },
    isDefaultSaleLedger: { type: Boolean, required: false, default: false },
    assignedStores: [
        {
            type: new mongoose.Schema({
                storeId: { type: mongoose.Schema.Types.ObjectId, required: true },
                storeName: { type: String, required: true },
                storeLocation: { type: String, required: true },
                access: { type: String, required: true }, /// allAccess, viewAndTransferOnly, transferOnly, viewOwnTransactionAndTransferOnly
                isDisabled: { type: Boolean, default: false, required: true }
            }),
            required: false, default: []
        },
    ],
    posDevices: [
        {
            type: new mongoose.Schema({
                storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
                storeName: { type: String, required: false, default: null },
                businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
                businessUnitName: { type: String, required: false, default: null },
                isDisabled: { type: Boolean, default: false, required: true },
                posDeviceId: { type: String, required: true },
                posDeviceName: { type: String, required: true },
            }),
            required: false, default: []
        },
    ],
    mappedUPIs: [
        {
            type: new mongoose.Schema({
                stores: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
                isDisabled: { type: Boolean, default: false, required: true },
                upiId: { type: String, required: true },
                displayName: { type: String, required: true },
            }),
            required: false, default: []
        },
    ],
    ledgerOpeningBalance: { type: Number, required: true },
    overDraftLimit: { type: Number, required: false },
    withdrawalLimit: { type: Number, required: false },
    ledgerOpeningDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    updatedAt: { type: Date, default: null },
    updatedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, default: null },
        name: { type: String, default: null }
    },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    ledgerStatus: { type: Boolean, required: true },
    isDisabled: { type: Boolean, default: false },
    // isClosed: { type: Boolean, default: false },
}, { versionKey: false });


const model = mongoose.model('ledgers', ledgerSchema);
const readOnlyModel = secondaryDB.model('ledgers', ledgerSchema);

/// Ledger Activity
const collectionActivitySchema = new mongoose.Schema({
    ledgerId: { type: mongoose.Schema.Types.ObjectId, required: [true, "ledgerId is required"] },
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

const modelActivity = activitiesDB.model('ledger_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('ledger_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const ledgerActivityJoiSchema = Joi.object({
    ledgerId: Joi.object().required(),
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
const createActivity = async function (ledgerActivityData) {
    if (ledgerActivityData.what.oldValues && ledgerActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(ledgerActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(ledgerActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                ledgerActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                ledgerActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // ledgerActivityData.what.oldValues === null && ledgerActivityData.what.newValues === null ? delete ledgerActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(ledgerActivityData, ledgerActivityJoiSchema, { abortEarly: false }).then(async (ledgerActivityData) => {
            await modelActivity(ledgerActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    activityKey: "ledgerId"
}