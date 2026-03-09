const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const loyaltyPointsSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, required: false },
    loyaltyPointValue: { type: Number, required: true },
    saleBillId: { type: mongoose.Schema.Types.ObjectId },
    hasValidity: { type: Boolean, default: false },
    expiryDate: { type: Date, default: null },
    redeems: [{
        storeId: { type: mongoose.Schema.Types.ObjectId, required: false },
        businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false },
        loyaltyPointValue: { type: Number, required: true },
        saleBillId: { type: mongoose.Schema.Types.ObjectId },
        returnBillId: { type: mongoose.Schema.Types.ObjectId },
        createdBy: {
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            name: { type: String, required: true }
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }],
    status: { type: String, default: 'pending' },//pending, completed   
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isOpeningBalance: { type: Boolean, required: false, default: false },
    isDeleted: { type: Boolean, required: false, default: false },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { versionKey: false })

const model = mongoose.model('loyalty_points', loyaltyPointsSchema);
const readOnlyModel = secondaryDB.model('loyalty_points', loyaltyPointsSchema);


/// loyalty points Activity
const collectionActivitySchema = new mongoose.Schema({
    loyaltyPointId: { type: mongoose.Schema.Types.ObjectId, required: [true, "loyaltyPointId is required"] },
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

const modelActivity = activitiesDB.model('loyalty_points_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('loyalty_points_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const loyaltyPointActivityJoiSchema = Joi.object({
    loyaltyPointId: Joi.object().required(),
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
const createActivity = async function (loyaltyPointActivityData) {
    if (loyaltyPointActivityData.what.oldValues && loyaltyPointActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(loyaltyPointActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(loyaltyPointActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                loyaltyPointActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                loyaltyPointActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // loyaltyPointActivityData.what.oldValues === null && loyaltyPointActivityData.what.newValues === null ? delete loyaltyPointActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(loyaltyPointActivityData, loyaltyPointActivityJoiSchema, { abortEarly: false }).then(async (loyaltyPointActivityData) => {
            await modelActivity(loyaltyPointActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyCctivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
}