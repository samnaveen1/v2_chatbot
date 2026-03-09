const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// TransportVehicleIcons.
const TransportVehicleIconsSchema = new mongoose.Schema({
    imageName: { type: String, required: [true, "Image name is required"]  },
    imageFile: { type: String, required: [true, "Image file is required"] }
  }, { versionKey: false});
  
const TransportVehicleIcons=mongoose.model('transport_vehicle_icons', TransportVehicleIconsSchema);
const modelSecondary = secondaryDB.model('transport_vehicle_icons', TransportVehicleIconsSchema);

module.exports = {
    collection: TransportVehicleIcons,
    readOnlyCollection: modelSecondary,
};
  