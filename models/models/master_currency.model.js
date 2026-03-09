const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Master Currencies
const masterCurrencySchema = new mongoose.Schema({
    currencyName: { type: String, required: true},
    currencyCode: { type: String, required: true},    
    currencySymbol:{ type: String, required: true},
    //countryCodeISO2: { type: String},
    //countryCodeISO3: { type: String}
}, { versionKey: false });

module.exports =  mongoose.model('master_currencies', masterCurrencySchema);
