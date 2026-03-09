
const mongoose = require('mongoose');
const Joi = require('joi');

const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const productSchema = new mongoose.Schema({

    inventoryType: { type: String },
    productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productName: { type: String, default: null },
    displayName: { type: String, default: null },
    unit: {
        unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
        unitName: { type: String },
        unitSymbol: { type: String },
        unitSize: { type: Number }
    },
    batchNumber: { type: String, required: true },
    manufacturerBatchNumber: { type: String, required: false },
    manufacturerBarcode: { type: String, required: false },
    oldBatchNumber: [{
        batchNumber: { type: String, required: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    }],
    productCategoryName: { type: String, default: null },
    priceUpdatedVia: { type: String, default: null }, ///singleBatchAllLocation, singleLocationAllBatch, allBatchesAndLocations
    isDateUpdated: { type: Boolean, default: false }, ///true, false
    unitMaximumRetailPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: false },
    basePurchasePrice: { type: Number, default: null },
    unitDiscountPercentage: { type: Number },
    purchaseTaxes: [{
        taxId: { type: mongoose.Schema.Types.ObjectId },
        taxGroup: { type: String },
        taxRegistrarName: { type: String },
        taxPercentage: { type: Number, required: true }
    }],
    stockHolder: { type: String, required: false, default: null },
    storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, default: null },
    storeName: { type: String, default: null },
    warehouseName: { type: String, default: null },
    bundleGiftItem: { type: String, default: null },
    isPurchaseOnly: { type: Boolean, required: false, default: false },
    isVariableSize: { type: Boolean, required: true, default: false },
    printTemplateId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isExpirable: { type: Boolean, required: true, default: false },
    packedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: false, default: null },
    receivingStock: { type: Number, required: true },
    hasVendorScanCode: { type: Boolean, required: true },
    isUniqueScanCode: { type: Boolean, required: true },
    isAlreadyGeneratedScanCode: { type: Boolean, required: false, default: null },
    // isPartialScanCode: { type: Boolean, required: false, default: false },
    mismatchFlag: { type: Boolean, required: false, default: false },
    products: [{

        //// For Sold Stock
        saleBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
        saleBillNumber: { type: String, default: null },
        sellingPrice: { type: Number, required: false },
        soldByScancodeMatched: { type: Boolean, required: false, default: null },
        taxes: {
            type: [{
                taxId: { type: mongoose.Schema.Types.ObjectId, required: false },
                taxRegistrarName: { type: String, required: false },
                taxName: { type: String, required: false },
                taxGroup: { type: String, required: false },
                taxPercentage: { type: Number, required: false }
            }],
            default: null,
            required: false
        },

        //// For Return Stock
        returnBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
        returnBillNumber: { type: String, default: null },
        isPackOpened: { type: Boolean, required: true, default: false },
        returnUnitSize: { type: Number, default: null, required: false },

        stockMoveRequestId: { type: mongoose.Schema.Types.ObjectId, default: null, required: false },


        scanCode: { type: String, default: null },
        baseSellingPrice: { type: Number, default: null },
        stockType: { type: String, default: null },     // Return, Sale, Scrap, Damaged, Converted, Recycle
        productStatus: { type: String, },  // Transfered, Converted, Sold, Active, Locked, Damaged, Return, Scrap, Recycle
        createdVia: { type: String }, // Purchase Inward, Transit Inward, Stock Conversion, Return Inward, Return Bill, Batches and pricing, Stock Movement
        inwardId: { type: mongoose.Schema.Types.ObjectId, default: null },
        // rackId: { type: mongoose.Schema.Types.ObjectId, default: null },
        cellName: { type: String, default: null },
        blockId: { type: mongoose.Schema.Types.ObjectId, default: null },
        cellId: { type: mongoose.Schema.Types.ObjectId, default: null },
        storageBlockName: { type: String, default: null },
        // blockName: { type: String, default: null },
        stockConversionId: { type: mongoose.Schema.Types.ObjectId },
        metaData: { type: Object }, // Purchase details, Stock converstion details, Transit details, Sold details
        updatedAt: { type: Date, default: Date.now }
    }],
    baseSellingPrice: { type: Number, default: null },
    salesTaxes: [{
        taxId: { type: mongoose.Schema.Types.ObjectId },
        taxGroup: { type: String },
        taxRegistrarName: { type: String },
        taxPercentage: { type: Number, required: true }
    }],
    grossROIAmount: { type: String, default: null },
    grossROIPercentage: { type: String, default: null },
    netROIAmount: { type: String, default: null },
    netROIPercentage: { type: String, default: null },
    currentStock: {
        salesStock: { type: Number, required: true, default: 0 },
        lockedStock: { type: Number, required: true, default: 0 },
        soldStock: { type: Number, required: true, default: 0 },
        transferedStock: { type: Number, required: true, default: 0 },
        convertedStock: { type: Number, required: true, default: 0 },
        returnStock: { type: Number, required: true, default: 0 },
        recycleStock: { type: Number, required: true, default: 0 },
        scrapStock: { type: Number, required: true, default: 0 },
        damagedStock: { type: Number, required: true, default: 0 }
    },
    processedByScript: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false })

const model = mongoose.model('products', productSchema);
const modelSecondary = secondaryDB.model('products', productSchema);

/// ProductActivity
const ProductActivitySchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: [true, "productId is required"] },
    action: { type: String, required: [true, "action is required"] },
    moduleName: { type: String, required: [false, "moduleName is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false },
    comments: { type: String, required: false, default: undefined },
}, { versionKey: false });

const ProductActivity = activitiesDB.model('product_activities', ProductActivitySchema);
const ProductActivitySecondary = activitiesSecondaryDB.model('product_activities', ProductActivitySchema);

/**
 * Activity Schema for Validation
 */
const productActivityJoiSchema = Joi.object({
    productId: Joi.object().required(),
    action: Joi.string().required(),
    moduleName: Joi.string(),
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
const createActivity = async function (productActivityData) {
    if (productActivityData.what.oldValues && productActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(productActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(productActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                productActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                productActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // productActivityData.what.oldValues === null && productActivityData.what.newValues === null ? delete productActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(productActivityData, productActivityJoiSchema, { abortEarly: false }).then(async (productActivityData) => {
            await ProductActivity(productActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}


module.exports = {
    collection: model,
    activityCollection: ProductActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: ProductActivitySecondary,
    ProductActivity: ProductActivity,
    createActivity: createActivity,
    activityKey: "productId"
}