const Joi = require('joi');
const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Reasons
const commonReasonSchema = new mongoose.Schema({
    reasonsName: { type: String },
    moduleName: { type: String },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String }
    },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    status: { type: Boolean, default: true, required: false },
    approvalStatus: { type: String, required: false, default: "auto approved" },
}, { versionKey: false });

const model = mongoose.model('common_reasons', commonReasonSchema);
const readOnlyModel = secondaryDB.model('common_reasons', commonReasonSchema);

module.exports = {
    collection: model,
    readOnlyCollection: readOnlyModel,
}