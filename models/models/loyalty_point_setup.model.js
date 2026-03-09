const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const loyaltySchema = new mongoose.Schema({
    loyaltyType: { type: String, required: true },
    loyaltyCode: { type: String, required: true },
    loyaltyName: { type: String, required: true },
    loyaltyDescription: { type: String },
    loyaltyStartDate: { type: Date, required: true },
    loyaltyEndDate: { type: Date, default: null },
    minCurencyValue: { type: Number },
    currencyToPointValue: { type: Number, required: true },
    toAllProducts: { type: Boolean, required: true },
    exceptionProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
        toAllProductsInCategory: { type: Boolean, required: true },
        masterProductIds: [{ type: mongoose.Schema.Types.ObjectId }]
    }],
    // exceptionProducts: {
    //     productCategories: [{ type: mongoose.Schema.Types.ObjectId }],
    //     // toAllProductsInCategory: { type: Boolean, required: true },
    //     products: [{ type: mongoose.Schema.Types.ObjectId }]
    // },
    toAllCustomers: { type: Boolean, required: true },
    // cutomersMapped: [{
    //     customerGroupId: { type: mongoose.Schema.Types.ObjectId, required: true },
    //     toAllCustomersInGroup: { type: Boolean, required: true },
    //     customerIds: [{ type: mongoose.Schema.Types.ObjectId }]
    // }],
    cutomersMapped: {
        customerGroups: [{ type: mongoose.Schema.Types.ObjectId }],
        customers: [{ type: mongoose.Schema.Types.ObjectId }]
    },
    toAllStores: { type: Boolean, required: true },
    storesMapped: [{ type: mongoose.Schema.Types.ObjectId }],
    toAllWarehouse: { type: Boolean, required: true },
    warehouseMapped: [{ type: mongoose.Schema.Types.ObjectId }],
    toAllWeekDays: { type: Boolean, required: true },
    weekDays: [{
        dayName: { type: String, required: true },
        // isMapped: { type: String, required: true },
        // toFullDay: { type: Boolean, required: true },
        // hoursRange: [{
        //     from: { type: String, required: true },
        //     to: { type: String, required: true }
        // }]
        isAppliedFullDay: {
            type: Boolean,
            default: false
        },
        hoursRange: [
            {
                from: { type: String },
                to: { type: String }
            }
        ]
    }],
    toAllMonthDate: { type: Boolean, required: true },
    exceptionMonthDateList: [{ type: Number }],
    approvalStatus: { type: String, required: true },
    status: { type: Boolean, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false })

const model = mongoose.model('loyalty_point_setup', loyaltySchema);
const readOnlyModel = secondaryDB.model('loyalty_point_setup', loyaltySchema);


