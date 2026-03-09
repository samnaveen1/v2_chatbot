const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const modelSchema = new mongoose.Schema({
    smsTo: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, required: false, default: "pending" }, //pending, completed, failed
    retryCount: { type: Number, required: false, default: 0 },
    faliedReason: { type: String, required: false, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    approvalStatus: { type: String, required: false, default: "auto approved" },
}, { versionKey: false });

const model = mongoose.model('sms_queues', modelSchema);
const modelSecondary = secondaryDB.model('sms_queues', modelSchema);


module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
};