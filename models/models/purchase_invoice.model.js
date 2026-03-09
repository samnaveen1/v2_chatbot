const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const purchaseInvoiceSchema = new mongoose.Schema({
    piNumber: { type: String, default: null },
    piDate: { type: Date, default: null },
    vendorId: { type: mongoose.Schema.Types.ObjectId },
    piAmount: { type: Number, default: null },
    // piAttachments: { type: Array, default: null },
    piAttachments: [{
        fileName: { type: String, required: false, default: null },
        displayName: { type: String, required: false, default: null },
    }],
    discountAmount: { type: Number, default: null },
    tcsAmount: { type: Number, default: null },
    freightCharge: { type: Number, default: null },
    deliveryStatus: { type: String, required: true },
    reviewStatus: { type: String, default: null },
    reviewedBy: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
    reviewComments: { type: String, default: null },
    paymentStatus: { type: String, default: null },
    paymentComments: { type: String, default: null }
}, { versionKey: false });

const model = mongoose.model('purchase_invoices', purchaseInvoiceSchema);
const modelSecondary = secondaryDB.model('purchase_invoices', purchaseInvoiceSchema);

/// Purchase invoice Activity
const collectionActivitySchema = new mongoose.Schema({
    purchaseInvoiceId: { type: mongoose.Schema.Types.ObjectId, required: [true, "purchaseInvoiceId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('purchase_invoice_activities', collectionActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('purchase_invoice_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const purchaseInvoiceActivityJoiSchema = Joi.object({
    purchaseInvoiceId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (purchaseInvoiceActivityData) {
    if (purchaseInvoiceActivityData.what.oldValues && purchaseInvoiceActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(purchaseInvoiceActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(purchaseInvoiceActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                purchaseInvoiceActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                purchaseInvoiceActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // purchaseInvoiceActivityData.what.oldValues === null && purchaseInvoiceActivityData.what.newValues === null ? delete purchaseInvoiceActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(purchaseInvoiceActivityData, purchaseInvoiceActivityJoiSchema, { abortEarly: false }).then(async (purchaseInvoiceActivityData) => {
            await modelActivity(purchaseInvoiceActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
}

module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: modelSecondary,
    readOnlyActivityCollection: modelActivitySecondary,
    createActivity: createActivity,
}