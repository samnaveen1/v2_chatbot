const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// Module
const moduleSchema = new mongoose.Schema({
  appName: { type: String, required: true, default: null },
  appKeyName: { type: String, required: true, default: null },
  appId: { type: mongoose.Schema.Types.ObjectId, required: true },
  moduleName: { type: String, required: true },
  isReportModule: { type: Boolean, required: true },
  isApprovalModule: { type: Boolean, required: true },
  approvalActions: [{
    type: new mongoose.Schema({
      actionName: { type: String, required: true }
    }), required: false, default: null

  }],
  moduleReports: [{
    type: new mongoose.Schema({
      reportType: { type: String, required: true },
      isDirectReport: { type: Boolean, required: true },
      reportID: { type: String, required: true },
      reportName: { type: String, required: true },
      reportURL: { type: String, required: true },
      updatedAt: { type: Date, default: Date.now },
    }), required: false, default: null
  }],
  allowApproval: { type: Boolean, required: true, default: false },
  // approvalModuleName: {},
  approvalModuleId: { type: mongoose.Schema.Types.ObjectId, required: true },
  approvalRequired: {
    create: { type: Boolean, required: true, default: false },
    update: { type: Boolean, required: true, default: false },
    delete: { type: Boolean, required: true, default: false },
    restore: { type: Boolean, required: true, default: false }
  },
  approvalType: { type: String, default: "async" },
  hasLicense: { type: Boolean, default: false },
  hasLicenseLimit: { type: Boolean, default: false },
  maxLimit: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });

/// Module Activity
const moduleActivitySchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, required: [true, "moduleId is required"] },
  action: { type: String, required: [true, "action is required"] },
  who: { type: Object, required: [true, "who is required"] },
  what: { type: Object, required: [true, "what is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = mongoose.model('module_activities', moduleActivitySchema);

/**
 * Activity Schema for Validation
 */
const moduleActivityJoiSchema = Joi.object({
  moduleId: Joi.object().required(),
  action: Joi.string().required(),
  who: Joi.object().required(),
  what: Joi.object().required(),
  mode: Joi.string().required(),
  when: Joi.date(),
  isRestored: Joi.bool()
});

/// create activity
const createActivity = async function (moduleActivityData) {
  if (moduleActivityData.what.oldValues && moduleActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(moduleActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(moduleActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
        if (result) {
            moduleActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
            moduleActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

            // moduleActivityData.what.oldValues === null && moduleActivityData.what.newValues === null ? delete moduleActivityData.what : null
        }
    })
  }
  return new Promise(function (resolve, reject) {
    Joi.validate(moduleActivityData, moduleActivityJoiSchema, { abortEarly: false }).then(async (moduleActivityData) => {
      await modelActivity(moduleActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
    }).catch((error) => { reject(error); });
  });
};


module.exports = {
  Module: mongoose.model('modules', moduleSchema),
  ModuleActivity: activitiesDB.model('module_activities', moduleActivitySchema),
  readOnlyModule: secondaryDB.model('modules', moduleSchema),
  readOnlyModuleActivity: activitiesSecondaryDB.model('module_activities', moduleActivitySchema),
  activityCollection: modelActivity,
  createActivity: createActivity,
};