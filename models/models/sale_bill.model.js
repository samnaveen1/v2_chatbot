const mongoose = require('mongoose');
const Joi = require('joi');

const MongoHookDataFunctions = require('./functions/hook.functions');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;


const billSchemaFields = {
    offlineId: { type: String, required: false },
    offlineBillNumber: { type: String, default: null, required: false },
    storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    storeName: { type: String, default: null, required: false }, //For grafana use
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    businessUnitName: { type: String, required: false, default: null },
    businessUnitAddress: {
        type: new mongoose.Schema({
            attention: { type: String },
            addressLine1: { type: String, required: false },
            addressLine2: { type: String },
            city: {
                cityId: { type: mongoose.Schema.Types.ObjectId },
                name: { type: String }
            },
            state: {
                stateId: { type: mongoose.Schema.Types.ObjectId },
                name: { type: String },
                stateCode: { type: String }
            },
            pinCode: { type: String },
            country: {
                countryId: { type: mongoose.Schema.Types.ObjectId },
                name: { type: String },
                countryCode: { type: String }
            }
        }), required: false, default: null
    },
    businessUnitGSTNumber: { type: String, default: null },
    businessUnitCinNumber: { type: String, default: null },
    businessUnitPanNumber: { type: String, default: null },
    businessUnitMobile: { type: String, default: null },
    businessUnitEmail: { type: String, default: null },
    businessUnitGpayUPI_Id: { type: String, default: null },
    businessUnitGpayUPI_No: { type: String, default: null },
    UPIQR: { type: String, default: null },
    eInvoiceQR: { type: String, default: null },
    businessUnitBankDetails: {
        accountName: { type: String, required: false, default: null },
        accountNumber: { type: String, required: false, default: null },
        bankName: { type: String, required: false, default: null },
        branchName: { type: String, required: false, default: null },
        bankIFSC: { type: String, required: false, default: null },
    },
    oldSaleBillNumber: { type: String, default: null },
    saleBillNumber: { type: String, default: null },
    saleBillType: { type: String, required: false }, //SalesBill, SalesInvoice, POD
    invoiceNumber: { type: String },
    invoiceDraftNumber: { type: String },
    podBillNumber: { type: String, default: null },
    billedAt: { type: Date, required: false },
    saleBillDate: { type: Date, required: false },
    fromSalesOrderId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    fromProformaInvoiceId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    fromEstimateId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    poNumber: { type: String, required: false },
    poDate: { type: Date, required: false },
    saleIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false }
    },
    currentCustomerName: { type: String, required: false, default: null }, //For grafana use
    currentCustomerMobile: { type: String, required: false, default: null }, //For grafana use
    currentCustomerType: { type: String, required: false, default: null }, //For grafana use
    customer: {
        type: {
            customerId: { type: mongoose.Schema.Types.ObjectId, required: false },
            customerOfflineId: { type: String, default: null, required: false },
            customerType: { type: String, required: false },
            displayName: { type: String, required: false },
            customerName: { type: String, required: false },
            phoneNumber: { type: String, required: false },
            emailAddress: { type: String },
            billingAddress: {
                type: new mongoose.Schema({
                    attention: { type: String },
                    addressLine1: { type: String, required: false },
                    addressLine2: { type: String },
                    city: {
                        cityId: { type: mongoose.Schema.Types.ObjectId },
                        name: { type: String }
                    },
                    state: {
                        stateId: { type: mongoose.Schema.Types.ObjectId },
                        name: { type: String },
                        stateCode: { type: String }
                    },
                    pinCode: { type: String },
                    country: {
                        countryId: { type: mongoose.Schema.Types.ObjectId },
                        name: { type: String },
                        countryCode: { type: String }
                    }
                }), required: false, default: null
            },
            deliveryAddress: {
                type: new mongoose.Schema({
                    attention: { type: String },
                    addressLine1: { type: String, required: false },
                    addressLine2: { type: String },
                    city: {
                        cityId: { type: mongoose.Schema.Types.ObjectId },
                        name: { type: String }
                    },
                    state: {
                        stateId: { type: mongoose.Schema.Types.ObjectId },
                        name: { type: String },
                        stateCode: { type: String }
                    },
                    pinCode: { type: String },
                    country: {
                        countryId: { type: mongoose.Schema.Types.ObjectId },
                        name: { type: String },
                        countryCode: { type: String }
                    },
                    mapLocation: {
                        latitude: { type: Number, required: false },
                        longitude: { type: Number, required: false }
                    }
                }), required: false, default: null
            },
            GSTIN: { type: String }
        },
        default: null,
    },
    deliveryType: { type: String, required: false }, // CustomerDelivery, TakeHome, POD
    deliveryChallanNumber: { type: String, required: false, default: null },
    billProducts: [
        {
            productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
            masterProductId: { type: mongoose.Schema.Types.ObjectId, required: false },
            productCategoryName: { type: String, default: null }, //For grafana use
            parentCategoryName: { type: String, default: null }, //For grafana use
            parentSubCategories: { type: String, default: null }, //For grafana use
            bundleGiftItem: { type: String, required: false },
            productCode: { type: String, required: false },
            productName: { type: String, required: false },
            displayName: { type: String },
            invoiceDisplayName: { type: String },
            productDescription: { type: String },
            HSNCode: { type: String, required: false },
            inventoryType: { type: String },
            unit: {
                unitId: { type: mongoose.Schema.Types.ObjectId, required: [false, "unitId is required"] },
                unitName: { type: String },
                unitSymbol: { type: String },
                unitSize: { type: Number }
            },
            isVariableSize: { type: Boolean, required: false, default: false },
            unitMaximumPrice: { type: Number, required: false },
            baseSellingPrice: { type: Number, required: false },
            sellingPrice: { type: Number, required: false },
            changedSellingPrice: { type: Number, required: false },
            discountAmount: { type: Number, required: false },
            sellingPriceWithDiscount: { type: Number, required: false },
            taxAmount: { type: Number, required: false },
            productQuantity: { type: Number, required: false },
            returnQuantity: { type: Number, required: false, default: 0 },
            taxes: [{
                taxId: { type: mongoose.Schema.Types.ObjectId, required: false },
                taxRegistrarName: { type: String, required: false },
                taxName: { type: String, required: false },
                taxGroup: { type: String, required: false },
                taxPercentage: { type: Number, required: false }
            }],
            salesTaxes: { type: mongoose.Schema.Types.Mixed, default: null },
            batchProducts: [
                {
                    productId: { type: mongoose.Schema.Types.ObjectId, required: false },
                    quantity: { type: Number, required: false },
                    scanCodes: [{
                        scanCode: { type: String, required: false, default: null },
                        quantity: { type: Number, required: false },
                    }],
                    batchNumber: { type: String, required: false },
                    manufacturerBatchNumber: { type: String, required: false },
                    packedDate: { type: Date, required: false },
                    expiryDate: { type: Date, required: false },
                    basePurchasePrice: { type: Number, required: false },
                    purchasePrice: { type: Number, required: false },
                    purchaseTaxes: [{
                        taxId: { type: mongoose.Schema.Types.ObjectId },
                        taxGroup: { type: String },
                        taxRegistrarName: { type: String },
                        taxPercentage: { type: Number }
                    }],
                }
            ],
            productDiscounts: [
                {
                    discountType: { type: String, required: false },  // Product based, Bill based, Manual
                    discountName: { type: String, required: false },
                    isQuantityBasedDiscount: { type: String, required: false },
                    isFlatDiscount: { type: Boolean, required: false, default: false },
                    discountValue: { type: Number, required: false },
                    discountAmount: { type: Number, required: false },
                    discountId: { type: mongoose.Schema.Types.ObjectId, required: false },
                    comboId: { type: mongoose.Schema.Types.ObjectId, required: false }, // for comboId if it was combo get product.
                    comboName: { type: String, required: false }, // for comboName if it was combo get product.
                }
            ],
            totalDiscountPrice: { type: Number }, /// (bill based + product based) * qty
            productBasedDiscount: { type: Number },
            totalTaxAmount: { type: Number, required: false },/// Total amount for tax calculation
            totalTaxPercentage: { type: Number, required: false },/// Total amount for tax calculation
            totalProductPrice: { type: Number, required: false }, ///Including discounts and tax
            stockHolder: {
                branchtype: { type: String, required: false },
                storeId: { type: mongoose.Schema.Types.ObjectId },
                storeName: { type: String },
                warehouseId: { type: mongoose.Schema.Types.ObjectId },
                warehouseName: { type: String },
                shortName: { type: String },
            },

            loyaltySetupId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },

            isGift: { type: Boolean, required: false, default: false },
            giftOfferId: { type: mongoose.Schema.Types.ObjectId, default: null, required: false },

            comboOfferId: { type: mongoose.Schema.Types.ObjectId, default: null, required: false }, // combo offer id.

            comboBaseSellingPrice: { type: Number, required: false },  // after apply combo set combo selling price.
            isCombo: { type: Boolean, required: false, default: false }, // is combo applied to this product.
            appliedCombos: [
                {
                    comboId: { type: mongoose.Schema.Types.ObjectId, default: null },
                    quantity: { type: Number, required: false },
                }
            ],
        }
    ],
    productSubTotal: { type: Number, required: false }, /// Total of all products without discount & taxes
    billDiscounts: [
        {
            discountId: { type: mongoose.Schema.Types.ObjectId, required: false },
            discountType: { type: String, required: false },
            discountName: { type: String, required: false },
            isFlatDiscount: { type: Boolean, required: false, default: false },
            isGift: { type: Boolean, required: false, default: false },
            maxGifts: { type: Number, default: null },
            minBillValue: { type: Number, required: false },
            discountValue: { type: Number, required: false },
        }
    ],
    billManualDiscount: { type: Number, required: false },/// Total amount of all discounts(includes product based & bill based discounts)
    totalDiscountAmount: { type: Number, required: false },/// Total amount of all discounts(includes product based & bill based discounts)
    totalTaxableAmount: { type: Number, required: false },/// Total amount with all discounts (productSubTotal - totalDiscountAmount)
    totalTaxAmount: { type: Number, required: false },/// Total amount for tax calculation
    billTaxSummary: [{
        taxName: { type: String, required: false },
        taxPercentage: { type: Number, required: false },
        taxAmount: { type: Number, required: false }
    }],
    totalBillAmount: { type: Number, required: false }, ///(totalTaxableAmount + totalTaxAmount)
    frightCharge: { type: Number, required: false },
    otherCharges: { type: Number, required: false },
    billRoundOff: { type: Number, required: false },/// Round off amount
    netPayableAmount: { type: Number, required: false },/// Total payable includes all taxes, discounts, frightcharges, othercharges and bill round off
    tcsAmount: { type: Number, required: false, default: null },
    totalSavedAmount: { type: Number, required: false },///

    payments: [{
        paymentType: { type: String, required: false }, /// UPI, CreditNote, BankTransfer, LoyaltyPoint, CardPayment, Cash, CustomerWallet
        upiType: { type: String, required: false, default: null },
        reference: { type: String, required: false, default: null },
        transferType: { type: String, required: false, default: null },
        cardNumber: { type: String, required: false, default: null },
        paymentAmount: { type: Number, required: false },
        totalPaidAmount: { type: Number, required: false },
        paymentNote: { type: String },
        loyaltyPointValue: { type: Number, required: false },
        paymentOption: { type: String, required: false },/// Accounts, customerWallet, creditNote, loyaltyPoint
        ledgerType: { type: String, required: false, default: null },
        ledgerTransactionId: { type: mongoose.Schema.Types.ObjectId, required: false },
        ledgerId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        posDeviceId: { type: String, required: false, default: null },
        posSubledgerId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        upiId: { type: String, required: false, default: null },
        upiSubledgerId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        creditNoteId: { type: mongoose.Schema.Types.ObjectId, required: false },
        customerWalletId: { type: mongoose.Schema.Types.ObjectId, required: false },
        loyalPointId: { type: mongoose.Schema.Types.ObjectId, required: false },
        createdAt: { type: Date, default: Date.now, required: false }
    }],
    paymentStatus: { type: String, default: "pending" }, /// pending, partial, completed
    returnBills: [
        {
            type: new mongoose.Schema({
                returnBillId: { type: mongoose.Schema.Types.ObjectId, default: null },
                returnBillValue: { type: Number, required: false, default: 0 },  /// total paid amount
                returnBillPaid: { type: Number, required: false, default: 0 },  /// total paid amount
                returnBillUnPaid: { type: Number, required: false, default: 0 },  /// total paid amount
                loyaltyReducedValue: { type: Number, required: false, default: 0 },
            }),
            required: false,
            default: null
        }
    ],

    appliedComboProducts: [
        {
            comboId: { type: mongoose.Schema.Types.ObjectId, default: null },
            masterProductId: { type: mongoose.Schema.Types.ObjectId, required: false },
            quantity: { type: Number, required: false },
        }
    ],
    appliedComboDetails: [{
        type: new mongoose.Schema({
            comboId: { type: mongoose.Schema.Types.ObjectId, default: null },
            comboName: { type: String, default: null },
            maxGetProducts: { type: Number },
            comboBuyProducts: [
                {
                    masterProductId: { type: mongoose.Schema.Types.ObjectId },
                    quantity: { type: Number }
                }
            ],
            comboGetProducts: [
                {
                    masterProductId: { type: mongoose.Schema.Types.ObjectId },
                    quantity: { type: Number }
                }
            ],
        }),
        required: false,
        default: null
    }],
    billCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String }
    },

    loyaltyCurrencyValue: { type: Number, required: false, default: null },
    walletCredit: { type: Number, required: false, default: null },
    balanceToCustomer: { type: Number, required: false, default: null },
    isCustomerBalancePaidByDirectCash: { type: Boolean, default: false },  /// without ledger record balance paid by direct cash.

    loyaltyCalculationFlag: { type: Boolean, default: false },
    tempLoyaltyPoint: { type: Number, required: false, default: null },  /// for temporary confirmation purpose calculated from client side.
    tempLoyaltyPointBalance: { type: Number, required: false, default: null },  /// for temporary confirmation purpose calculated from client side.
    calculatedLoyaltyPoint: { type: Number, required: false, default: null },
    availableFractionalExtraLoyaltyPoint: { type: Number, required: false, default: null }, /// fractional extra loyalty point required for return and reverse the loyalty

    displayedLoyaltyAmount: { type: Number, required: false, default: null },
    displayedLoyaltyPoint: { type: Number, required: false, default: null },
    displayedWalletAmount: { type: Number, required: false, default: null },
    displayedOutStandingAmount: { type: Number, required: false, default: null },

    billNotes: { type: String },
    billPaymentDueDate: { type: Date },
    creditDays: { type: Number },
    // termsConditions: {
    //     priceBasis: { type: String },
    //     taxes: { type: String },
    //     modeOfDispatch: { type: String },
    //     paymentTerms: { type: String },
    //     leadTime: { type: String }
    // },
    termsConditions: { type: mongoose.Schema.Types.Mixed, default: null },
    approvalStatus: { type: String },
    isCompletedFromOffline: { type: Boolean, required: false },
    isEditable: { type: Boolean, required: false },
    isVoid: { type: Boolean, default: false },
    voidReason: { type: String },
    voidAt: { type: Date, required: false },
    isWriteOff: { type: Boolean, default: false },
    writeOffReason: { type: String },
    writeOffReason: { type: String },
    revokeWriteOffReason: { type: String },
    writeOffAt: { type: Date, required: false },
    poNumber: { type: String },
    poDate: { type: String },
    eInvoice: {
        type: mongoose.Schema.Types.Mixed, default: null
    },
    eWayBill: {
        type: mongoose.Schema.Types.Mixed, default: null
    },
    eInvoiceStatus: { type: String, required: false, default: null }, //pending, cancelled, completed
    eWayBillStatus: { type: String, required: false, default: null }, //pending, cancelled, completed
    vehicleNumber: { type: String, required: false, default: null },
    distanceInKm: { type: String, required: false, default: null },
    isFlagged: { type: Boolean },
    userFlag: { type: Boolean, default: false },
    adminFlag: { type: Boolean, default: false },
    status: { type: String, required: false },  // draft, correctionDraft, onhold, pending, completed, saving, cancelled
    podStatus: { type: String, required: false, default: null }, //pending, converted
    podToBillAt: { type: Date },
    podBillDate: { type: Date, required: false },
    selectedNotifications: { type: mongoose.Schema.Types.Mixed, default: null },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    appName: { type: String, default: null, required: false }, // for identify from which app
    approvalStatus: { type: String, required: false, default: "auto approved" },
    creditNoteId: { type: mongoose.Schema.Types.Mixed, default: null },
    creditNoteAmount: { type: Number, required: false, default: null },
    createdAt: { type: Date, default: Date.now, required: false },
    lastProcessedAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false },
    sessionId: { type: String, default: null, required: false },
    isDaycloseCompleted: { type: Boolean, default: false },
    processStatus: {
        generateBillNumber_Completed: { type: Boolean, default: false },
        createPaymentTransaction_Completed: { type: Boolean, default: false },
        stockUpdate_Completed: { type: Boolean, default: false },
        updatePaymentTransaction_Completed: { type: Boolean, default: false },
    },
};

