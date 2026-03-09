
const mongoose = require('mongoose');
const Joi = require('joi');

const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const zeroSellingSchema = new mongoose.Schema({

    
    productId: { type: mongoose.Schema.Types.ObjectId, required: true },
    storeName: { type: String, default: null },
    batchNumber: { type: String, default: null },
    salesStock: { type: Number, required: true, default: 0 },
    baseSellingPrice: { type: Number, default: null },


   
    newProductEntries: [{

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
    
    createdAt: { type: Date, default: Date.now },
    
}, { versionKey: false })

const model = mongoose.model('zero_selling_logs', zeroSellingSchema);
const modelSecondary = secondaryDB.model('zero_selling_logs', zeroSellingSchema);



module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
    activityKey: "productId"
}