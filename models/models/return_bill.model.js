const mongoose = require('mongoose');
const Joi = require('joi');
const constants = require('../config/constants');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const MongoHookDataFunctions = require('./functions/hook.functions');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const returnBillSchema = new mongoose.Schema({

    offlineBillNumber: { type: String, default: null, required: false },
    offlineId: { type: String, default: null, required: false, default: null },
    returnBillNumber: { type: String, required: false, default: null },
    returnReason: { type: String, required: false, default: null },
    returnNotes: { type: String, required: false, default: null },
    returnBillDate: { type: Date, required: false },
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    businessUnitName: { type: String, required: false, default: null },  
    customer: {
        customerId: { type: mongoose.Schema.Types.ObjectId, required: false },
        customerType: { type: String, required: false },
        customerName: { type: String, required: false },
        phoneNumber: { type: String, required: false },
        emailAddress: { type: String },
        billingAddress: {
            type: new mongoose.Schema({
                attention: { type: String },
                addressLine1: { type: String, required: false },
                addressLine2: { type: String },
                city: {
                    cityId: { type: mongoose.Schema.Types.ObjectId },
                    name: { type: String }
                },
                state: {
                    stateId: { type: mongoose.Schema.Types.ObjectId },
                    name: { type: String },
                    stateCode: { type: String }
                },
                pinCode: { type: String },
                country: {
                    countryId: { type: mongoose.Schema.Types.ObjectId },
                    name: { type: String },
                    countryCode: { type: String }
                },
            }), required: false, default: null
        },
        deliveryAddress: {
            type: new mongoose.Schema({
                attention: { type: String },
                addressLine1: { type: String, required: false },
                addressLine2: { type: String },
                city: {
                    cityId: { type: mongoose.Schema.Types.ObjectId },
                    name: { type: String }
                },
                state: {
                    stateId: { type: mongoose.Schema.Types.ObjectId },
                    name: { type: String },
                    stateCode: { type: String }
                },
                pinCode: { type: String },
                country: {
                    countryId: { type: mongoose.Schema.Types.ObjectId },
                    name: { type: String },
                    countryCode: { type: String }
                },
                mapLocation: {
                    latitude: { type: Number, required: false },
                    longitude: { type: Number, required: false }
                }
            }), required: false, default: null
        },
        GSTIN: { type: String }
    },
    products: [
        {
            returnReason: {
                type: {
                    _id: { type: mongoose.Schema.Types.ObjectId, required: false },
                    reason: { type: String, required: false }
                },
                default: null
            },
            isVariableSize: { type: Boolean, required: false, default: false },
            isGift: { type: Boolean, required: false, default: false },
            bundleGiftItem: { type: String, required: false },
            bundleGiftReturnStatus: { type: String, required: false },
            isComboBuyProduct: { type: Boolean, required: false, default: false },  // is combo buy product.
            comboOfferId: { type: mongoose.Schema.Types.ObjectId, default: null, required: false }, // combo offer id.
            isCombo: { type: Boolean, required: false, default: false }, // is combo applied to this product.

            totalPurchasedQuantity: { type: Number, required: false },
            totalPurchasePrice: { type: Number, required: false },
            totalPurchaseUnitSize: { type: Number, required: false },

            returnQuantity: { type: Number, required: false },  // total return quantity.
            returnUnitSize: { type: Number, required: false },  // total return unit size.
            totalReturnPrice: { type: Number, required: false }, // total return price

            saleBillId: { type: mongoose.Schema.Types.ObjectId, required: false },
            saleBillNumber: { type: String, required: false },
            podBillNumber: { type: String, default: null },
            invoiceNumber: { type: String },
            saleBillDate: { type: String, required: false },
            saleBillType: { type: String, required: false }, //SalesBill, SalesInvoice, POD

            productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
            masterProductId: { type: mongoose.Schema.Types.ObjectId, required: false },
            productCode: { type: String, required: false },
            productName: { type: String, required: false },
            displayName: { type: String, required: false },
            invoiceDisplayName: { type: String, required: false },

            inventoryType: { type: String },
            batchProducts: [
                {
                    productId: { type: mongoose.Schema.Types.ObjectId, required: false },
                    scanCode: { type: String, required: false },
                    batchNumber: { type: String, required: false },
                    packedDate: { type: Date },
                    expiryDate: { type: Date },
                    isPackOpened: { type: Boolean, required: false, default: false },

                    purchaseUnitSize: { type: Number, required: false, default: 0 },
                    soldPrice: { type: Number, required: false, default: 0 },

                    quantity: { type: Number, required: false, default: 1 },
                    returnUnitSize: { type: Number, required: false, default: 0 },
                    returnAmount: { type: Number, required: false, default: 0 },
                }
            ],
            unit: {
                unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
                unitName: { type: String },
                unitSymbol: { type: String },
                unitSize: { type: Number }
            },


            baseSellingPrice: { type: Number, required: false },
            unitMaximumPrice: { type: Number, required: false },
            sellingPrice: { type: Number, required: false },
            discountAmount: { type: Number, required: false },
            sellingPriceWithDiscount: { type: Number, required: false },
            comboBaseSellingPrice: { type: Number, required: false },
            purchasePrice: { type: Number, required: false },
            taxes: [
                {
                    taxId: { type: mongoose.Schema.Types.ObjectId, required: false },
                    taxRegistrarName: { type: String, required: false },
                    taxName: { type: String, required: false },
                    taxGroup: { type: String, required: false },
                    taxPercentage: { type: Number, required: false }
                }
            ],
            taxAmount: { type: Number, required: false },
        }
    ],
    returnProductsAmount: { type: Number, required: false },
    adjustmentAmount: { type: Number, required: false },
    returnTotalAmount: { type: Number, required: false },
    roundOffAmount: { type: Number, required: false }, /// Round off amount    

    attachments: {
        type: [
            {
                fileName: { type: String, default: null },
                originalName: { type: String, default: null },
                appName: { type: String, default: null },
                userId: { type: mongoose.Schema.Types.ObjectId, default: null },
                updatedAt: { type: Date, default: Date.now, required: false }
            }
        ],  // This specifies that it's an array of strings
        default: null,   // Default value is null
    },
    billCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String }
    },
    returnPayments: [{
        paymentType: { type: String, required: false }, ///UPI, CreditNote, BankTransfer, CardPayment, Cash
        paymentAmount: { type: Number, required: false },
        totalPaidAmount: { type: Number, required: false },
        paymentNote: { type: String },
        loyaltyPointValue: { type: Number, required: false },
        paymentOption: { type: String, required: false },/// Accounts, customerWallet, creditNote, loyaltyPoint
        ledgerTransactionId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        ledgerId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        creditNoteId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        customerWalletTransactionId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        loyalPointId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        createdAt: { type: Date, default: Date.now, required: false },
        updatedAt: { type: Date, default: Date.now, required: false }
    }],
    isReturnAndExchange: { type: Boolean, required: false, default: false },

    storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    storeName: { type: String, default: null, required: false },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    warehouseName: { type: String, default: null, required: false },
    appName: { type: String, default: null, required: false, default: null },
    saleIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false }
    },
    saleBillId: { type: mongoose.Schema.Types.ObjectId, required: false },
    status: { type: String, required: false, default: constants.draft },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: String, required: false, default: false },
    approvalStatus: { type: String, required: false, default: "auto approved" },
}, { versionKey: false });

