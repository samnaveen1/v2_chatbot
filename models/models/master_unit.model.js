const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Master Units
const masterUnitSchema = new mongoose.Schema({
  name: { type: String },  
  otherNames: { type: Array },
  symbol: {type: String},
  baseUnit: {type:String},
  vector:{type:Boolean},
  units:[{   
    name: {type:String},
    plural: {type: String},
    symbol: {type: String},
    otherSymbols:{type:Array},
    type: {type: String},
    systems: {type: Array},
    tags: {type:Array},
    notes: {type: String},
    category: {type: String},
    isBaseUnit: {type: Boolean, default:false},
    multiplier: {type: Number}
   }]
}, {versionKey: false});

module.exports =  mongoose.model('master_units', masterUnitSchema);