const billSchema = new mongoose.Schema(billSchemaFields, { versionKey: false });


billSchema.pre('save', async function (next) {
  try {
    // if (this.status !== "completed"){
    //     return next(); // Skip calculations if bill is not completed
    // }

    this.billProducts = await MongoHookDataFunctions.updateBillProductsPurchasePrice(this.billProducts);
    this.markModified('billProducts');
    next();
  } catch (err) {
    console.error("Error in pre-save hook:", err);
    next();
  }
});


billSchema.pre('findOneAndUpdate', async function (next) {
  try {
    const update = this.getUpdate();
    const billProducts = update.billProducts ?? update.$set?.billProducts;
    
    // const status = update.status ?? update.$set?.status;
    // if (status !== "completed"){
    //     return next(); // Skip calculations if bill is not completed
    // }
    

    if (billProducts) {
      const modified = await MongoHookDataFunctions.updateBillProductsPurchasePrice(billProducts);

      if (update.$set) {
        update.$set.billProducts = modified;
      } else {
        update.billProducts = modified;
      }
    }

    next();
  } catch (err) {
    console.error("Error in pre-update hook:", err);
    next();
  }
});



//////////////////////////////////////////////////////////////
///////  sale bills
//////////////////////////////////////////////////////////////
const model = mongoose.model('sale_bills', billSchema);
const modelSecondary = secondaryDB.model('sale_bills', new mongoose.Schema(billSchemaFields, { versionKey: false }));

