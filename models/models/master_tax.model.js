const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Master Taxes
const masterTaxesSchema = new mongoose.Schema({
    taxRegistrarName: { type: String, required: [true, "Tax registrar name is required"] },
    country: { type: String, required: [true, "country name is required"] },
    taxes:[
        {
            _id: { type: mongoose.Schema.Types.ObjectId, required: [true, "taxId is required"] },
            taxGroup: { type: String, required: [true, "Tax group is required"]},
            taxPercentage: { type: Number, required: [true, "Tax percentage is required"] },
            taxCategory: { type: String, required: [true, "Tax category is required"] },
        }
    ]
}, {versionKey: false});

module.exports =  mongoose.model('master_taxes', masterTaxesSchema);
