const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// customers
const collectionSchema = new mongoose.Schema({
  offlineId: { type: String, required: false },
  customerName: { type: String, required: [true, "customerName is required"] },
  displayName: { type: String, required: [true, "displayName is required"] },
  customerType: { type: String, required: [true, "customerType is required"] },
  customerArea: { type: String, required: [false, "customerType is required"] },
  mobile: { type: String, required: [false, "mobile is required"] },
  dateOfBirth: { type: Date, default: null },
  anniversaryDate: { type: Date, default: null },
  // creditLimit: { type: Number, default: null },
  // creditDays: { type: Number, default: 0 },
  // paymentMode: { type: String },
  // defaultCreditLimit: { type: Boolean, required: true },
  // maxCreditLimit: { type: Number, default: null },
  // maxCreditDays: { type: Number, default: null },
  // maxCreditBills: { type: Number, default: null },
  // defaultPaymentMode: { type: String, default: null },
  gstNumber: { type: String, default: null },
  // gstNumberProof: { type: Array, default: null },

  gstNumberProof: [{
    displayName: { type: String, required: false, default: null },
    fileName: { type: String, required: false, default: null },
  }],

  aadharNumber: { type: String },
  // aadharNumberProof: { type: Array, default: null },

  aadharNumberProof: [{
    displayName: { type: String, required: false, default: null },
    fileName: { type: String, required: false, default: null },
  }],

  panNumber: { type: String },
  // panNumberProof: { type: Array, default: null },

  panNumberProof: [{
    displayName: { type: String, required: false, default: null },
    fileName: { type: String, required: false, default: null },
  }],

  otherDocument: { type: String },
  otherDocumentProof: { type: Array, default: null },
  defaultGroups: [{ type: mongoose.Schema.Types.ObjectId }],
  priceMarkupGroups: [{ type: mongoose.Schema.Types.ObjectId }],
  creditLimitGroups: [{ type: mongoose.Schema.Types.ObjectId }],
  customerGroups: [{ type: mongoose.Schema.Types.ObjectId }],

  contactPersons: [
    {
      salutation: { type: String, require: true },
      firstName: { type: String, require: true },
      lastName: { type: String, require: false },
      contactType: { type: String, require: true },
      email: { type: String },
      phone: { type: String },
      address: {
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
        country: {
          countryId: { type: mongoose.Schema.Types.ObjectId },
          name: { type: String },
          countryCode: { type: String }
        },
        pinCode: { type: String },
        mapLocation: {
          latitude: { type: Number, required: false },
          longitude: { type: Number, required: false }
        },
        mapLink: { type: String },
      }
    }
  ],

  additionalContactPersons: [
    {
      salutation: { type: String, require: false },
      firstName: { type: String, require: false },
      lastName: { type: String, require: false },
      contactType: { type: String, require: false },
      email: { type: String },
      phone: { type: String },
      address: {
        addressLine1: { type: String },
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
        country: {
          countryId: { type: mongoose.Schema.Types.ObjectId },
          name: { type: String },
          countryCode: { type: String }
        },
        pinCode: { type: String },
        mapLocation: {
          latitude: { type: Number, required: false },
          longitude: { type: Number, required: false }
        },
        mapLink: { type: String },
      }
    }
  ],

  deliveryAddresses: [
    {
      attention: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      pinCode: { type: String },

      city: {
        cityId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String }
      },
      state: {
        stateId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        stateCode: { type: String }
      },
      country: {
        countryId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        countryCode: { type: String }
      },
      mapLocation: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false }
      },
      mapLink: { type: String },
    }
  ],
  billingAddresses: [
    {
      attention: { type: String },
      addressLine1: { type: String, required: true },
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
      country: {
        countryId: { type: mongoose.Schema.Types.ObjectId },
        name: { type: String },
        countryCode: { type: String }
      },
      pinCode: { type: String },
      mapLocation: {
        latitude: { type: Number, required: false },
        longitude: { type: Number, required: false }
      },
      mapLink: { type: String },
    }
  ],
  mappedStores: [
    {
      storeId: { type: mongoose.Schema.Types.ObjectId, default: null },
      storeName: { type: String, default: null },
      isFavorite: { type: Boolean, default: false }
    }
  ],
  modeOfCommunication: [{ type: String }],
  notification: [{
    preferenceName: { type: String, required: true },/// salesBill returnBill invoiceDue currentBalance
    preferenceValue: { type: Boolean, required: true }
  }],
  communicationPreference: [{
    preferenceName: { type: String, required: true },/// tamil english
    preferenceValue: { type: Boolean, required: true }
  }],
  hasOutStandingBalance: { type: Boolean, default: false },

  outStandingBalanceNotes: { type: String, default: null },
  outStandingPaymentTransactions: [
    {
      paymentType: { type: String, default: null },
      paymentAmount: { type: Number, default: null },
      paymentNote: { type: String, default: null },
      paymentOption: { type: String, required: false },/// Accounts, customerWallet, creditNote, loyaltyPoint
      ledgerTransactionId: { type: mongoose.Schema.Types.ObjectId, required: false },
      creditNoteId: { type: mongoose.Schema.Types.ObjectId, required: false },
      customerWalletId: { type: mongoose.Schema.Types.ObjectId, required: false },
      loyalPointId: { type: mongoose.Schema.Types.ObjectId, required: false },
      createdAt: { type: Date, default: Date.now, required: false }
    }
  ],
  openingBalanceOverpaymentWalletCredit: { type: Number },
  totalOpeningBalance: { type: Number },
  paidOpeningBalance: { type: Number },
  pendingOpeningBalance: { type: Number },
  outStandingOpeningBalance: { type: Number, required: false },
  outStandingCurrentBalance: { type: Number, required: false, default: 0 },
  outStandingOpeningBillCount: { type: Number, required: false, default: 0 },
  outStandingBillCount: { type: Number, required: false, default: 0 },
  walletBalance: { type: Number, required: false, default: 0 },
  loyaltyBalancePoint: { type: Number, required: false, default: 0 },

  creditNoteBalance: { type: Number, required: false, default: 0 },

  status: { type: Boolean, default: true },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean }
}, { versionKey: false });