const saleBillActivitySchema = new mongoose.Schema({
    salesBillId: { type: mongoose.Schema.Types.ObjectId, required: [true, "salesBillId is required"] },
    action: { type: String, required: [true, "action is required"] },
    what: { type: Object, required: [true, "what is required"] },
    who: { type: Object, required: [true, "who is required"] },
    mode: { type: String, required: [true, "mode is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] },
    comments: { type: String, required: false, default: undefined },
    reason: { type: String, required: false, default: undefined },
    approvalType: { type: String, required: false, default: null },
    approvalStatus: { type: String, required: false, default: "auto approved" },
    isRestored: { type: Boolean, required: false }
}, { versionKey: false });

const modelActivity = activitiesDB.model('sale_bill_activities', saleBillActivitySchema);
const modelActivitySecondary = activitiesSecondaryDB.model('sale_bill_activities', saleBillActivitySchema);


//////////////////////////////////////////////////////////////
///////  Offline bill queue
//////////////////////////////////////////////////////////////

const offlineBillSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    bill: {
        queueId: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId },
        _id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        ...billSchemaFields
    },
    timeStamp: { type: Date, default: Date.now, required: false },
    billDate: { type: Date, default: Date.now, required: false },
    appName: { type: String, required: false, default: undefined },
    token: { type: String, required: false, default: undefined },
}, { versionKey: false, _id: false });

