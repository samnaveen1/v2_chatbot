const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const stockRequestSchema = new mongoose.Schema({
    requestNumber: { type: String, default: null },
    fromStockType: { type: String, required: true },
    toStockType: { type: String, required: true },
    summary: { type: String, required: false, default: null },
    notes: { type: String, required: false, default: null },
    attachments: {
        type: [
            {
                fileName: { type: String, default: null },
                displayName: { type: String, default: null }
            }
        ],  // This specifies that it's an array of strings
        default: null,   // Default value is null
    },
    approvedBy: {
        type: new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String, required: false, default: null },
        }),
        required: false, default: null
    },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    rejectReason: { type: String, required: false, default: null },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    isDeleted: { type: Boolean },
    requestFrom: {
        branchType: { type: String, required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId },
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        appName: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId }
    },
    requestProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
        masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, default: null },
        productBatchItems: [{ type: mongoose.Schema.Types.ObjectId, default: null }],
        stockType: { type: String, required: false, default: null },
        unit: {
            unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
            unitName: { type: String },
            unitSymbol: { type: String },
            unitSize: { type: Number }
        },
        isVariableSize: { type: Boolean, required: false, default: false },
        batchNumber: { type: String },
        quantity: { type: Number, required: true },
        unitMaximumRetailPrice: { type: Number, required: true },
        isExpirable: { type: Boolean, required: true, default: false },
        isPackOpened: { type: Boolean, default: false },
        returnUnitSize: { type: Number, default: null },
        packedDate: { type: Date, required: true },
        expiryDate: { type: Date, required: false, default: null },
    }],
    totalQuantity: { type: Number, default: 0 }
}, { versionKey: false });

const model = mongoose.model('stock_movement_requests', stockRequestSchema);
const modelSecondary = secondaryDB.model('stock_movement_requests', stockRequestSchema);

/// Stock request Activity
const collectionActivitySchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, required: [true, "requestId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = mongoose.model('stock_movement_request_activities', collectionActivitySchema);
const modelActivitySecondary = secondaryDB.model('stock_movement_request_activities', collectionActivitySchema);


/**
 * Activity Schema for Validation
 */
const stockMovementJoiSchema = Joi.object({
    requestId: Joi.object().required(),
    action: Joi.string().required(),
    comments: Joi.string(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    isApproveAction: Joi.bool(),
    approvalType: Joi.string().allow(null),
    approvalStatus: Joi.string()
});


/// create activity
const createActivity = async function (stockMovementData) {
    if (stockMovementData.what.oldValues && stockMovementData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(stockMovementData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(stockMovementData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                stockMovementData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                stockMovementData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // stockMovementData.what.oldValues === null && stockMovementData.what.newValues === null ? delete stockMovementData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(stockMovementData, stockMovementJoiSchema, { abortEarly: false }).then(async (stockMovementData) => {
            await modelActivity(stockMovementData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}

module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    activityCollection: modelActivity,
    createActivity: createActivity
}