const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const modelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "name is required"] 
    },   
    subject: {
        type: String,
        required: [true, "subject is required"] 
    },
    message: {
        type: String,
        required: [true, "messageTemplate is required"] 
    },
    type: {
        type: String,
        required: [true, "name is required"] 
    },
    status: {type: Boolean, default: true },   
    createdAt: {  type: Date,  default: Date.now },
    updatedAt: {  type: Date,  default: Date.now },
    isDeleted: { type: Boolean }

}, { versionKey: false});

const model = mongoose.model('templates', modelSchema);
const modelSecondary = secondaryDB.model('templates', modelSchema);

///  activities
const modelActivitySchema = new mongoose.Schema({
    templateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: [true, "templateId is required"] 
    },
    action: { 
        type: String, 
        required: [true, "action is required"] 
    },
    what: { 
        type: Object, 
        required: [true, "what is required"] 
    },
    who: { 
        type: Object, 
        required: [true, "who is required"] 
    },
    mode: { 
        type: String, 
        required: [true, "mode is required"] 
    },
    when: { 
        type: Date, 
        default: Date.now, 
        required: [true, "when is required"] 
    },
    comments: { 
        type: String, 
        required:false, 
        default: undefined 
    },
    approvalType: { 
        type: String, 
        required: false, 
        default: null 
    },
    approvalStatus: { 
        type: String, 
        required: false, 
        default: "auto approved" 
    }, 
    isRestored: { 
        type: Boolean, 
        required: false 
    }
  }, { versionKey: false });
  
const modelActivity = activitiesDB.model('template_activities', modelActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('template_activities', modelActivitySchema);


module.exports = { 
    collection: model, 
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
};

  
  


