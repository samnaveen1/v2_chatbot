const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const storageBlockSchema = new mongoose.Schema({
    storageHolder: {
        branchType: { type: String, required: true },
        storeId: { type: mongoose.Schema.Types.ObjectId },
        storeName: { type: String },
        warehouseId: { type: mongoose.Schema.Types.ObjectId },
        warehouseName: { type: String },
    },
    blockName: { type: String, required: true },
    floors: [{
        floorName: { type: String, required: true },
        section: [{
            sectionName: { type: String, required: true },
            rack: [{
                rackName: { type: String, required: true },
                cell: [{
                    cellName: { type: String, required: true },
                    cellCapacity: {
                        capacityInKG: { type: Number, required: true },
                        height: { type: Number, required: true },
                        length: { type: Number, required: true },
                        width: { type: Number, required: true },
                        dimentionUnit: { type: String, required: true }
                    }
                }]
            }]
        }]
    }],
    blockStatus: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    isDeleted: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date }
}, { versionKey: false });

const model = mongoose.model('storage_blocks', storageBlockSchema);
const modelSecondary = secondaryDB.model('storage_blocks', storageBlockSchema);


module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
}