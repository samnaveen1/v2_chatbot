const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// attribute schema
const attributeSchema = new mongoose.Schema({
  attributeCategory: { type: String, required: true },
  attributes:{
      attributeName: { type: String, required: true },
      attributeType: { type: String, required: true },  
  },
  status: { type: Boolean, required:true, default:true }  
}, {versionKey: false});

/// attribute activities schema
const attributeActivitySchema = new mongoose.Schema({
  attributeId: { type: mongoose.Schema.Types.ObjectId, required: [true, "attributeId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] }, 
  what: { type: Object, required: [true, "what is required"] }, 
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type:Boolean, required:false }  
}, {versionKey: false});

const attribute= mongoose.model('attributes', attributeSchema);
const attributeActivity= activitiesDB.model('attribute_activities', attributeActivitySchema);
const readOnlyAttribute= secondaryDB.model('attributes', attributeSchema);
const readOnlyAttributeActivity= activitiesSecondaryDB.model('attribute_activities', attributeActivitySchema);

module.exports = {
  Attribute : attribute, 
  AttributeActivity : attributeActivity ,
  readOnlyAttribute : readOnlyAttribute, 
  readOnlyAttributeActivity : readOnlyAttributeActivity 
};
