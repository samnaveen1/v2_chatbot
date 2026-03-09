const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const approvalSchema = new mongoose.Schema({
    appName: { type: String, required:false, default:null },
    moduleName: { type: String,  required: [true, "moduleName is required"]  },
    collectionName: { type: String,  required: [true, "collectionName is required"]  },
    collectionId: { type: mongoose.Schema.Types.ObjectId }, //  required: true
    activityId: { type: mongoose.Schema.Types.ObjectId },  //  required: true
    type: { type: String,  default:null  },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    requestType: { type: String,  required: [true, "requestType is required"]  },
    sectionNameKey: { type: String,  default:null  },
    approvalType: { type: String,  required: [true, "approvalType is required"]  },
    approvalTitle: { type: String,  required: false, default: null },  
    who: {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      name:  { type: String },
      phone: { type: String }    
    },
    createdAt:  { type: Date, default: Date.now, required: false },
    updatedAt:  { type: Date, default: Date.now, required: false },
    approver: {
      type: new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId },
        name:  { type: String },
      }),
      required: false
    }, 
    expiredAt: { type: Date, required: false },    
    // requestNotifiedAt:  { type: Date, default: null },
    // requesterPhone: { type: String, required: false, default: null  },   
    // approver: { 
    //   userId: { type: mongoose.Schema.Types.ObjectId },
    //   name: { type: String }
    // },
    approverReason: { type: String, required: false, default: null },   
    approverComment: { type: String, required: false, default: null },   
    responseNotifiedAt:  { type: Date, default: null },
    approvalStatus: { type: String, required: true, default: "approved" },
  }, {versionKey: false});

  const Approval=mongoose.model('approvals', approvalSchema);
  const readOnlyApproval=secondaryDB.model('approvals', approvalSchema);

  module.exports = Approval;

  