/// loyalty setup Activity
const collectionActivitySchema = new mongoose.Schema({
    loyaltySetupId: { type: mongoose.Schema.Types.ObjectId, required: [true, "loyaltySetupId is required"] },
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

const modelActivity = activitiesDB.model('loyalty_setup_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('loyalty_setup_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const loyaltyActivityJoiSchema = Joi.object({
    loyaltySetupId: Joi.object().required(),
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
const createActivity = async function (loyaltyActivityData) {
    if (loyaltyActivityData.what.oldValues && loyaltyActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(loyaltyActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(loyaltyActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                loyaltyActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                loyaltyActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // loyaltyActivityData.what.oldValues === null && loyaltyActivityData.what.newValues === null ? delete loyaltyActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(loyaltyActivityData, loyaltyActivityJoiSchema, { abortEarly: false }).then(async (loyaltyActivityData) => {
            await modelActivity(loyaltyActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}


/// references are available.
const availableReferences = {
    // "users": [{"field":"warehouseMapped","dataType":"Array"}],
    // "user_activities": [
    //   {"field":"what.oldValues.warehouseMapped","dataType":"Array"},
    //   {"field":"what.newValues.warehouseMapped","dataType":"Array"}
    // ],
    // "transport_activites": [
    //   {"field":"_id","dataType":"String"}
    // ]
};

/// remove record.
const removeCollection = function (collectionId, data) {


    return new Promise(function (resolve, reject) {

        let where = { _id: collectionId };
        model.findOne(where, {}).then(async (selectedData) => {

            if (selectedData) {

                if (data.approvalRequired) {

                    var approvalModel = require('./approval.model');

                    /// Create activity log for approval request.
                    let activityLog = {
                        "loyaltySetupId": selectedData._id,
                        "action": "Delete",
                        "who": { "userId": data.user._id, "name": data.user.name },
                        "what": { "oldValues": selectedData },
                        "when": data.timeStamp,
                        "mode": data.mode,
                        "approvalType": data.approvalType,
                        "approvalStatus": "pending"
                    };

                    createActivity(activityLog).then((history) => {

                        if (history) {

                            let approvalRequest = {
                                "moduleName": data.moduleName,
                                "collectionName": "loyalty_point_setup",
                                "collectionId": selectedData._id,
                                "activityId": history._id,
                                "approvalType": history.approvalType,
                                "approvalTitle": selectedData.productName,
                                "requestType": "Delete",
                                "who": {
                                    "userId": data.user._id,
                                    "name": data.user.name,
                                    "phone": data.user.phone,
                                },
                                "createdAt": data.timeStamp,
                                "updatedAt": data.timeStamp,
                                "approvalStatus": "pending"
                            };

                            approvalModel(approvalRequest).save().then((approvalRequest) => {

                                resolve({
                                    success: true,
                                    message: "Delete approval request created successfully!",
                                    data: history,
                                    approvalRequest: history,
                                    isApprovalRequired: true
                                });

                            }).catch((e) => {

                                /// Roleback request.
                                modelActivity.findByIdAndRemove({ '_id': history._id },
                                    function (errHistory, historyObject) {
                                        if (errHistory) { reject(errHistory); } else { reject(e); }
                                    });

                            });


                        } else {

                            reject({
                                message: "Opps! something went wrong.",
                                errorCode: "ERROR"
                            });

                        }
                    }).catch((error) => { reject(error); });


                } else {

                    let requiredModels = {};
                    let isReferenceAvailable = false;
                    let promiseCollections = [];

                    for (referenceCollectionName in availableReferences) {
                        let referenceCollection = requiredModels[referenceCollectionName];
                        if (referenceCollection) {
                            let referenceConditions = availableReferences[referenceCollectionName];
                            let where = {};
                            let conditionCount = referenceConditions.length;
                            let orConditions = [];
                            for (let i = 0; i < conditionCount; i++) {
                                let condition = {};
                                if (referenceConditions[i]['dataType'] == "Array") {
                                    condition[referenceConditions[i]['field']] = { $elemMatch: { $eq: collectionId } };
                                    orConditions.push(condition);
                                } else {
                                    condition[referenceConditions[i]['field']] = collectionId;
                                    orConditions.push(condition);
                                }
                            }
                            if (conditionCount > 1) {
                                where["$or"] = orConditions;
                            } else {
                                where = orConditions[0];
                            }
                            promiseCollections.push(referenceCollection.findOne(where, { _id: 1 }));
                        }
                    }
                    let promiseLength = promiseCollections.length;
                    if (promiseLength > 0) {
                        await Promise.allSettled(promiseCollections).then((promiseResults) => {
                            for (let i = 0; i < promiseResults.length; i++) {
                                if (promiseResults[i] && isReferenceAvailable == false) {
                                    isReferenceAvailable = true;
                                }
                            }
                        }).catch((e) => { reject(e); });
                    }

                    /// Create Activity data.
                    let activityLog = {
                        "loyaltySetupId": selectedData._id,
                        "action": "Delete",
                        "who": { "userId": data.user._id, "name": data.user.name },
                        "what": { "oldValues": selectedData },
                        "when": data.timeStamp,
                        "mode": data.mode
                    };

                    /// validate and Create Activity. 
                    createActivity(activityLog).then((activity) => {
                        let removeFn = null;
                        if (isReferenceAvailable) {
                            removeFn = model.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
                        } else {
                            removeFn = model.findByIdAndRemove({ '_id': selectedData._id });
                        }
                        /// Remove product data             
                        removeFn.then((removeObject) => {
                            resolve({
                                success: true,
                                message: "Loyalty setup removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Loyalty setup not found!",
                    errorCode: "VALIDATION_ERROR",
                });

            }

        }).catch((error) => { reject(error); });

    });

}

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    removeCollection: removeCollection,
}