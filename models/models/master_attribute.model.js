const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Master attributes
const masterAttributeSchema = new mongoose.Schema({
    attributeCategory: { type: String, required: true },
    attributes:{
        attributeName: { type: String, required: true },
        attributeType: { type: String, required: true },  
    }
}, {versionKey: false});
  
module.exports =  mongoose.model('master_attributes', masterAttributeSchema);