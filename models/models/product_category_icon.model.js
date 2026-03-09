const mongoose = require('mongoose');
const { secondaryDB, activitiesDB, activitiesSecondaryDB } = require('../config/mongoose');
const getDistinctValues = require('../helpers/functions.helper').getDistinctValues;

/// ProductCategoriesIcons.
const ProductCategoryIconsSchema = new mongoose.Schema({
    imageName: { type: String, required: [true, "Image name is required"]  },
    imageFile: { type: String, required: [true, "Image file is required"] }
  }, { versionKey: false});
  
const ProductCategoryIcons=mongoose.model('product_category_icons', ProductCategoryIconsSchema);
const modelSecondary = secondaryDB.model('product_category_icons', ProductCategoryIconsSchema);

module.exports = {
    collection: ProductCategoryIcons,
    readOnlyCollection: modelSecondary,
};
  