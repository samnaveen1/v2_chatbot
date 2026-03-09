const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const userSessionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    app_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId },
    warehouse_id: { type: mongoose.Schema.Types.ObjectId },
    session_starts_at: { type: Date },
    session_device_type: { type: String, required: true },
    frontend_build_type: { type: String, required: true },
    session_device_ip: { type: String, required: true },
    session_device_mac: { type: String },
    web_browser: { type: String },
    session_ends_at: { type: Date }
}, { versionKey: false })


const model = activitiesDB.model('user_session_activities', userSessionSchema);
const modelSecondary = activitiesSecondaryDB.model('user_session_activities', userSessionSchema);


module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
}