const offlineBillModel = mongoose.model('offline_queue_sale_bills', offlineBillSchema);
const offlineBillModelSecondary = secondaryDB.model('offline_queue_sale_bills', offlineBillSchema);


//////////////////////////////////////////////////////////////
///////  Conflict bills
//////////////////////////////////////////////////////////////
const conflictSaleBillSchema = new mongoose.Schema({
    bill: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
        ...billSchemaFields
    },
    sessionId: { type: String, default: null, required: false },
    status: { type: String, default: "pending" },   // pending, ignored, accepted
    conflictSalesBillId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    newSalesBillId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    createdBy: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedBy: { type: Object, required: false, default: null },
    updatedAt: { type: Date, default: Date.now },
    notes: { type: String, required: false, default: undefined },
}, { versionKey: false });

const conflictSaleBillModel = mongoose.model('conflict_sale_bills', conflictSaleBillSchema);
const conflictSaleBillModelSecondary = secondaryDB.model('conflict_sale_bills', conflictSaleBillSchema);

const conflictSaleBillLogSchema = new mongoose.Schema({
    conflictId: { type: mongoose.Schema.Types.ObjectId, required: [true, "conflictId is required"] },
    recentLogId: { type: mongoose.Schema.Types.ObjectId, required: false },
    action: { type: String, required: [true, "action is required"] },
    data: { type: Object, required: false, default: undefined },
    comments: { type: String, required: false, default: undefined },
    who: { type: Object, required: [true, "who is required"] },
    when: { type: Date, default: Date.now, required: [true, "when is required"] }
}, { versionKey: false });

