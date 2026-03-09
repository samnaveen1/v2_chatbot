const mongoose = require('mongoose');
const Calculations = require('../../helpers/calculations.helper');
const ProductsModel = require('../product.model').readOnlyCollection;
const BusinessUnitModel = require('../business_unit.model').readOnlyCollection;
const Store = require('../store.model').readOnlyCollection;
const Warehouse = require('../warehouse.model').readOnlyCollection;

class MongoHookDataFunctions {
    static async updateBillProductsPurchasePrice(billProducts) {
        if (!Array.isArray(billProducts)) return billProducts;

        for (let i = 0; i < billProducts.length; i++) {
            const product = billProducts[i];

            if (Array.isArray(product.batchProducts)) {
                for (let j = 0; j < product.batchProducts.length; j++) {
                    const batch = product.batchProducts[j];

                    if (batch.productId && batch.batchNumber) {
                        const batchProduct = await ProductsModel.findOne(
                            {
                                _id: mongoose.Types.ObjectId(batch.productId),
                                "batchProducts.batchNumber": batch.batchNumber
                            },
                            { basePurchasePrice: 1, purchaseTaxes: 1, _id: 0 }
                        );

                        if (batchProduct) {
                            batch.basePurchasePrice = batchProduct.basePurchasePrice ?? 0;
                            batch.purchaseTaxes = batchProduct.purchaseTaxes ?? [];
                            batch.purchasePrice = Calculations.calculatePurchasePrice(
                                batch.basePurchasePrice,
                                batch.purchaseTaxes
                            );
                        }
                    }
                }
            }
        }

        return billProducts;
    }

    static async getLocationAndBusinessUnitNames(data) {
        console.log(data);
        const storeName = await this.getStoreName(data.storeId, data.storeName);
        const warehouseName = await this.getWarehouseName(data.warehouseId, data.warehouseName);
        const businessUnitName = await this.getBusinessUnitName(data.businessUnitId, data.businessUnitName);
        const updatedFields = [
            businessUnitName != data.businessUnitName ? "businessUnitName" : null,
            storeName != data.storeName ? "storeName" : null,
            warehouseName != data.warehouseName ? "warehouseName" : null
        ];
        return {
            businessUnitName,
            storeName,
            warehouseName,
            updatedFields: updatedFields.filter(field => field != null),
        }
    }

    static async getBusinessUnitName(businessUnitId, businessUnitName) {
        if (businessUnitName || !businessUnitId) return businessUnitName;

        const businessUnit = await BusinessUnitModel.findOne({ _id: businessUnitId });
        return businessUnit?.legalName;
    }

    static async getStoreName(storeId, storeName) {
        if (storeName || !storeId) return storeName;

        const store = await Store.findOne({ _id: storeId });
        return store?.storeName;
    }

    static async getWarehouseName(warehouseId, warehouseName) {
        if (warehouseName || !warehouseId) return warehouseName;

        const warehouse = await Warehouse.findOne({ _id: warehouseId });
        return warehouse?.warehouseName;
    }
}

module.exports = MongoHookDataFunctions;
