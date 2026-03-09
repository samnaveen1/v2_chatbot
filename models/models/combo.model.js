const mongoose = require('mongoose');
const Joi = require('joi');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const modelSchema = new mongoose.Schema({

    comboName: {
        type: String,
        required: [true, "comboName is required"] 
    },   
    comboCode: {
        type: String,
        required: [true, "comboCode is required"] 
    },
    comboDescription: {
        type: String,
        required: false
    },
    comboBuyProducts: [{
        productCategoryId: {type: mongoose.Schema.Types.ObjectId},
        productId: {type: mongoose.Schema.Types.ObjectId},
        quantity: {type: Number}
    }],
    maxGetProducts:{
        type: Number,        
    },
    comboGetProducts:[{
        productCategoryId: {type: mongoose.Schema.Types.ObjectId},
        productId: {type: mongoose.Schema.Types.ObjectId},
        quantity: {type: Number},
        isMandatory: {type: Boolean,  default: false},
        isFlatValue: {type: Boolean,  default: false},
        discountValue: {type: Number}
    }],
    offerStartDate:{
        type: Date,
        required: [true, "offerStartDate is required"] 
    },
    isBundled: {type: Boolean,  default: false},
    offerEndDate:{
        type: Date,
        required: false,
        default: null
    },
    toAllCustomers:{
        type: Boolean,
        required: true,
        default: false
    }, 
    customersMapped:{
        customerGroups:[{type: mongoose.Schema.Types.ObjectId}],
        customers: [{type: mongoose.Schema.Types.ObjectId}],
    },

    toAllStores:{
        type: Boolean,
        required: true,
        default: false
    }, 
    storesMapped:[{type: mongoose.Schema.Types.ObjectId}],

    toAllWarehouse:{
        type: Boolean,
        required: true,
        default: false
    }, 
    warehouseMapped:[{type: mongoose.Schema.Types.ObjectId}],

    toAllWeekDays:{
        type: Boolean,
        required: true,
        default: false
    }, 
    weekDays:[
        {
            dayName: { type: String },
            isAppliedFullDay: {
                type: Boolean,           
                default: false
            },
            hoursRange:[
                {
                    from: { type: String },
                    to: { type: String }
                }
            ]
        }
    ],

    toAllMonthDate:{
        type: Boolean,
        required: true,
        default: false
    }, 
    exceptionMonthDateList:{
        type:[{type: Number}],
        required: false,
        default:undefined
    },    

    status: {type: Boolean, default: true },
    approvalStatus: { type: String, required: false, default: "auto approved" }, 
    createdAt: {  type: Date,  default: Date.now },
    updatedAt: {  type: Date,  default: Date.now },
    isDeleted: { type: Boolean }

}, { versionKey: false});

const model = mongoose.model('combos', modelSchema);
const readOnlyModel = secondaryDB.model('combos', modelSchema);

///  activities
const modelActivitySchema = new mongoose.Schema({
    comboId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: [true, "comboId is required"] 
    },
    action: { 
        type: String, 
        required: [true, "action is required"] 
    },
    what: { 
        type: Object, 
        required: [true, "what is required"] 
    },
    who: { 
        type: Object, 
        required: [true, "who is required"] 
    },
    mode: { 
        type: String, 
        required: [true, "mode is required"] 
    },
    when: { 
        type: Date, 
        default: Date.now, 
        required: [true, "when is required"] 
    },
    comments: { 
        type: String, 
        required:false, 
        default: undefined 
    },
    approvalType: { 
        type: String, 
        required: false, 
        default: null 
    },
    approvalStatus: { 
        type: String, 
        required: false, 
        default: "auto approved" 
    }, 
    isRestored: { 
        type: Boolean, 
        required: false 
    }
  }, { versionKey: false });
  
const modelActivity = activitiesDB.model('combo_activities', modelActivitySchema);
const readOnlyModelActivity = activitiesSecondaryDB.model('combo_activities', modelActivitySchema);

/**
 * Activity Schema for Validation
 */
 const modelActivityJoiSchema = Joi.object({
    comboId: Joi.object().required(),
    action: Joi.string().required(),
    who: Joi.object().required(),
    what: Joi.object().required(),
    mode: Joi.string().required(),
    comments: Joi.string(),
    when: Joi.date(),
    isRestored: Joi.bool(),
    approvalType: Joi.string(),
    approvalStatus: Joi.string()
});

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


/// common conditions.
let commonWhereConditions = {
    "status":true, 
    "approvalStatus": {"$in":["approved", "auto approved"]}, 
    "isDeleted": {$ne: true}
};

/// find all records.
const findAll = function({where = null, allowCondition = true, documentFields={}}={}){
    let findCondition = {};
    if(where && allowCondition){  
      findCondition["$and"]=[where,commonWhereConditions];
    }else if(where){
      findCondition = where;
    }else if(allowCondition){
      findCondition = commonWhereConditions;
    }
    return model.find(findCondition,documentFields);
}
  
/// create activity
const createActivity = async function(activityData) { 
    if (activityData.what.oldValues && activityData.what.newValues) {

        let oldValues = JSON.parse(JSON.stringify(activityData.what.oldValues))
        let newValues = JSON.parse(JSON.stringify(activityData.what.newValues))

        await getDistinctValues(oldValues, newValues).then(async (result) => {
            if (result) {
                activityData.what.oldValues = result.old && Object.keys(result.old).length > 0 ? result.old : null
                activityData.what.newValues = result.new && Object.keys(result.new).length > 0 ? result.new : null

                // activityData.what.oldValues === null && activityData.what.newValues === null ? delete activityData.what : null
            }
        })
    }
    return new Promise(function (resolve, reject) {
        if (activityData.what) {
            Joi.validate(activityData, modelActivityJoiSchema, { abortEarly: false }).then(async (activityData) => {
            await modelActivity(activityData).save().then((activity) => { resolve(activity); }).catch((err) => { reject(err); });
            }).catch((error) => {reject(error); });
        } else {
            resolve("")
        }
    });
}
  
