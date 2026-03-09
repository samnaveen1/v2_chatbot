const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const taxSchema = new mongoose.Schema({
    taxId: { type: mongoose.Schema.Types.ObjectId },
    taxRegistrarName: { type: String },
    taxPercentage: { type: Number },
    taxGroup: { type: String }
}, { _id: false });

const salesTaxSchema = new mongoose.Schema({
    intraStateTaxes: { type: [taxSchema], default: [] },
    interStateTaxes: { type: [taxSchema], default: [] },
    interNationalTaxes: { type: [taxSchema], default: [] }
}, { _id: false });

const unitSchema = new mongoose.Schema({
    unitId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
    unitName: { type: String },
    unitSymbol: { type: String },
    unitSize: { type: Number }
}, { _id: false });

const returnProductSchema = new mongoose.Schema({
    returnBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
    returnBillNumber: { type: String, default: null },
    isPackOpened: { type: Boolean, required: true, default: false },
    returnUnitSize: { type: Number, default: null },
    scanCode: { type: String, default: null },
    baseSellingPrice: { type: Number, default: null },
    createdVia: { type: String }
}, { _id: false });

const snapshotProductSchema = new mongoose.Schema({
    productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    basePurchasePrice: { type: Number, default: null },
    purchaseTaxes: { type: [taxSchema], default: [] },
    baseSellingPrice: { type: Number, default: null },
    salesTaxes: { type: salesTaxSchema, default: null },
    unit: { type: unitSchema, required: true },
    unitMaximumRetailPrice: { type: Number, required: true },
    isExpirable: { type: Boolean, required: true, default: false },
    packedDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },
    batchNumber: { type: String, default: null },
    bundleGiftItem: { type: String, default: null },
    isVariableSize: { type: Boolean, default: false },
    returnProducts: { type: [returnProductSchema], default: [] },
    salesStock: { type: Number, required: true },
    lockedStock: { type: Number, required: true },
    soldStock: { type: Number, required: true },
    transferedStock: { type: Number, required: true },
    convertedStock: { type: Number, required: true },
    returnStock: { type: Number, required: true },
    recycleStock: { type: Number, required: true },
    scrapStock: { type: Number, required: true },
    damagedStock: { type: Number, required: true }
}, { _id: false });

const stockSnapshotSchema = new mongoose.Schema({
    snapShotId: { type: mongoose.Schema.Types.ObjectId, required: true },
    snapshotTime: { type: Date, required: true, default: Date.now },
    stockHolder: {
        holderType: { type: String, required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
        warehouseId: { type: mongoose.Schema.Types.ObjectId, default: null }
    },
    snapshotProduct: { type: snapshotProductSchema }
}, { versionKey: false });

module.exports = {
    collection: mongoose.model('stock_snapshots', stockSnapshotSchema),
    readOnlyCollection: secondaryDB.model('stock_snapshots', stockSnapshotSchema),
}