const Collection = mongoose.model('customers', collectionSchema);
const readOnlyCollection = secondaryDB.model('customers', collectionSchema);

/// Customer Activity
const collectionActivitySchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, required: [true, "customerId is required"] },
  action: { type: String, required: [true, "action is required"] },
  what: { type: Object, required: [true, "what is required"] },
  who: { type: Object, required: [true, "who is required"] },
  mode: { type: String, required: [true, "mode is required"] },
  when: { type: Date, default: Date.now, required: [true, "when is required"] },
  comments: { type: String, required: false, default: undefined },
  approvalType: { type: String, required: false, default: null },
  approvalStatus: { type: String, required: false, default: "auto approved" },
  isRestored: { type: Boolean, required: false }
}, { versionKey: false });
const ActivityCollection = activitiesDB.model('customer_activities', collectionActivitySchema);
const readOnlyActivityCollection = activitiesSecondaryDB.model('customer_activities', collectionActivitySchema);


/**
 * Activity Schema for Validation
 */
const customerActivityJoiSchema = Joi.object({
  customerId: Joi.object().required(),
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

/// common conditions.
let commonWhereConditions = { "approvalStatus": { "$in": ["approved", "auto approved"] }, "isDeleted": { $ne: true } };

/// create activity
const createActivity = async function (customerActivityData) {
  if (customerActivityData.what.oldValues && customerActivityData.what.newValues) {

    let oldValues = JSON.parse(JSON.stringify(customerActivityData.what.oldValues))
    let newValues = JSON.parse(JSON.stringify(customerActivityData.what.newValues))

    await getDistinctValues(oldValues, newValues).then(async (result) => {
      if (result) {
        customerActivityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
        customerActivityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

        // customerActivityData.what.oldValues === null && customerActivityData.what.newValues === null ? delete customerActivityData.what : null
      }
    })
  }
  return new Promise(function (resolve, reject) {
    if (customerActivityData.what) {
      Joi.validate(customerActivityData, customerActivityJoiSchema, { abortEarly: false }).then(async (customerActivityData) => {
        await ActivityCollection(customerActivityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
      }).catch((error) => { reject(error); });
    } else {
      resolve("")
    }
  });
}


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
    Collection.findOne(where, {}).then(async (customer) => {

      if (customer) {

        if (data.approvalRequired) {

          let approvalModel = require('./approval.model');

          /// Create activity log for approval request.
          let activityLog = {
            "customerId": customer._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": customer },
            "when": data.timeStamp,
            "mode": data.mode,
            "approvalType": data.approvalType,
            "approvalStatus": "pending"
          };

          createActivity(activityLog).then((history) => {

            if (history) {

              let approvalRequest = {
                "moduleName": data.moduleName,
                "collectionName": "customers",
                "collectionId": customer._id,
                "activityId": history._id,
                "approvalType": history.approvalType,
                "approvalTitle": customer.legalName,
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
                  message: "delete approval request created successfully!",
                  data: history,
                  approvalRequest: history,
                  isApprovalRequired: true
                });

              }).catch((e) => {

                /// Roleback transpor customer request.
                ActivityCollection.findByIdAndRemove({ '_id': history._id },
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

          for (let referenceCollectionName in availableReferences) {
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
            "customerId": customer._id,
            "action": "Delete",
            "who": { "userId": data.user._id, "name": data.user.name },
            "what": { "oldValues": customer },
            "when": data.timeStamp,
            "mode": data.mode
          };

          /// validate and Create Activity. 
          createActivity(activityLog).then((activity) => {
            let removeFn = null;
            if (isReferenceAvailable) {
              removeFn = Collection.findOneAndUpdate({ '_id': customer._id }, { $set: { isDeleted: true } }, { new: true, runValidators: true });
            } else {
              removeFn = Collection.findByIdAndRemove({ '_id': customer._id });
            }
            /// Remove customer data             
            removeFn.then((removeObject) => {
              resolve({
                success: true,
                message: "Customer removed successfully!",
                data: removeObject,
                isApprovalRequired: false
              });
            }).catch((err) => { reject(err); });
          }).catch((e) => { reject(e); });

        }


      } else {

        reject({
          error: "Customer not found!",
          errorCode: "VALIDATION_ERROR",
        });

      }

    }).catch((error) => { reject(error); });

  });

}


/// find all records.
const findAll = function ({ where = null, allowCondition = true, documentFields = {} } = {}) {
  let findCondition = {};
  if (where && allowCondition) {
    findCondition["$and"] = [where, commonWhereConditions];
  } else if (where) {
    findCondition = where;
  } else if (allowCondition) {
    findCondition = commonWhereConditions;
  }
  return Collection.find(findCondition, documentFields);
}

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// import DB_CONFIG from '../../server/constants/database'
/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

// const agg = [
//   {
//     $match: {
//       isDeleted: {
//         $ne: true,
//       },
//     },
//   },
//   {
//     $lookup: {
//       from: "sale_bills",
//       localField: "_id",
//       foreignField: "customer.customerId",
//       pipeline: [
//         {
//           $match: {
//             paymentStatus: {
//               $in: ["pending", "partial"],
//             },
//           },
//         },
//         {
//           $unwind: "$payments",
//         },
//         {
//           $group: {
//             _id: {
//               saleBillId: "$_id",
//               customerId: "$customer.customerId",
//             },
//             paidAmount: {
//               $push: "$payments.paymentAmount",
//             },
//             netPayableAmount: {
//               $first: "$netPayableAmount",
//             },
//           },
//         },
//         {
//           $project: {
//             paidAmount: {
//               $sum: "$paidAmount",
//             },
//             netPayableAmount: 1,
//           },
//         },
//       ],
//       as: "unPaidAmount",
//     },
//   },
//   {
//     $lookup: {
//       from: "customer_wallets",
//       localField: "_id",
//       foreignField: "customerId",
//       as: "customerWallet",
//     },
//   },
//   {
//     $project: {
//       customerName: 1,
//       displayName: 1,
//       customerType: 1,
//       mobile: 1,
//       creditLimit: 1,
//       creditDays: 1,
//       defaultCreditLimit: 1,
//       maxCreditBills: 1,
//       maxCreditDays: 1,
//       maxCreditLimit: 1,
//       modeOfCommunication: 1,
//       notification: 1,
//       communicationPreference: 1,
//       defaultPaymentMode: 1,
//       gstNumber: 1,
//       customerGroups: 1,
//       contactPersons: 1,
//       deliveryAddresses: 1,
//       billingAddresses: 1,
//       mappedStoreIds: "$mappedStores.storeId",
//       mappedStores: 1,
//       status: 1,
//       approvalStatus: 1,
//       createdAt: 1,
//       updatedAt: 1,
//       pendingBalance: {
//         $subtract: [
//           {
//             $sum: "$unPaidAmount.netPayableAmount",
//           },
//           {
//             $sum: "$unPaidAmount.paidAmount",
//           },
//         ],
//       },
//       customerWalletAmount: {
//         $subtract: [
//           {
//             $sum: "$customerWallet.walletAmount",
//           },
//           {
//             $sum: "$customerWallet.claims.claimAmount",
//           },
//         ],
//       },
//     },
//   },
// ];

// MongoClient.connect(
//   'mongodb://127.0.0.1:27017/',
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   async function (connectErr, client) {
//     assert.equal(null, connectErr);
//     const db = client.db('invypro-annurss');
//     db.collection('customer_pos_view').find({}, {}).toArray()
//       .then(async (result) => {
//         console.log("res", result)
//       })
//     function (err, items) { console.log("items", items) }


//     db.listCollections().toArray().then(async (result) => {
//       console.log("testete", result)
//     })
//     db.createView("entityGroupByVisits", 'complaintvisitcounts', agg)
//     await db.createCollection('customers', {
//       viewOn: 'customers',
//       pipeline: agg,
//     });
//     client.close();
//   }
// );

module.exports = {
  collection: Collection,
  activityCollection: ActivityCollection,
  readOnlyCollection: readOnlyCollection,
  readOnlyActivityCollection: readOnlyActivityCollection,
  createActivity: createActivity,
  findAll: findAll,
  activityKey: "customerId",
  commonWhereConditions: commonWhereConditions,
  removeCollection: removeCollection
};
