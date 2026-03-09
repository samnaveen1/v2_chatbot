const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// day_closes
const collectionSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    storeName: { type: String, required: true },
    storeAddress: {
        addressLine1: { type: String, required: [false, "Address line 1 is required"] },
        addressLine2: { type: String, required: false },
        pinCode: { type: String, required: false },
        city: {
            cityId: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String }
        },
        state: {
            stateId: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String },
            stateCode: { type: String }
        },
        country: {
            countryId: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String },
            countryCode: { type: String }
        }
    },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    dayCloseNumber: { type: String, require: false },
    previousDayCloseTime: { type: Date, required: false },
    // openingBalance: { type: Number, required: false },
    dayCloseTime: { type: Date, required: true },
    dayCloseData: { type: Object, required: false },
    // salesBill: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // invoice: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // totalSales: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // receivedPayments: [{
    //     ledgerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    //     ledgerName: { type: String, required: true },
    //     totalAmount: { type: Number, required: true },
    //     totalBillCount: { type: Number, required: true }
    // }],
    // totalReceivedPayments: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // cashExpense: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // bankExpanse: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // returnBillSettlements: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // totalExpense: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // cashDeposit: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // bankTransfer: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // totalTransfer: {
    //     totalAmount: { type: Number, required: true },
    //     itemCount: { type: Number, required: true }
    // },
    // closingCashBalance: { type: Number, required: true },
    isVerified: { type: Boolean, required: true },
    isDayCloseReviewVerified: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, required: true },
    dayCloseVerifiedOn: { type: Date, required: false },
    storeFlag: { type: Boolean, default: false },
    adminFlag: { type: Boolean, default: false },
    storeFlagEnabledBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false },
        updatedAt: { type: Date, required: false }
    },
    adminFlagEnabledBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false },
        updatedAt: { type: Date, required: false }
    },
    dayCloseBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        userRole: { type: String, required: true }
    },
    dayCloseReviewVerifiedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false },
        userRole: { type: String, required: false }
    },
    isBalanceChanged: { type: Boolean, required: false, default: false },
    balanceAfterVerification: [
        {
            type: new mongoose.Schema({
                ledgerTransactionId: { type: mongoose.Schema.Types.ObjectId, required: false },
                ledgerName: { type: String, required: false },
                ledgerOpeningBalance: { type: Number, required: false, default: 0 },
                ledgerTransactionOpeningBalance: { type: Number, required: false, default: 0 },
                ledgerTransactionClosingBalance: { type: Number, required: false, default: 0 },
            }),
            required: false
        }]
}, { versionKey: false });

const model = mongoose.model('day_closes', collectionSchema);
const readOnlyModel = secondaryDB.model('day_closes', collectionSchema);




/// Day close Activity
const collectionActivitySchema = new mongoose.Schema({
    dayCloseId: { type: mongoose.Schema.Types.ObjectId, required: [true, "dayCloseId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    comments: { type: String, required: false, default: undefined },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('day_close_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('day_close_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
*/
const dayCloseActivityJoiSchema = Joi.object({
    dayCloseId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    comments: Joi.string(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool()
});

/// create activity
const createActivity = async function (dayCloseActivityData) {
    if (dayCloseActivityData.what.oldValues && dayCloseActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(dayCloseActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(dayCloseActivityData.what.newValues))
    
        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                dayCloseActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                dayCloseActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null
    
                // dayCloseActivityData.what.oldValues === null && dayCloseActivityData.what.newValues === null ? delete dayCloseActivityData.what : null
            }
        })
      }
    return new Promise(function (resolve, reject) {
        Joi.validate(dayCloseActivityData, dayCloseActivityJoiSchema, { abortEarly: false }).then(async (dayCloseActivityData) => {
            await modelActivity(dayCloseActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};



module.exports = {
    collection: model,
    activityCollection: modelActivity,
    createActivity: createActivity,
    activityKey: "dayCloseId",
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
};