const model = mongoose.model('return_bills', returnBillSchema);
const modelSecondary = secondaryDB.model('return_bills', returnBillSchema);


/// ReturnBill request Activity
const collectionActivitySchema = new mongoose.Schema({
    returnBillId: { type: mongoose.Schema.Types.ObjectId, required: [true, "returnBillId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('return_bill_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('return_bill_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const returnBillActivityJoiSchema = Joi.object({
    returnBillId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool()
});

/// create activity
const createActivity = async function (returnBillActivityData) {
    if (returnBillActivityData.what.oldValues && returnBillActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(returnBillActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(returnBillActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                returnBillActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                returnBillActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // returnBillActivityData.what.oldValues === null && returnBillActivityData.what.newValues === null ? delete returnBillActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(returnBillActivityData, returnBillActivityJoiSchema, { abortEarly: false }).then(async (returnBillActivityData) => {
            await modelActivity(returnBillActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};


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
                        "returnBillId": selectedData._id,
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
                                "collectionName": "stock_requests",
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
                                    isApprovalRequired: false
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
                        "returnBillId": selectedData._id,
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
                                message: "return bill removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "return bill not found!",
                    errorCode: "VALIDATION_ERROR",
                });

            }

        }).catch((error) => { reject(error); });

    });

}

returnBillSchema.pre('save', async function (next) {
  try {
    const locationDetails = await MongoHookDataFunctions.getLocationAndBusinessUnitNames({
        storeId: this.storeId,
        storeName: this.storeName,
        warehouseId: this.warehouseId,
        warehouseName: this.warehouseName,
        businessUnitId: this.businessUnitId,
        businessUnitName: this.businessUnitName,
    });

    if(locationDetails?.updatedFields?.length > 0){
        this.businessUnitName = locationDetails.businessUnitName;
        this.storeName = locationDetails.storeName;
        this.warehouseName = locationDetails.warehouseName;
        for (const field of locationDetails.updatedFields) {
            this.markModified(field);
        }
    }
    next();
  } catch (err) {
    console.error("Error in pre-save hook:", err);
    next();
  }
});


returnBillSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();
    
    const locationDetails = await MongoHookDataFunctions.getLocationAndBusinessUnitNames(update.$set ?? update);

    if(locationDetails?.updatedFields?.length > 0){
        for (const field of locationDetails.updatedFields) {
            const value = locationDetails[field];
            if (update.$set) {
                update.$set[field] = value;
            } else {
                update[field] = value;
            }
        }
    }

    next();
  } catch (err) {
    console.error("Error in pre-update hook:", err);
    next();
  }
});


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
    removeCollection: removeCollection,
}