const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const ledgerTransactionsSchema = new mongoose.Schema({
    ledgerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    ledgerType: { type: String, required: true }, // Cash, Bank
    ledgerFor: { type: String, required: true },// Store, businessUnit

    storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, default: null },
    posSubledgerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    upiSubledgerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    posDeviceId: { type: String, required: false, default: null },
    upiId: { type: String, required: false, default: null },
    isSettled: { type: Boolean, default: true },
    unSettledAmount: { type: Number, required: false, default: 0 },

    customerId: { type: mongoose.Schema.Types.ObjectId, default: null },
    transactionDate: { type: Date, required: true },
    transactionNumber: { type: String },
    isTransferTransaction: { type: Boolean, required: false, default: false },
    isSettlementTransaction: { type: Boolean, required: false, default: false },
    transferFromLedgerTransactionId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transferFromPosDeviceId: { type: String, required: false, default: null },
    transferFromPosSubledgerId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transferFromLedgerId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transferToLedgerId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transferFromBusinessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transferToBusinessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false },
    transferFromBusinessUnitName: { type: String, required: false },
    transferToBusinessUnitName: { type: String, required: false },
    transactionCategory: { type: String, required: true }, /// billPayment, customerReturn, changeDue
    transactionType: { type: String, required: true }, /// Credit, Debit, Transfer
    paymentSubType: { type: String, required: false }, /// NEFT, Cheque/DD, RTGS, PhonePe, Gpay, Paytm
    transactionMode: { type: String, required: true }, ///Cash, UPI, Card, Bank Transfer, Credit Note, Customer wallet, Loyalty point
    transactionReference: { type: String },
    transactionAmount: { type: Number, required: true },
    bankTransactionCharges: { type: Number, default: 0 },
    intentedDifferedAmount: { type: Number, default: 0 },
    transactionPayments: [{
        type: new mongoose.Schema({
            paymentFor: { type: String, required: true }, /// SalesBill, SalesInvoice, CreditNote, ReturnBill, CustomerOutStanding, PuchaseInvoice
            saleBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
            vendorPaymentId: { type: mongoose.Schema.Types.ObjectId, default: null },
            retrunBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
            creditNoteId: { type: mongoose.Schema.Types.ObjectId, default: null },
            paidAmount: { type: Number, required: true },  /// total paid amount
            transactionPaymentMetaData: { type: Object, default: null }  /// previous payments.
            /*
            {
                isOutstandingPayment: boolean
                saleBillId: ObjectId
                billNo: string,
                billDate: datetime
                dueDate: datetime
                billAmount: number // total bill amount
                paidAmount: number  // previously paid amount
                pendingBalance: number // billamount-paidamount
                amountAllocated: number // paidAmount
                billType: string // billtype
            }
            */
        }), required: false, default: null
    }],
    transactionPayee: { type: String, required: true }, /// Name of the payee(ex. If customer pay's then customer name comes here)
    transactionNotes: { type: String, required: false },
    acceptOrRejectNotes: { type: String, required: false },
    acceptOrRejectReason: {
        reasonId: { type: mongoose.Schema.Types.ObjectId },
        reasonName: { type: String, required: false }
    },
    isTransactionAccepted: { type: Boolean, default: true },
    transactionAcceptStatus: { type: String, default: null }, /// accept, correctAndAccept, reject
    isEditable: { type: Boolean, default: false },

    transactionMetaData: { type: Object, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true }
    },
    storeFlag: { type: Boolean, default: false },
    adminFlag: { type: Boolean, default: false },
    storeFlagEnabledBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false },
        updatedAt: { type: Date, required: false }
    },
    adminFlagEnabledBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false },
        updatedAt: { type: Date, required: false }
    },
}, { versionKey: false });


const model = mongoose.model('ledger_transactions', ledgerTransactionsSchema);
const readOnlyModel = secondaryDB.model('ledger_transactions', ledgerTransactionsSchema);

/// Ledger transaction Activity
const collectionActivitySchema = new mongoose.Schema({
    ledgerTransactionId: { type: mongoose.Schema.Types.ObjectId, required: [true, "ledgerTransactionId is required"] },
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

const modelActivity = activitiesDB.model('ledger_transaction_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('ledger_transaction_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const ledgerTransactionActivityJoiSchema = Joi.object({
    ledgerTransactionId: Joi.object().required(),
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
const createActivity = async function (ledgerTransactionActivityData) {
    if (ledgerTransactionActivityData.what.oldValues && ledgerTransactionActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(ledgerTransactionActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(ledgerTransactionActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                ledgerTransactionActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                ledgerTransactionActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // ledgerTransactionActivityData.what.oldValues === null && ledgerTransactionActivityData.what.newValues === null ? delete ledgerTransactionActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(ledgerTransactionActivityData, ledgerTransactionActivityJoiSchema, { abortEarly: false }).then(async (ledgerTransactionActivityData) => {
            await modelActivity(ledgerTransactionActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};


module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    activityKey: "ledgerTransactionId",
}