const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  iso3: { type: String },
  iso2: { type: String },
  numericCode: { type: String },
  phoneCode: { type: String },
  capital: { type: String },
  currency: { type: String },
  currencyName: { type: String },
  currencySymbol: { type: String },
  tid: { type: String },
  native: { type: String },
  region: { type: String },
  subregion: { type: String },
  timezones: [{    
    zoneName: { type: String },
    gmtOffset: { type: Number },
    gmtOffsetName: { type: String },
    abbreviation: { type: String },
    tzName:{ type: String }
  }],
  translations: { type: Object },
  latitude: { type: String },
  longitude: { type: String },
  emoji:{ type: String },
  emojiU:{ type: String },
  states: [
    {         
      name: { type: String },     
      stateCode: { type: String },
      latitude: { type: String },
      longitude: { type: String },
      type:{type: String, default: null},
      cities: [
        {
          name: { type: String },
          latitude: { type: String },
          longitude: { type: String }
        }
      ]
    }
  ]
},{versionKey: false });

const viewTimezonesSchema = {
  _id: mongoose.Schema.Types.ObjectId,
  displayName: String,
  zoneName: String,
  gmtOffset: Number,
  gmtOffsetName: String,
  abbreviation: String,
  tzName: String 
};

module.exports = {
  collection: mongoose.model('locations', locationSchema),
  readOnlyCollection: secondaryDB.model('locations', locationSchema),
  timezoneCollection: mongoose.model('timezones', viewTimezonesSchema),
  readOnlyTimezoneCollection: secondaryDB.model('timezones', viewTimezonesSchema),
};
