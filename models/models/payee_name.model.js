const Joi = require('joi');
const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Reasons
const commonReasonSchema = new mongoose.Schema({
    payeeName: { type: String },
    // moduleName: { type: String },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String }
    },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }
}, { versionKey: false });

const model = mongoose.model('payee_names', commonReasonSchema);
const modelSecondary = secondaryDB.model('payee_names', commonReasonSchema);
module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
}