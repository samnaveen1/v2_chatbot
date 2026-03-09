const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Reasons
const productNameSchema = new mongoose.Schema({
    productName: { type: String }
}, { versionKey: false });

const model = mongoose.model('productName', productNameSchema);
const modelSecondary = secondaryDB.model('productName', productNameSchema);

module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
}