const conflictSaleBillLogModel = mongoose.model('conflict_sale_bill_logs', conflictSaleBillLogSchema);
const conflictSaleBillLogModelSecondary = secondaryDB.model('conflict_sale_bill_logs', conflictSaleBillLogSchema);



/**
 * Activity Schema for Validation
 */
const salesBillActivityJoiSchema = Joi.object({
    salesBillId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    comments: Joi.string(),
    reason: Joi.string(),
    approvalStatus: Joi.string()
});

/// create activity
const createActivity = async function (salesBillActivityData) {
    if (salesBillActivityData.what.oldValues && salesBillActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(salesBillActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(salesBillActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                salesBillActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                salesBillActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // salesBillActivityData.what.oldValues === null && salesBillActivityData.what.newValues === null ? delete salesBillActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(salesBillActivityData, salesBillActivityJoiSchema, { abortEarly: false }).then(async (salesBillActivityData) => {
            await modelActivity(salesBillActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};


/// references are available.
const availableReferences = {
    // "users": [{"field":"warehouseMapped","dataType":"Array"}],
    // "user_activities": [
    //   {"field":"what.oldValues.warehouseMapped","dataType":"Array"},
    //   {"field":"what.newValues.warehouseMapped","dataType":"Array"}
    // ],
    // "transport_activites": [
    //   {"field":"_id","dataType":"String"}
    // ]
};

/// remove record.
const removeCollection = function (collectionId, data) {


    return new Promise(function (resolve, reject) {

        let where = { _id: collectionId };
        model.findOne(where, {}).then(async (selectedData) => {

            if (selectedData) {

                if (data.approvalRequired) {

                    var approvalModel = require('./approval.model');

                    /// Create activity log for approval request.
                    let activityLog = {
                        "salesBillId": selectedData._id,
                        "action": "Delete",
                        "who": { "userId": data.user._id, "name": data.user.name },
                        "what": { "oldValues": selectedData },
                        "when": data.timeStamp,
                        "mode": data.mode,
                        "approvalType": data.approvalType,
                        "approvalStatus": "pending"
                    };

                    createActivity(activityLog).then((history) => {

                        if (history) {

                            let approvalRequest = {
                                "moduleName": data.moduleName,
                                "collectionName": "sale_bills",
                                "collectionId": selectedData._id,
                                "activityId": history._id,
                                "approvalType": history.approvalType,
                                "approvalTitle": selectedData.productName,
                                "requestType": "Delete",
                                "who": {
                                    "userId": data.user._id,
                                    "name": data.user.name,
                                    "phone": data.user.phone,
                                },
                                "createdAt": data.timeStamp,
                                "updatedAt": data.timeStamp,
                                "approvalStatus": "pending"
                            };

                            approvalModel(approvalRequest).save().then((approvalRequest) => {

                                resolve({
                                    success: true,
                                    message: "Delete approval request created successfully!",
                                    data: history,
                                    approvalRequest: history,
                                    isApprovalRequired: true
                                });

                            }).catch((e) => {

                                /// Roleback request.
                                modelActivity.findByIdAndRemove({ '_id': history._id },
                                    function (errHistory, historyObject) {
                                        if (errHistory) { reject(errHistory); } else { reject(e); }
                                    });

                            });


                        } else {

                            reject({
                                message: "Opps! something went wrong.",
                                errorCode: "ERROR"
                            });

                        }
                    }).catch((error) => { reject(error); });


                } else {

                    let requiredModels = {};
                    let isReferenceAvailable = false;
                    let promiseCollections = [];

                    for (referenceCollectionName in availableReferences) {
                        let referenceCollection = requiredModels[referenceCollectionName];
                        if (referenceCollection) {
                            let referenceConditions = availableReferences[referenceCollectionName];
                            let where = {};
                            let conditionCount = referenceConditions.length;
                            let orConditions = [];
                            for (let i = 0; i < conditionCount; i++) {
                                let condition = {};
                                if (referenceConditions[i]['dataType'] == "Array") {
                                    condition[referenceConditions[i]['field']] = { $elemMatch: { $eq: collectionId } };
                                    orConditions.push(condition);
                                } else {
                                    condition[referenceConditions[i]['field']] = collectionId;
                                    orConditions.push(condition);
                                }
                            }
                            if (conditionCount > 1) {
                                where["$or"] = orConditions;
                            } else {
                                where = orConditions[0];
                            }
                            promiseCollections.push(referenceCollection.findOne(where, { _id: 1 }));
                        }
                    }
                    let promiseLength = promiseCollections.length;
                    if (promiseLength > 0) {
                        await Promise.allSettled(promiseCollections).then((promiseResults) => {
                            for (let i = 0; i < promiseResults.length; i++) {
                                if (promiseResults[i] && isReferenceAvailable == false) {
                                    isReferenceAvailable = true;
                                }
                            }
                        }).catch((e) => { reject(e); });
                    }

                    /// Create Activity data.
                    let activityLog = {
                        "salesBillId": selectedData._id,
                        "action": "Delete",
                        "who": { "userId": data.user._id, "name": data.user.name },
                        "what": { "oldValues": selectedData },
                        "when": data.timeStamp,
                        "mode": data.mode
                    };

                    /// validate and Create Activity.
                    createActivity(activityLog).then((activity) => {
                        let removeFn = null;
                        if (isReferenceAvailable) {
                            removeFn = model.findOneAndUpdate({ '_id': selectedData._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
                        } else {
                            removeFn = model.findByIdAndRemove({ '_id': selectedData._id });
                        }
                        /// Remove product data
                        removeFn.then((removeObject) => {
                            resolve({
                                success: true,
                                message: "Sales bill removed successfully!",
                                data: removeObject,
                                isApprovalRequired: false
                            });
                        }).catch((err) => { reject(err); });
                    }).catch((e) => { reject(e); });

                }


            } else {

                reject({
                    error: "Sales bill not found!",
                    errorCode: "VALIDATION_ERROR",
                });

            }

        }).catch((error) => { reject(error); });

    });

}


module.exports = {
    collection: model,
    readOnlyCollection: modelSecondary,
    activityCollection: modelActivity,
    readOnlyActivityCollection: modelActivitySecondary,
    offlineBillModel: offlineBillModel,
    readOnlyOfflineBillModel: offlineBillModelSecondary,
    conflictSaleBillModel: conflictSaleBillModel,
    readOnlyConflictSaleBillModel: conflictSaleBillModelSecondary,
    conflictSaleBillLogModel: conflictSaleBillLogModel,
    readOnlyConflictSaleBillLogModel: conflictSaleBillLogModelSecondary,
    createActivity: createActivity,
    removeCollection: removeCollection,
    activityKey: "salesBillId"
}