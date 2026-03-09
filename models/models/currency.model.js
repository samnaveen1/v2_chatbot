const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Currency
const currencySchema = new mongoose.Schema({
    currencyName: { type: String, required: true },
    currencyCode: { type: String, required: true },    
    currencySymbol: {type: String, required: true },
    conversionRate: {type: Number, default:null },
    isBaseCurrency: {type: Boolean, required:true },   
    rateUpdatedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now, required: [true, "lastUpdatedTime is required"] },
    status: { type: Boolean, required:true }
  }, { versionKey: false });

const model=mongoose.model('currencies', currencySchema);
const readOnlyModel=secondaryDB.model('currencies', currencySchema);


const currencyActivitySchema = new mongoose.Schema({
    currencyId: { type: mongoose.Schema.Types.ObjectId, required: [true, "currencyId is required"] },
    action: { type: String, required: [true, "action is required"] },
    who: { type: Object, required: [true, "who is required"] },
    what: { type: Object, required: [true, "what is required"] }, 
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    isRestored: { type:Boolean, required:false }  
  }, { versionKey: false});

const activityModel=activitiesDB.model('currency_activities', currencyActivitySchema);
const readOnlyActivityModel=activitiesSecondaryDB.model('currency_activities', currencyActivitySchema);

  
module.exports = {
  collection: model, 
  activityCollection: activityModel,
  readOnlyCollection: readOnlyModel, 
  readOnlyActivityCollection: readOnlyActivityModel
};