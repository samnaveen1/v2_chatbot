const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const companyProfileSchema = new mongoose.Schema({
  companyName: { type: String, required: true},
  companyType: { type: String, default: null},
  companyLogo: { type: String, default: null},
  companyLargeLogo: { type: String, default: null},
  timezone: { type: Object, default: null},
  timeFormat: {type: String, default: null},
  dateFormat: {type: String, default: null},
  workingDays: [{ type: Object}],
  financialYear:{type: Object, default: null},
  taxRegistrations:[{type: Object}],
  registeredAddress:{type: Object, default: null},
  email: { type: String, default: null},
  phone1: { type: String, default: null},
  phone2: { type: String, default: null},
  website: { type: String, default: null},
  mapLocation: { type: Object, default: null },
  primaryContactName: { type: String, required: true},
  primaryContactEmail: { type: String, required: true},
  primaryContactMobile: { type: String, required: true},
  discountPriority: { type: String, default: null},
  status: { type: Boolean, default: true} 
}, {versionKey: false});

const CompanyProfile = mongoose.model('company_profiles', companyProfileSchema);
const readOnlyCompanyProfile = secondaryDB.model('company_profiles', companyProfileSchema);


module.exports = {
  collection: CompanyProfile,
  readOnlycollection: readOnlyCompanyProfile,
};
