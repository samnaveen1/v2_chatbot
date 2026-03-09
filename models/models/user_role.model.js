const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// User Role
const userRoleSchema = new mongoose.Schema({
    roleName: { type: String, required: true },
    // allowedAppIds: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    allowedAppKeyNames: [{ type: String, required: true }],
    permissions: [
        {
            moduleId: { type: mongoose.Schema.Types.ObjectId, required: true },
            moduleName: { type: String, required: true, default: null },
            appName: { type: String, required: false, default: null },
            isCrud: { type: Boolean, required: false, default: false },   // We will check this at first in the module level if "TRUE" then it checks in the page level.
            isApproval: { type: Boolean, required: false, default: false },
            isReport: { type: Boolean, required: false, default: false },
            view: { type: Boolean, required: false, default: false },
            create: { type: Boolean, required: false, default: false },
            edit: { type: Boolean, required: false, default: false },
            delete: { type: Boolean, required: false, default: false },
            restore: { type: Boolean, required: false, default: false },
            approvalButtons: [{
                approvalActionId: { type: mongoose.Schema.Types.ObjectId, required: true },
                name: { type: String, required: true },
                status: { type: Boolean, required: true }
            }],
            reportType: { type: String, default: null },
            reportId: { type: String, required: false, default: null },
        }
    ],
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    status: { type: Boolean, required: true },
    isDeleted: { type: Boolean, default: false }
}, { versionKey: false });

const model = mongoose.model('user_roles', userRoleSchema);
const modelSecondary = secondaryDB.model('user_roles', userRoleSchema);

/// User Role Activity
const userRoleActivitySchema = new mongoose.Schema({
    userRoleId: { type: mongoose.Schema.Types.ObjectId, required: [true, "unitId is required"] },
    action: { type: String, required: [true, "action is required"] },
    who: { type: Object, required: [true, "who is required"] },
    what: { type: Object, required: [true, "what is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    comments: { type: String, required: false, default: undefined },
    reason: { type: String, required: false, default: undefined },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('user_role_activities', userRoleActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('user_role_activities', userRoleActivitySchema);

const userRoleActivityJoiSchema = Joi.object({
    userRoleId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    comments: Joi.string(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (userRoleActivityData) {
    if (userRoleActivityData.what.oldValues && userRoleActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(userRoleActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(userRoleActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                userRoleActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                userRoleActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // userRoleActivityData.what.oldValues === null && userRoleActivityData.what.newValues === null ? delete userRoleActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(userRoleActivityData, userRoleActivityJoiSchema, { abortEarly: false }).then(async (userRoleActivityData) => {
            await modelActivity(userRoleActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
    activityKey: "userRoleId",
};
// module.exports = {
//     UserRole: mongoose.model('user_roles', userRoleSchema),
//     UserRoleActivity: mongoose.model('user_role_activities', userRoleActivitySchema)
// };