const mongoose = require('mongoose');
const stockSchema =  new mongoose.Schema({  
    productId: { type: mongoose.Schema.Types.ObjectId, default: null },
    storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, default: null },
    isExpirable: { type: Boolean, required: true, default: false },
    packedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: false, default: null },
    isPurchaseOnly: { type: Boolean, required: false, default: false },
    isVariableSize: { type: Boolean, required: true, default: false },
    bundleGiftItem: { type: String, default: null },
    masterProductId: { type: mongoose.Schema.Types.ObjectId, required: true },
    inventoryType: { type: String },
    batchNumber: { type: String, required: true },

    saleBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
    saleBillNumber: { type: String, default: null },
    invoiceNumber: { type: String, default: null },
    sellingPrice: { type: Number, required: false },
    soldByScancodeMatched: { type: Boolean, required: false, default: null },
    taxes: {
        type: [
            {
                taxId: { type: mongoose.Schema.Types.ObjectId, required: false },
                taxRegistrarName: { type: String, required: false },
                taxName: { type: String, required: false },
                taxGroup: { type: String, required: false },
                taxPercentage: { type: Number, required: false }
            }
        ],
        default: [],
        required: false
    }, 
    returnBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
    returnBillNumber: { type: String, default: null },
    isPackOpened: { type: Boolean, required: true, default: false },
    returnUnitSize: { type: Number, default: null, required: false },
    stockMoveRequestId: { type: mongoose.Schema.Types.ObjectId, default: null, required: false },
    scanCode: { type: String, default: null },
    baseSellingPrice: { type: Number, default: null },
    stockType: { 
        type: String, 
        enum: ['Return', 'Sale', 'Scrap', 'Damaged', 'Converted', 'Recycle', 'Sold'], 
        default: 'Sale' 
    },
    productStatus: { 
        type: String, 
        enum: ['Transfered', 'Converted', 'Sold', 'Active', 'Locked', 'Damaged', 'Return', 'Scrap', 'Recycle'], 
        default: 'Active' 
    },
    createdVia: { 
        type: String, 
        required: false,
        default: null 
    },
    inwardId: { type: mongoose.Schema.Types.ObjectId, default: null },
    rackId: { type: mongoose.Schema.Types.ObjectId, default: null },
    blockId: { type: mongoose.Schema.Types.ObjectId, default: null },
    blockName: { type: String, default: null },
    stockConversionId: { type: mongoose.Schema.Types.ObjectId },
    metaData: {
        type: Map,
        of: String,
        default: {}
    }    
},{ timestamps: true, versionKey: false });

module.exports = {
    collection: mongoose.model('sold_product_stocks', stockSchema),
}
