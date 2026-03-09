const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// customer wallet
const collectionSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    walletFrom: { type: String, required: true }, //Return Bill, Ledger Transaction, Customer outstanding excess amount
    returnBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
    ledgerTransactionId: { type: mongoose.Schema.Types.ObjectId, default: null },
    walletNumber: { type: String, required: true },
    walletDate: { type: Date, required: true },
    walletCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String, require: true }
    },
    salesIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    walletAmount: { type: Number, required: true },
    // hasValidity: { type: Boolean, required: true, default: false },
    hasValidity: { type: Boolean, required: false, default: false },
    expiryDate: { type: Date },
    claims: [{
        storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        claimAmount: { type: Number, required: true },
        saleBillId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true }
        },
        createdAt: { type: Date, default: Date.now, required: false },
        updatedAt: { type: Date, default: Date.now, required: false }
    }],
    customerNote: { type: String, default: null },
    termsAndConditions: { type: String, default: null },
    status: { type: String, default: 'pending' },//pending, completed   
    isArchived: { type: Boolean, required: false, default: false },
    isDeleted: { type: Boolean, required: false, default: false },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }   
}, { versionKey: false });
const Collection = mongoose.model('customer_wallets', collectionSchema);
const readOnlyCollection = secondaryDB.model('customer_wallets', collectionSchema);

/// Customer wallet Activity
const collectionActivitySchema = new mongoose.Schema({
    customerWalletId: { type: mongoose.Schema.Types.ObjectId, required: [true, "customerWalletId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    comments: { type: String, required: false, default: undefined },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const ActivityCollection = activitiesDB.model('customer_wallet_activities', collectionActivitySchema);
const readOnlyActivityCollection = activitiesSecondaryDB.model('customer_wallet_activities', collectionActivitySchema);


/**
 * Activity Schema for Validation
 */
const customerWalletActivityJoiSchema = Joi.object({
    customerWalletId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    comments: Joi.string(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});


/// create activity
const createActivity = async function (customerWalletActivityData) {
    if (customerWalletActivityData.what.oldValues && customerWalletActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(customerWalletActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(customerWalletActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                customerWalletActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                customerWalletActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // customerWalletActivityData.what.oldValues === null && customerWalletActivityData.what.newValues === null ? delete customerWalletActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        if (customerWalletActivityData.what) {
            Joi.validate(customerWalletActivityData, customerWalletActivityJoiSchema, { abortEarly: false }).then(async (customerWalletActivityData) => {
                await ActivityCollection(customerWalletActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
            }).catch((error) => { reject(error); });
        } else {
            resolve("")
        }
    });
}

module.exports = {
    collection: Collection,
    activityCollection: ActivityCollection,
    readOnlyCollection: readOnlyCollection,
    readOnlyActivityCollection: readOnlyActivityCollection,
    createActivity: createActivity
};
