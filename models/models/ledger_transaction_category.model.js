const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const ledgerTransactionCategorySchema = new mongoose.Schema({
    categoryType: { type: String, default: null },
    categoryGroup: { type: String, default: null },
    categoryName: { type: String, default: null }
}, { versionKey: false });

const model = mongoose.model('ledger_transaction_categories', ledgerTransactionCategorySchema);
const readOnlyModel = secondaryDB.model('ledger_transaction_categories', ledgerTransactionCategorySchema);


/// ledger transaction categories Activity
const collectionActivitySchema = new mongoose.Schema({
    ledgerTransactionCategoryId: { type: mongoose.Schema.Types.ObjectId, required: [true, "ledgerTransactionCategoryId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    comments: { type: String, required: false, default: undefined },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('ledger_transaction_category_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('ledger_transaction_category_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const ledgerTransacionActivityJoiSchema = Joi.object({
    ledgerTransactionCategoryId: Joi.object().required(),
    action: Joi.string().required(),
    comments: Joi.string(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (ledgerTrasactionCategoriesActivityData) {
    if (ledgerTrasactionCategoriesActivityData.what.oldValues && ledgerTrasactionCategoriesActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(ledgerTrasactionCategoriesActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(ledgerTrasactionCategoriesActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                ledgerTrasactionCategoriesActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                ledgerTrasactionCategoriesActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // ledgerTrasactionCategoriesActivityData.what.oldValues === null && ledgerTrasactionCategoriesActivityData.what.newValues === null ? delete ledgerTrasactionCategoriesActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(ledgerTrasactionCategoriesActivityData, ledgerTransacionActivityJoiSchema, { abortEarly: false }).then(async (ledgerTrasactionCategoriesActivityData) => {
            await modelActivity(ledgerTrasactionCategoriesActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
}