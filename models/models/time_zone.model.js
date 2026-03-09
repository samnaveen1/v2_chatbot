const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const timeZoneSchema = new mongoose.Schema({
    displayName: { type: String,  required: true },
    tzName: { type: String,  required: true },
    utcOffset: {type: String,  required: true }     
}, {versionKey: false});

module.exports = mongoose.model('time_zones', timeZoneSchema);

