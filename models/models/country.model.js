const mongoose = require('mongoose');
//const autoIncrement = require("mongoose-auto-increment");
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    iso3: { type: String },
    iso2: { type: String },
    numeric_code: { type: String },
    phone_code: { type: String },
    capital: { type: String },
    currency: { type: String },
    currency_name: { type: String },
    currency_symbol: { type: String },
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
        state_code: { type: String },
        latitude: { type: String },
        longitude: { type: String },
        type:{ type: String, default: null },
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

module.exports = mongoose.model('countries', locationSchema);
// module.exports = secondaryDB.model('countries', locationSchema);

