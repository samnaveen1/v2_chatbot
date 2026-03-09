const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const modelSchema = new mongoose.Schema({
    from: { type: String },
    to: { type: String, required: true },
    cc: { type: String },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    attachements: { type: Array, default: null },
    status: { type: String, required: false, default: "pending" },
    createdAt: { type: Date, default: Date.now },
    approvalStatus: { type: String, required: false, default: "auto approved" },
}, { versionKey: false });

const model = mongoose.model('email_queues', modelSchema);
const readOnlyModel = secondaryDB.model('email_queues', modelSchema);


module.exports = {
    collection: model,
    readOnlycollection: readOnlyModel,
};