/// remove record.
const removeCollection =  function(collectionId, data){


    return new Promise(function (resolve, reject){

        let where = { _id: collectionId };
        model.findOne(where, {}).then(async (selectedData) => {

        if(selectedData){
        
            if(data.approvalRequired){

            var approvalModel =  require('./approval.model');

            /// Create activity log for approval request.
            let activityLog = {           
                "comboId": selectedData._id,
                "action": "Delete",
                "who": { "userId":data.user._id, "name": data.user.name },
                "what": { "oldValues": selectedData },
                "when": data.timeStamp,
                "mode": data.mode,
                "approvalType": data.approvalType,
                "approvalStatus":"pending"
            };

            createActivity(activityLog).then((history)=>{  

                if(history){

                let approvalRequest={
                    "moduleName": data.moduleName,
                    "collectionName": "combos",
                    "collectionId": selectedData._id,
                    "activityId": history._id,
                    "approvalType": history.approvalType,
                    "approvalTitle": selectedData.productName,  
                    "requestType": "Delete",
                    "who":{
                    "userId":data.user._id,
                    "name": data.user.name,
                    "phone": data.user.phone,
                    },
                    "createdAt": data.timeStamp,
                    "updatedAt": data.timeStamp,
                    "approvalStatus": "pending"
                };

                approvalModel(approvalRequest).save().then((approvalRequest)=>{
                
                    resolve({          
                    success: true,
                    message: "delete approval request created successfully!",
                    data: history,
                    approvalRequest: history,
                    isApprovalRequired: true      
                    });

                }).catch((e)=>{   

                    /// Roleback request.
                    modelActivity.findByIdAndRemove({ '_id': history._id },
                    function(errHistory, historyObject){
                    if(errHistory){   reject(errHistory); }else{ reject(e); }
                    }); 

                });


                }else{

                reject({                
                    message: "Opps! something went wrong.",
                    errorCode: "ERROR"
                }); 

                }  
            }).catch((error)=>{ reject(error);  });         


            }else{
            
            let requiredModels = {};
            let isReferenceAvailable = false;
            let promiseCollections = [];   
            
            for(referenceCollectionName in availableReferences){
                let referenceCollection = requiredModels[referenceCollectionName];      
                if(referenceCollection){                   
                    let referenceConditions = availableReferences[referenceCollectionName];                    
                    let where = {};                   
                    let conditionCount = referenceConditions.length;
                    let orConditions = [];
                    for(let i=0; i<conditionCount; i++){
                        let condition={};
                        if(referenceConditions[i]['dataType']=="Array"){
                            condition[referenceConditions[i]['field']] = {$elemMatch:{$eq:collectionId}};   
                            orConditions.push(condition);                         
                        }else{
                            condition[referenceConditions[i]['field']] = collectionId;
                            orConditions.push(condition);
                        }                       
                    }
                    if(conditionCount>1){
                        where["$or"]=orConditions;
                    }else{
                        where=orConditions[0];
                    }        
                    promiseCollections.push(referenceCollection.findOne(where,{_id:1}));
                }                
            }
            let promiseLength = promiseCollections.length;   
            if(promiseLength>0){
                await Promise.allSettled(promiseCollections).then((promiseResults)=>{  
                    for(let i=0; i<promiseResults.length; i++){
                    if(promiseResults[i] && isReferenceAvailable==false){
                        isReferenceAvailable=true;
                    }
                    }                 
                }).catch((e)=>{ reject(e); });
            }

            /// Create Activity data.
            let activityLog = {          
                "comboId": selectedData._id,
                "action": "Delete",
                "who": { "userId":data.user._id, "name": data.user.name },
                "what": {"oldValues": selectedData },
                "when": data.timeStamp,
                "mode": data.mode
            };          

            /// validate and Create Activity. 
            createActivity(activityLog).then((activity) => {
                let removeFn = null;
                if(isReferenceAvailable){
                    removeFn = model.findOneAndUpdate({ '_id': selectedData._id }, { $set: {isDeleted: true} }, { new: true, runValidators: true });
                }else{
                    removeFn = model.findByIdAndRemove({ '_id': selectedData._id });
                }
                /// Remove product data             
                removeFn.then((removeObject)=>{             
                    resolve({
                        success: true,
                        message: "Combo removed successfully!",
                        data: removeObject,
                        isApprovalRequired: false
                    }); 
                }).catch((err)=>{  reject(err); });
            }).catch((e)=>{  reject(e);  });

            }        


        }else{
            
            reject({
            error: "Combo not found!",
            errorCode: "VALIDATION_ERROR",
            });

        }

        }).catch((error) => {  reject(error); });  

    }); 

}


module.exports = { 
    collection: model, 
    activityCollection: modelActivity,
    readOnlyCollection: readOnlyModel, 
    readOnlyActivityCollection: readOnlyModelActivity,
    collection: model, 
    activityCollection: modelActivity,
    findAll: findAll,
    createActivity: createActivity,
    activityKey: "comboId",
    removeCollection: removeCollection,
    availableReferences: availableReferences,  
};

  
  


