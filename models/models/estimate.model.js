const mongoose = require('mongoose');
const Joi = require('joi');

const MongoHookDataFunctions = require('./functions/hook.functions');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const estimateSchema = new mongoose.Schema({
    businessUnitId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    estimateDate: { type: Date, required: true },
    estimateNumber: { type: String },
    saleIncharge: {
        userId: { type: mongoose.Schema.Types.ObjectId, required: false },
        name: { type: String, required: false }
    },
    customer: {
        customerId: { type: mongoose.Schema.Types.ObjectId, required: false },
        customerType: { type: String, required: false },
        displayName: { type: String, required: false },
        customerName: { type: String, required: false },
        phoneNumber: { type: String, required: false },
        emailAddress: { type: String },
        billingAddress: {
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
        },
        deliveryAddress: {
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
        },
        GSTIN: { type: String }
    },
    deliveryType: { type: String, required: false }, // CustomerDelivery, TakeHome
    billProducts: [{
        productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
        masterProductId: { type: mongoose.Schema.Types.ObjectId, required: false },
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
        returnProductQuantity: { type: Number, required: false, default: null },

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
                returnQuantity: { type: Number, required: false },
                scanCodes: [{
                    scanCode: { type: String, required: false, default: null },
                    quantity: { type: Number, required: false },
                }],
                batchNumber: { type: String, required: false },
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
        productDiscounts: [{
            discountType: { type: String, required: false },
            discountName: { type: String, required: false },
            isFlatDiscount: { type: Boolean, required: false, default: false },
            discountValue: { type: Number, required: false },
            discountAmount: { type: Number, required: false },
            discountId: { type: mongoose.Schema.Types.ObjectId, required: false },
        }],
        totalDiscountPrice: { type: Number }, /// (bill based + product based) * qty
        productBasedDiscount: { type: Number },
        comboProducts: [{
            productCategoryId: { type: mongoose.Schema.Types.ObjectId, required: false },
            masterProductId: { type: mongoose.Schema.Types.ObjectId, required: false },
            productCode: { type: String, required: false },
            scanCodes: [{ type: String }],
            isMandatory: { type: Boolean, required: false, default: false },
            quantity: { type: Number, required: false },
            isFlatValue: { type: Boolean, required: false, default: false },
            discountValue: { type: Number, required: false }
        }],
        totalTaxAmount: { type: Number, required: false },/// Total amount for tax calculation
        totalTaxPercentage: { type: Number, required: false },/// Total amount for tax calculation
        totalProductPrice: { type: Number, required: false }, ///Including discounts and tax
        stockHolder: {
            branchtype: { type: String, required: false },
            storeId: { type: mongoose.Schema.Types.ObjectId },
            storeName: { type: String },
            warehouseId: { type: mongoose.Schema.Types.ObjectId },
            warehouseName: { type: String }
        },

        loyaltySetupId: { type: mongoose.Schema.Types.ObjectId, required: false },

        isGift: { type: Boolean, required: false, default: false },
        giftOfferId: { type: mongoose.Schema.Types.ObjectId, default: null, required: false }
    }],
    productSubTotal: { type: Number, required: false }, /// Total of all products without discount & taxes
    billDiscounts: [{
        discountId: { type: mongoose.Schema.Types.ObjectId, required: false },
        discountType: { type: String, required: false },
        discountName: { type: String, required: false },
        isFlatDiscount: { type: Boolean, required: false, default: false },
        isGift: { type: Boolean, required: false, default: false },
        maxGifts: { type: Number, default: null },
        minBillValue: { type: Number, required: false },
        discountValue: { type: Number, required: false },
    }],
    billManualDiscount: { type: Number, required: false },/// Total amount of all discounts(includes product based & bill based discounts)
    totalDiscountAmount: { type: Number, required: false },/// Total amount of all discounts(includes product based & bill based discounts)
    totalTaxableAmount: { type: Number, required: false },/// Total amount with all discounts
    totalTaxAmount: { type: Number, required: false },/// Total amount for tax calculation
    billTaxSummary: [{
        taxName: { type: String, required: false },
        taxPercentage: { type: Number, required: false },
        taxAmount: { type: Number, required: false }
    }],
    totalBillAmount: { type: Number, required: false },
    frightCharge: { type: Number, required: false },
    otherCharges: { type: Number, required: false },
    billRoundOff: { type: Number, required: false },/// Round off amount
    netPayableAmount: { type: Number, required: false },/// Total payable includes all taxes, discounts, frightcharges, othercharges and bill round off
    tcsAmount: { type: Number, require: false },
    totalSavedAmount: { type: Number, required: false },
    billCurrency: {
        currencyCode: { type: String },
        currencySymbol: { type: String }
    },
    termsConditions: { type: mongoose.Schema.Types.Mixed, default: null },
    // termsConditions: {
    //     priceBasis: { type: String },
    //     taxes: { type: String },
    //     modeOfDispatch: { type: String },
    //     paymentTerms: { type: String },
    //     leadTime: { type: String }
    // },
    approvalStatus: { type: String },
    billNotes: { type: String },
    creditDays: { type: Number },
    validityDays: { type: Number },
    estimateValidUpto: { type: Date, required: false },
    isDeleted: { type: Boolean, default: false },
    status: { type: String, required: false },// converted, draft, pending, completed
    userFlag: { type: Boolean, default: false },
    adminFlag: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, required: false },
    updatedAt: { type: Date, default: Date.now, required: false }
}, { versionKey: false });


estimateSchema.pre('save', async function (next) {
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


estimateSchema.pre('findOneAndUpdate', async function (next) {
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


const model = mongoose.model('estimates', estimateSchema);
const readOnlyModel = secondaryDB.model('estimates', estimateSchema);

/// Proforma invoice request Activity
const collectionActivitySchema = new mongoose.Schema({
    estimateId: { type: mongoose.Schema.Types.ObjectId, required: [true, "estimateId is required"] },
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

const modelActivity = activitiesDB.model('estimate_activities', collectionActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('estimate_activities', collectionActivitySchema);

/**
 * Activity Schema for Validation
 */
const estimateActivityJoiSchema = Joi.object({
    estimateId: Joi.object().required(),
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
const createActivity = async function (estimateActivityData) {
    if (estimateActivityData.what.oldValues && estimateActivityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(estimateActivityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(estimateActivityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                estimateActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                estimateActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // estimateActivityData.what.oldValues === null && estimateActivityData.what.newValues === null ? delete estimateActivityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        Joi.validate(estimateActivityData, estimateActivityJoiSchema, { abortEarly: false }).then(async (estimateActivityData) => {
            await modelActivity(estimateActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
        }).catch((error) => { reject(error); });
    });
};



module.exports = {
    collection: model,
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel,
    readOnlyActivityCollection: readOnlyModelActivity,
    createActivity: createActivity,
    activityKey: "estimateId"
}