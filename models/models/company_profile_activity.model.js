const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Company Profile Activity
const CompanyProfileActivitySchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, required: [true, "companyId is required"]  },
    action: { type: String, required: [true, "action is required"] },
    who: { type: Object, required: [true, "who is required"] },
    what: { type: Object, required: [true, "what is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    isRestored: {type:Boolean, required:false }  
}, { versionKey: false});
  
const CompanyProfileActivity=activitiesDB.model('company_profile_activities', CompanyProfileActivitySchema);
const readOnlyCompanyProfileActivity=activitiesSecondaryDB.model('company_profile_activities', CompanyProfileActivitySchema);

module.exports = {
    collection: CompanyProfileActivity,
    readOnlyCollection: readOnlyCompanyProfileActivity,
};
  