const mongoose = require('mongoose');
const fs = require('fs');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;
const fileUploadSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    uploadKey: { type: String },
    collectionId: { type: mongoose.Schema.Types.ObjectId, required: false, default: null },
    appName: { type: String },
    mode: { type: String },
    fileFieldName: { type: String }, 
    fileName: { type: String }, 
    fileData: { type: Object },
    fileUploadIndex: { type: Number, default: null },
    createdAt: {  type: Date,  default: Date.now },   
},{versionKey: false});

const FileUploads = mongoose.model('file_uploads', fileUploadSchema);

const clearTempUploadedFile = function(whereUpload){

    return new Promise((resolve, reject)=>{

        FileUploads.find(whereUpload,{}).then(async (temporaryUploads)=>{
   
            if(temporaryUploads && temporaryUploads.length>0){
      
              let promiseArray=[];
              let deleteRecords=[];
              for(let i=0; i<temporaryUploads.length; i++){
                fileDirectory = temporaryUploads[i]['fileData']['path'];        
                promiseArray[i]=new Promise((rs, rj)=>{
                  fs.unlink(fileDirectory,function(err){             
                    if(err!=null){
                      rj(err); 
                    }else{
                      rs(true);
                    } 
                  });  
                });
                deleteRecords.push(temporaryUploads[i]['_id']);       
              }
              
              await Promise.allSettled(promiseArray).then(async (allPromiseResult)=>{
      
                if(allPromiseResult){
      
                  for(let j=0; j<allPromiseResult.length; j++){             
                    if(allPromiseResult[j]['status']!="fulfilled"){
                      deleteRecords.splice(j, 1);
                    }
                  }
      
                  let isRecordsRemoved=false;               
                  if(deleteRecords.length>0){
                    await FileUploads.deleteMany({_id: {$in: deleteRecords}}).then((deleteResult)=>{
                      if(deleteResult){ isRecordsRemoved=true; }
                    }); 
                  }  

                  resolve({
                    success: true,
                    message: "File upload cleared",
                    isRecordsRemoved: isRecordsRemoved
                  });

                }
      
              }).catch((err)=>{ reject(err); });
      
            }else{

                resolve({
                    success: true,
                    message: "There is no upload found!",             
                });

            }           
            
          
        }).catch((error)=>{  reject(error); });

    });

}



module.exports = {
    collection: FileUploads,
    clearTempUploadedFile: clearTempUploadedFile
};