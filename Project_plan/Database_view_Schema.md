# Complete Database Schema - INVYPRO Chatbot System

### view names is i will create a view in db and then i will list the names of the view then the LLM will use this view to generate a query for now you can use this listed names ok 
```javascript
{
  1.top product sales 
  2.top customer sales 
  3.top product purchase 
  4.top customer purchase 
  5.top product stock 
  6.top customer stock 
  7.top product sales 
  8.top customer sales 
  9.top product purchase 
  10.top customer purchase 
  11.top product stock 
  till 20 views.....
}
```

## Database: invypro_main database
in invypro_main database are 3 collection we use user_roles collection to get the role and permission of the user
for LLM query we use below mentioned the collection for generate a query ok below collection are Schema of we will query LLM for generate a query and understand the schema ok 
### collection names
1. user_roles 
2. products
3. customers
4. sale_bills

### Collection 1 : user_roles Schema 
```javascript
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "_id",
    "allowedAppKeyNames",
    "createdAt",
    "isDeleted",
    "permissions",
    "roleName",
    "status",
    "updatedAt"
  ],
  "properties": {
    "_id": {
      "$ref": "#/$defs/ObjectId"
    },
    "allowedAppKeyNames": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "createdAt": {
      "$ref": "#/$defs/Date"
    },
    "isDeleted": {
      "type": "boolean"
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "appName",
          "approvalButtons",
          "create",
          "delete",
          "edit",
          "isApproval",
          "isCrud",
          "isReport",
          "moduleId",
          "moduleName",
          "reportId",
          "reportType",
          "restore",
          "view"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "appName": {
            "type": "string"
          },
          "approvalButtons": {
            "type": "array",
            "items": {
              "type": []
            }
          },
          "create": {
            "type": "boolean"
          },
          "delete": {
            "type": "boolean"
          },
          "edit": {
            "type": "boolean"
          },
          "isApproval": {
            "type": "boolean"
          },
          "isCrud": {
            "type": "boolean"
          },
          "isReport": {
            "type": "boolean"
          },
          "moduleId": {
            "$ref": "#/$defs/ObjectId"
          },
          "moduleName": {
            "type": "string"
          },
          "reportId": {
            "type": [
              "null",
              "string"
            ]
          },
          "reportType": {
            "type": [
              "null",
              "string"
            ]
          },
          "restore": {
            "type": "boolean"
          },
          "view": {
            "type": "boolean"
          }
        }
      }
    },
    "roleName": {
      "type": "string"
    },
    "status": {
      "type": "boolean"
    },
    "updatedAt": {
      "$ref": "#/$defs/Date"
    }
  },
  "$defs": {
    "ObjectId": {
      "type": "object",
      "properties": {
        "$oid": {
          "type": "string",
          "pattern": "^[0-9a-fA-F]{24}$"
        }
      },
      "required": [
        "$oid"
      ],
      "additionalProperties": false
    },
    "Date": {
      "type": "object",
      "properties": {
        "$date": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "$date"
      ],
      "additionalProperties": false
    }
  }
}
```
---
### collection 2 : Product Schema (in this prodyct schem have a Stock details like each product of current status details)
```javascript
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "_id",
    "approvalStatus",
    "basePurchasePrice",
    "baseSellingPrice",
    "batchNumber",
    "bundleGiftItem",
    "createdAt",
    "createdBy",
    "currentStock",
    "displayName",
    "expiryDate",
    "grossROIAmount",
    "grossROIPercentage",
    "hasVendorScanCode",
    "inventoryType",
    "isDeleted",
    "isExpirable",
    "isPurchaseOnly",
    "isUniqueScanCode",
    "isVariableSize",
    "masterProductId",
    "netROIAmount",
    "netROIPercentage",
    "oldBatchNumber",
    "packedDate",
    "printTemplateId",
    "processedByScript",
    "productCategoryId",
    "productCategoryName",
    "productName",
    "products",
    "purchaseTaxes",
    "receivingStock",
    "stockHolder",
    "storeId",
    "unit",
    "unitMaximumRetailPrice",
    "updatedAt",
    "warehouseId"
  ],
  "properties": {
    "_id": {
      "$ref": "#/$defs/ObjectId"
    },
    "approvalStatus": {
      "type": "string"
    },
    "basePurchasePrice": {
      "anyOf": [
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "baseSellingPrice": {
      "anyOf": [
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "batchNumber": {
      "type": "string"
    },
    "bundleGiftItem": {
      "type": [
        "string",
        "null"
      ]
    },
    "createdAt": {
      "$ref": "#/$defs/Date"
    },
    "createdBy": {
      "type": "object",
      "required": [
        "name",
        "userId"
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "userId": {
          "$ref": "#/$defs/ObjectId"
        }
      }
    },
    "currentStock": {
      "type": "object",
      "required": [
        "convertedStock",
        "damagedStock",
        "lockedStock",
        "recycleStock",
        "returnStock",
        "salesStock",
        "scrapStock",
        "soldStock",
        "transferedStock"
      ],
      "properties": {
        "convertedStock": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "$ref": "#/$defs/Double"
            }
          ]
        },
        "damagedStock": {
          "type": "integer"
        },
        "lockedStock": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "$ref": "#/$defs/Double"
            }
          ]
        },
        "recycleStock": {
          "type": "integer"
        },
        "returnStock": {
          "type": "integer"
        },
        "salesStock": {
          "type": "integer"
        },
        "scrapStock": {
          "type": "integer"
        },
        "soldStock": {
          "type": "integer"
        },
        "transferedStock": {
          "type": "integer"
        }
      }
    },
    "displayName": {
      "type": "string"
    },
    "expiryDate": {
      "anyOf": [
        {
          "$ref": "#/$defs/Date"
        },
        {
          "type": "null"
        }
      ]
    },
    "grossROIAmount": {
      "type": "string"
    },
    "grossROIPercentage": {
      "type": "string"
    },
    "hasVendorScanCode": {
      "type": "boolean"
    },
    "inventoryType": {
      "type": "string"
    },
    "isAlreadyGeneratedScanCode": {
      "type": [
        "null",
        "boolean"
      ]
    },
    "isDateUpdated": {
      "type": "boolean"
    },
    "isDeleted": {
      "type": "boolean"
    },
    "isExpirable": {
      "type": "boolean"
    },
    "isPurchaseOnly": {
      "type": "boolean"
    },
    "isUniqueScanCode": {
      "type": "boolean"
    },
    "isVariableSize": {
      "type": "boolean"
    },
    "manufacturerBarcode": {
      "type": [
        "string",
        "null"
      ]
    },
    "manufacturerBatchNumber": {
      "type": [
        "string",
        "null"
      ]
    },
    "masterProductId": {
      "$ref": "#/$defs/ObjectId"
    },
    "mismatchFlag": {
      "type": "boolean"
    },
    "netROIAmount": {
      "type": "string"
    },
    "netROIPercentage": {
      "type": "string"
    },
    "oldBatchNumber": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "batchNumber",
          "createdAt",
          "updatedAt"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "batchNumber": {
            "type": "string"
          },
          "createdAt": {
            "$ref": "#/$defs/Date"
          },
          "updatedAt": {
            "$ref": "#/$defs/Date"
          }
        }
      }
    },
    "packedDate": {
      "$ref": "#/$defs/Date"
    },
    "priceUpdatedVia": {
      "type": [
        "null",
        "string"
      ]
    },
    "printTemplateId": {
      "type": "null"
    },
    "processedByScript": {
      "type": "boolean"
    },
    "productCategoryId": {
      "$ref": "#/$defs/ObjectId"
    },
    "productCategoryName": {
      "type": [
        "string",
        "null"
      ]
    },
    "productName": {
      "type": "string"
    },
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "baseSellingPrice",
          "blockId",
          "createdVia",
          "inwardId",
          "isPackOpened",
          "productStatus",
          "returnBillId",
          "returnBillNumber",
          "returnUnitSize",
          "saleBillId",
          "saleBillNumber",
          "scanCode",
          "soldByScancodeMatched",
          "stockMoveRequestId",
          "stockType",
          "taxes",
          "updatedAt"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "baseSellingPrice": {
            "anyOf": [
              {
                "$ref": "#/$defs/Double"
              },
              {
                "type": "integer"
              }
            ]
          },
          "blockId": {
            "anyOf": [
              {
                "$ref": "#/$defs/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "blockName": {
            "type": "null"
          },
          "cellId": {
            "anyOf": [
              {
                "$ref": "#/$defs/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "cellName": {
            "type": [
              "string",
              "null"
            ]
          },
          "createdVia": {
            "type": "string"
          },
          "inwardId": {
            "anyOf": [
              {
                "$ref": "#/$defs/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "isPackOpened": {
            "type": "boolean"
          },
          "metaData": {
            "anyOf": [
              {
                "type": "object",
                "required": [],
                "properties": {
                  "billNumber": {
                    "type": "string"
                  },
                  "cancelledPODBillId": {
                    "$ref": "#/$defs/ObjectId"
                  },
                  "saleBillId": {
                    "$ref": "#/$defs/ObjectId"
                  },
                  "saleBillType": {
                    "type": "string"
                  },
                  "salesInvoiceId": {
                    "$ref": "#/$defs/ObjectId"
                  },
                  "stockConversionId": {
                    "anyOf": [
                      {
                        "type": "string"
                      },
                      {
                        "$ref": "#/$defs/ObjectId"
                      }
                    ]
                  },
                  "stockRequestId": {
                    "$ref": "#/$defs/ObjectId"
                  },
                  "unlockedFrom": {
                    "type": "string"
                  }
                }
              },
              {
                "type": "null"
              }
            ]
          },
          "productStatus": {
            "type": "string"
          },
          "rackId": {
            "type": "null"
          },
          "returnBillId": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "$ref": "#/$defs/ObjectId"
              }
            ]
          },
          "returnBillNumber": {
            "type": [
              "null",
              "string"
            ]
          },
          "returnUnitSize": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "saleBillId": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "$ref": "#/$defs/ObjectId"
              }
            ]
          },
          "saleBillNumber": {
            "type": [
              "null",
              "string"
            ]
          },
          "scanCode": {
            "type": [
              "string",
              "null"
            ]
          },
          "sellingPrice": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "soldByScancodeMatched": {
            "type": [
              "null",
              "boolean"
            ]
          },
          "stockConversionId": {
            "$ref": "#/$defs/ObjectId"
          },
          "stockMoveRequestId": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "$ref": "#/$defs/ObjectId"
              }
            ]
          },
          "stockType": {
            "type": "string"
          },
          "storageBlockName": {
            "type": [
              "string",
              "null"
            ]
          },
          "taxes": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "_id",
                "taxGroup",
                "taxId",
                "taxPercentage",
                "taxRegistrarName"
              ],
              "properties": {
                "_id": {
                  "$ref": "#/$defs/ObjectId"
                },
                "taxGroup": {
                  "type": "string"
                },
                "taxId": {
                  "$ref": "#/$defs/ObjectId"
                },
                "taxPercentage": {
                  "anyOf": [
                    {
                      "type": "integer"
                    },
                    {
                      "$ref": "#/$defs/Double"
                    }
                  ]
                },
                "taxRegistrarName": {
                  "type": "string"
                }
              }
            }
          },
          "updatedAt": {
            "anyOf": [
              {
                "$ref": "#/$defs/Date"
              },
              {
                "type": "null"
              }
            ]
          }
        }
      }
    },
    "purchasePrice": {
      "anyOf": [
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "purchaseTaxes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "taxGroup",
          "taxId",
          "taxPercentage",
          "taxRegistrarName"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "taxGroup": {
            "type": "string"
          },
          "taxId": {
            "$ref": "#/$defs/ObjectId"
          },
          "taxPercentage": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "taxRegistrarName": {
            "type": "string"
          }
        }
      }
    },
    "receivingStock": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "salesTaxes": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "taxGroup",
          "taxId",
          "taxPercentage",
          "taxRegistrarName"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "taxGroup": {
            "type": "string"
          },
          "taxId": {
            "$ref": "#/$defs/ObjectId"
          },
          "taxPercentage": {
            "anyOf": [
              {
                "$ref": "#/$defs/Double"
              },
              {
                "type": "integer"
              }
            ]
          },
          "taxRegistrarName": {
            "type": "string"
          }
        }
      }
    },
    "scrapClearFromDB": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "clearedAt",
          "name",
          "scrapStock",
          "userId"
        ],
        "properties": {
          "clearedAt": {
            "$ref": "#/$defs/Date"
          },
          "name": {
            "type": "string"
          },
          "scrapStock": {
            "type": "integer"
          },
          "userId": {
            "$ref": "#/$defs/ObjectId"
          }
        }
      }
    },
    "sellingPrice": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "stockHolder": {
      "type": "string"
    },
    "storeId": {
      "anyOf": [
        {
          "$ref": "#/$defs/ObjectId"
        },
        {
          "type": "null"
        }
      ]
    },
    "storeName": {
      "type": [
        "string",
        "null"
      ]
    },
    "unit": {
      "type": "object",
      "required": [
        "unitId",
        "unitSize",
        "unitSymbol"
      ],
      "properties": {
        "unitId": {
          "$ref": "#/$defs/ObjectId"
        },
        "unitName": {
          "type": "string"
        },
        "unitSize": {
          "type": "integer"
        },
        "unitSymbol": {
          "type": "string"
        }
      }
    },
    "unitMaximumRetailPrice": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "updatedAt": {
      "$ref": "#/$defs/Date"
    },
    "warehouseId": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "$ref": "#/$defs/ObjectId"
        }
      ]
    },
    "warehouseName": {
      "type": [
        "string",
        "null"
      ]
    }
  },
  "$defs": {
    "ObjectId": {
      "type": "object",
      "properties": {
        "$oid": {
          "type": "string",
          "pattern": "^[0-9a-fA-F]{24}$"
        }
      },
      "required": [
        "$oid"
      ],
      "additionalProperties": false
    },
    "Double": {
      "oneOf": [
        {
          "type": "number"
        },
        {
          "type": "object",
          "properties": {
            "$numberDouble": {
              "enum": [
                "Infinity",
                "-Infinity",
                "NaN"
              ]
            }
          }
        }
      ]
    },
    "Date": {
      "type": "object",
      "properties": {
        "$date": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "$date"
      ],
      "additionalProperties": false
    }
  }
}
```
### collection 3 : customers schema
```javascript

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "_id",
    "aadharNumberProof",
    "additionalContactPersons",
    "anniversaryDate",
    "approvalStatus",
    "billingAddresses",
    "communicationPreference",
    "contactPersons",
    "createdAt",
    "creditLimitGroups",
    "creditNoteBalance",
    "customerGroups",
    "customerName",
    "customerType",
    "dateOfBirth",
    "defaultGroups",
    "deliveryAddresses",
    "displayName",
    "gstNumber",
    "gstNumberProof",
    "hasOutStandingBalance",
    "loyaltyBalancePoint",
    "mappedStores",
    "mobile",
    "modeOfCommunication",
    "notification",
    "otherDocumentProof",
    "outStandingBalanceNotes",
    "outStandingBillCount",
    "outStandingCurrentBalance",
    "outStandingOpeningBillCount",
    "outStandingPaymentTransactions",
    "panNumberProof",
    "priceMarkupGroups",
    "status",
    "updatedAt",
    "walletBalance"
  ],
  "properties": {
    "_id": {
      "$ref": "#/$defs/ObjectId"
    },
    "aadharNumberProof": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "additionalContactPersons": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "anniversaryDate": {
      "type": "null"
    },
    "approvalStatus": {
      "type": "string"
    },
    "billingAddresses": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "addressLine1",
          "city",
          "country",
          "pinCode",
          "state"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "addressLine1": {
            "type": "string"
          },
          "addressLine2": {
            "type": "string"
          },
          "attention": {
            "type": "null"
          },
          "city": {
            "type": "object",
            "required": [
              "cityId",
              "name"
            ],
            "properties": {
              "cityId": {
                "anyOf": [
                  {
                    "$ref": "#/$defs/ObjectId"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "name": {
                "type": "string"
              }
            }
          },
          "country": {
            "type": "object",
            "required": [
              "countryId",
              "name"
            ],
            "properties": {
              "countryCode": {
                "type": [
                  "null",
                  "string"
                ]
              },
              "countryId": {
                "$ref": "#/$defs/ObjectId"
              },
              "name": {
                "type": "string"
              }
            }
          },
          "mapLocation": {
            "type": "object",
            "required": [
              "latitude",
              "longitude"
            ],
            "properties": {
              "latitude": {
                "$ref": "#/$defs/Double"
              },
              "longitude": {
                "$ref": "#/$defs/Double"
              }
            }
          },
          "pinCode": {
            "type": "string"
          },
          "state": {
            "type": "object",
            "required": [
              "name",
              "stateId"
            ],
            "properties": {
              "name": {
                "type": "string"
              },
              "stateCode": {
                "type": "string"
              },
              "stateId": {
                "$ref": "#/$defs/ObjectId"
              }
            }
          }
        }
      }
    },
    "communicationPreference": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "preferenceName",
          "preferenceValue"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "preferenceName": {
            "type": "string"
          },
          "preferenceValue": {
            "type": "boolean"
          }
        }
      }
    },
    "contactPersons": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "address",
          "contactType",
          "email",
          "firstName",
          "lastName",
          "phone",
          "salutation"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "address": {
            "type": "object",
            "required": [
              "addressLine1",
              "addressLine2",
              "city",
              "country",
              "mapLocation",
              "pinCode",
              "state"
            ],
            "properties": {
              "addressLine1": {
                "type": "string"
              },
              "addressLine2": {
                "type": "string"
              },
              "city": {
                "anyOf": [
                  {
                    "type": "object",
                    "required": [
                      "cityId",
                      "name"
                    ],
                    "properties": {
                      "cityId": {
                        "$ref": "#/$defs/ObjectId"
                      },
                      "name": {
                        "type": "string"
                      }
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "country": {
                "anyOf": [
                  {
                    "type": "object",
                    "required": [
                      "countryId",
                      "name"
                    ],
                    "properties": {
                      "countryId": {
                        "$ref": "#/$defs/ObjectId"
                      },
                      "name": {
                        "type": "string"
                      }
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "mapLocation": {
                "type": "null"
              },
              "pinCode": {
                "type": "string"
              },
              "state": {
                "anyOf": [
                  {
                    "type": "object",
                    "required": [
                      "name",
                      "stateId"
                    ],
                    "properties": {
                      "name": {
                        "type": "string"
                      },
                      "stateId": {
                        "$ref": "#/$defs/ObjectId"
                      }
                    }
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            }
          },
          "contactType": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "firstName": {
            "type": "string"
          },
          "lastName": {
            "type": "null"
          },
          "phone": {
            "type": "string"
          },
          "salutation": {
            "type": "string"
          }
        }
      }
    },
    "createdAt": {
      "$ref": "#/$defs/Date"
    },
    "creditLimitGroups": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/ObjectId"
      }
    },
    "creditNoteBalance": {
      "type": "integer"
    },
    "customerArea": {
      "type": "string"
    },
    "customerGroups": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "customerName": {
      "type": "string"
    },
    "customerType": {
      "type": "string"
    },
    "dateOfBirth": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "$ref": "#/$defs/Date"
        }
      ]
    },
    "defaultGroups": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "deliveryAddresses": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "addressLine1",
          "city",
          "country",
          "pinCode",
          "state"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "addressLine1": {
            "type": "string"
          },
          "addressLine2": {
            "type": "string"
          },
          "attention": {
            "type": "null"
          },
          "city": {
            "type": "object",
            "required": [
              "cityId",
              "name"
            ],
            "properties": {
              "cityId": {
                "anyOf": [
                  {
                    "$ref": "#/$defs/ObjectId"
                  },
                  {
                    "type": "null"
                  }
                ]
              },
              "name": {
                "type": "string"
              }
            }
          },
          "country": {
            "type": "object",
            "required": [
              "countryId",
              "name"
            ],
            "properties": {
              "countryCode": {
                "type": [
                  "null",
                  "string"
                ]
              },
              "countryId": {
                "$ref": "#/$defs/ObjectId"
              },
              "name": {
                "type": "string"
              }
            }
          },
          "mapLocation": {
            "type": "object",
            "required": [
              "latitude",
              "longitude"
            ],
            "properties": {
              "latitude": {
                "anyOf": [
                  {
                    "$ref": "#/$defs/Double"
                  },
                  {
                    "type": "integer"
                  }
                ]
              },
              "longitude": {
                "anyOf": [
                  {
                    "$ref": "#/$defs/Double"
                  },
                  {
                    "type": "integer"
                  }
                ]
              }
            }
          },
          "pinCode": {
            "type": "string"
          },
          "state": {
            "type": "object",
            "required": [
              "name",
              "stateId"
            ],
            "properties": {
              "name": {
                "type": "string"
              },
              "stateCode": {
                "type": "string"
              },
              "stateId": {
                "anyOf": [
                  {
                    "$ref": "#/$defs/ObjectId"
                  },
                  {
                    "type": "null"
                  }
                ]
              }
            }
          }
        }
      }
    },
    "displayName": {
      "type": "string"
    },
    "gstNumber": {
      "type": [
        "null",
        "string"
      ]
    },
    "gstNumberProof": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "hasOutStandingBalance": {
      "type": "boolean"
    },
    "loyaltyBalancePoint": {
      "type": "integer"
    },
    "mappedStores": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "isFavorite",
          "storeId",
          "storeName"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "isFavorite": {
            "type": "boolean"
          },
          "storeId": {
            "$ref": "#/$defs/ObjectId"
          },
          "storeName": {
            "type": "string"
          }
        }
      }
    },
    "mobile": {
      "type": "string"
    },
    "modeOfCommunication": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "notification": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "preferenceName",
          "preferenceValue"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "preferenceName": {
            "type": "string"
          },
          "preferenceValue": {
            "type": "boolean"
          }
        }
      }
    },
    "offlineId": {
      "type": [
        "null",
        "string"
      ]
    },
    "otherDocumentProof": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "outStandingBalanceNotes": {
      "type": "null"
    },
    "outStandingBillCount": {
      "type": "integer"
    },
    "outStandingCurrentBalance": {
      "type": "integer"
    },
    "outStandingOpeningBalance": {
      "type": "integer"
    },
    "outStandingOpeningBillCount": {
      "type": "integer"
    },
    "outStandingPaymentTransactions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "createdAt",
          "ledgerTransactionId",
          "paymentAmount",
          "paymentNote",
          "paymentOption",
          "paymentType"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "createdAt": {
            "$ref": "#/$defs/Date"
          },
          "ledgerTransactionId": {
            "$ref": "#/$defs/ObjectId"
          },
          "paymentAmount": {
            "type": "integer"
          },
          "paymentNote": {
            "type": "string"
          },
          "paymentOption": {
            "type": "string"
          },
          "paymentType": {
            "type": "string"
          }
        }
      }
    },
    "paidOpeningBalance": {
      "type": "integer"
    },
    "panNumberProof": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "pendingOpeningBalance": {
      "type": "integer"
    },
    "priceMarkupGroups": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "status": {
      "type": "boolean"
    },
    "totalOpeningBalance": {
      "type": "integer"
    },
    "updatedAt": {
      "$ref": "#/$defs/Date"
    },
    "walletBalance": {
      "type": "integer"
    }
  },
  "$defs": {
    "ObjectId": {
      "type": "object",
      "properties": {
        "$oid": {
          "type": "string",
          "pattern": "^[0-9a-fA-F]{24}$"
        }
      },
      "required": [
        "$oid"
      ],
      "additionalProperties": false
    },
    "Double": {
      "oneOf": [
        {
          "type": "number"
        },
        {
          "type": "object",
          "properties": {
            "$numberDouble": {
              "enum": [
                "Infinity",
                "-Infinity",
                "NaN"
              ]
            }
          }
        }
      ]
    },
    "Date": {
      "type": "object",
      "properties": {
        "$date": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "$date"
      ],
      "additionalProperties": false
    }
  }
}
## MongoDB Views is i will create a view in mongodb later i will mention the view name and collection name
eg : 
1.view_unpaid_bills 
2.top selling products
3.top customers etc....upto 20 views name  

### view_unpaid_bills
```javascript
db.createView("view_unpaid_bills", "sale_bills", [
  {$match: {
    paymentStatus: "unpaid",
    saleBillDate: {$gte: {$subtract: ["$$NOW", 7776000000]}}, // 90 days
    isDeleted: false
  }},
  {$lookup: {
    from: "stores",
    localField: "storeId",
    foreignField: "_id",
    as: "store"
  }},
  {$unwind: {path: "$store", preserveNullAndEmptyArrays: true}},
  {$lookup: {
    from: "customers",
    localField: "customerId",
    foreignField: "_id",
    as: "customer"
  }},
  {$unwind: {path: "$customer", preserveNullAndEmptyArrays: true}},
  {$project: {
    saleBillNumber: 1,
    saleBillDate: 1,
    totalBillAmount: 1,
    storeName: "$store.storeName",
    customerName: "$customer.customerName",
    daysOverdue: {$dateDiff: {
      startDate: "$saleBillDate",
      endDate: "$$NOW",
      unit: "day"
    }}
  }},
  {$sort: {daysOverdue: -1}},
  {$limit: 100}
])
```
### collection 4 : sale_bills schema
```javascript
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": [
    "_id",
    "adminFlag",
    "appliedComboDetails",
    "appliedComboProducts",
    "appName",
    "approvalStatus",
    "balanceToCustomer",
    "billCurrency",
    "billDiscounts",
    "billPaymentDueDate",
    "billProducts",
    "billRoundOff",
    "billTaxSummary",
    "businessUnitAddress",
    "businessUnitBankDetails",
    "businessUnitCinNumber",
    "businessUnitEmail",
    "businessUnitGpayUPI_Id",
    "businessUnitGpayUPI_No",
    "businessUnitGSTNumber",
    "businessUnitId",
    "businessUnitMobile",
    "businessUnitName",
    "businessUnitPanNumber",
    "calculatedLoyaltyPoint",
    "createdAt",
    "creditNoteAmount",
    "creditNoteId",
    "customer",
    "deliveryChallanNumber",
    "deliveryType",
    "displayedLoyaltyAmount",
    "displayedLoyaltyPoint",
    "displayedOutStandingAmount",
    "displayedWalletAmount",
    "distanceInKm",
    "eInvoice",
    "eInvoiceQR",
    "eInvoiceStatus",
    "eWayBill",
    "eWayBillStatus",
    "frightCharge",
    "fromEstimateId",
    "fromProformaInvoiceId",
    "fromSalesOrderId",
    "invoiceNumber",
    "isArchived",
    "isCustomerBalancePaidByDirectCash",
    "isDeleted",
    "isVoid",
    "isWriteOff",
    "loyaltyCalculationFlag",
    "loyaltyCurrencyValue",
    "netPayableAmount",
    "offlineBillNumber",
    "otherCharges",
    "payments",
    "paymentStatus",
    "podBillNumber",
    "podStatus",
    "productSubTotal",
    "returnBills",
    "saleBillDate",
    "saleBillNumber",
    "saleBillType",
    "saleIncharge",
    "status",
    "storeId",
    "tcsAmount",
    "tempLoyaltyPoint",
    "tempLoyaltyPointBalance",
    "termsConditions",
    "totalBillAmount",
    "totalDiscountAmount",
    "totalSavedAmount",
    "totalTaxableAmount",
    "totalTaxAmount",
    "updatedAt",
    "UPIQR",
    "userFlag",
    "vehicleNumber",
    "walletCredit"
  ],
  "properties": {
    "_id": {
      "$ref": "#/$defs/ObjectId"
    },
    "adminFlag": {
      "type": "boolean"
    },
    "appliedComboDetails": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "appliedComboProducts": {
      "type": "array",
      "items": {
        "type": []
      }
    },
    "appName": {
      "type": [
        "string",
        "null"
      ]
    },
    "approvalStatus": {
      "type": "string"
    },
    "availableFractionalExtraLoyaltyPoint": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "balanceToCustomer": {
      "type": [
        "integer",
        "null"
      ]
    },
    "billCurrency": {
      "type": "object",
      "required": [
        "currencyCode",
        "currencySymbol"
      ],
      "properties": {
        "currencyCode": {
          "type": "string"
        },
        "currencySymbol": {
          "type": "string"
        }
      }
    },
    "billDiscounts": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "type": "array",
          "items": {
            "type": []
          }
        }
      ]
    },
    "billedAt": {
      "$ref": "#/$defs/Date"
    },
    "billManualDiscount": {
      "type": [
        "null",
        "integer"
      ]
    },
    "billNotes": {
      "type": [
        "null",
        "string"
      ]
    },
    "billPaymentDueDate": {
      "anyOf": [
        {
          "type": "null"
        },
        {
          "$ref": "#/$defs/Date"
        }
      ]
    },
    "billProducts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "appliedCombos",
          "baseSellingPrice",
          "batchProducts",
          "comboOfferId",
          "discountAmount",
          "displayName",
          "giftOfferId",
          "HSNCode",
          "inventoryType",
          "invoiceDisplayName",
          "isCombo",
          "isGift",
          "isVariableSize",
          "masterProductId",
          "productBasedDiscount",
          "productCategoryId",
          "productCode",
          "productDiscounts",
          "productName",
          "productQuantity",
          "salesTaxes",
          "sellingPrice",
          "sellingPriceWithDiscount",
          "stockHolder",
          "taxAmount",
          "taxes",
          "totalDiscountPrice",
          "totalProductPrice",
          "totalTaxAmount",
          "totalTaxPercentage",
          "unit",
          "unitMaximumPrice"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "appliedCombos": {
            "type": "array",
            "items": {
              "type": []
            }
          },
          "baseSellingPrice": {
            "anyOf": [
              {
                "$ref": "#/$defs/Double"
              },
              {
                "type": "integer"
              }
            ]
          },
          "batchProducts": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "_id",
                "batchNumber",
                "expiryDate",
                "packedDate",
                "productId",
                "quantity",
                "scanCodes"
              ],
              "properties": {
                "_id": {
                  "$ref": "#/$defs/ObjectId"
                },
                "basePurchasePrice": {
                  "anyOf": [
                    {
                      "$ref": "#/$defs/Double"
                    },
                    {
                      "type": "integer"
                    }
                  ]
                },
                "batchNumber": {
                  "type": "string"
                },
                "expiryDate": {
                  "anyOf": [
                    {
                      "$ref": "#/$defs/Date"
                    },
                    {
                      "type": "null"
                    }
                  ]
                },
                "manufacturerBatchNumber": {
                  "type": [
                    "null",
                    "string"
                  ]
                },
                "packedDate": {
                  "$ref": "#/$defs/Date"
                },
                "productId": {
                  "$ref": "#/$defs/ObjectId"
                },
                "purchasePrice": {
                  "anyOf": [
                    {
                      "$ref": "#/$defs/Double"
                    },
                    {
                      "type": "integer"
                    }
                  ]
                },
                "purchaseTaxes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "_id",
                      "taxGroup",
                      "taxId",
                      "taxPercentage",
                      "taxRegistrarName"
                    ],
                    "properties": {
                      "_id": {
                        "$ref": "#/$defs/ObjectId"
                      },
                      "taxGroup": {
                        "type": "string"
                      },
                      "taxId": {
                        "$ref": "#/$defs/ObjectId"
                      },
                      "taxPercentage": {
                        "anyOf": [
                          {
                            "$ref": "#/$defs/Double"
                          },
                          {
                            "type": "integer"
                          }
                        ]
                      },
                      "taxRegistrarName": {
                        "type": "string"
                      }
                    }
                  }
                },
                "quantity": {
                  "type": "integer"
                },
                "scanCodes": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": [
                      "_id",
                      "quantity",
                      "scanCode"
                    ],
                    "properties": {
                      "_id": {
                        "$ref": "#/$defs/ObjectId"
                      },
                      "quantity": {
                        "type": "integer"
                      },
                      "scanCode": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "bundleGiftItem": {
            "type": [
              "string",
              "null"
            ]
          },
          "changedSellingPrice": {
            "type": "integer"
          },
          "comboBaseSellingPrice": {
            "type": "null"
          },
          "comboOfferId": {
            "type": "null"
          },
          "discountAmount": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "displayName": {
            "type": "string"
          },
          "giftOfferId": {
            "type": "null"
          },
          "HSNCode": {
            "type": [
              "string",
              "null"
            ]
          },
          "inventoryType": {
            "type": "string"
          },
          "invoiceDisplayName": {
            "type": "string"
          },
          "isCombo": {
            "type": [
              "null",
              "boolean"
            ]
          },
          "isGift": {
            "type": "boolean"
          },
          "isVariableSize": {
            "type": "boolean"
          },
          "loyaltySetupId": {
            "anyOf": [
              {
                "$ref": "#/$defs/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "masterProductId": {
            "$ref": "#/$defs/ObjectId"
          },
          "parentCategoryName": {
            "type": [
              "null",
              "string"
            ]
          },
          "parentSubCategories": {
            "type": [
              "null",
              "string"
            ]
          },
          "productBasedDiscount": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "productCategoryId": {
            "$ref": "#/$defs/ObjectId"
          },
          "productCategoryName": {
            "type": [
              "null",
              "string"
            ]
          },
          "productCode": {
            "type": "string"
          },
          "productDescription": {
            "type": "string"
          },
          "productDiscounts": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": [
                    "_id",
                    "discountAmount",
                    "discountId",
                    "discountName",
                    "discountType",
                    "discountValue",
                    "isFlatDiscount"
                  ],
                  "properties": {
                    "_id": {
                      "$ref": "#/$defs/ObjectId"
                    },
                    "discountAmount": {
                      "anyOf": [
                        {
                          "$ref": "#/$defs/Double"
                        },
                        {
                          "type": "integer"
                        }
                      ]
                    },
                    "discountId": {
                      "anyOf": [
                        {
                          "type": "null"
                        },
                        {
                          "$ref": "#/$defs/ObjectId"
                        }
                      ]
                    },
                    "discountName": {
                      "type": "string"
                    },
                    "discountType": {
                      "type": "string"
                    },
                    "discountValue": {
                      "type": "integer"
                    },
                    "isFlatDiscount": {
                      "type": "boolean"
                    },
                    "isQuantityBasedDiscount": {
                      "type": "string"
                    }
                  }
                }
              }
            ]
          },
          "productName": {
            "type": "string"
          },
          "productQuantity": {
            "type": "integer"
          },
          "returnQuantity": {
            "type": "integer"
          },
          "salesTaxes": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "type": "object",
                "required": [
                  "interStateTaxes",
                  "intraStateTaxes"
                ],
                "properties": {
                  "interNationalTaxes": {
                    "type": "array",
                    "items": {
                      "type": []
                    }
                  },
                  "interStateTaxes": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "taxGroup",
                        "taxId",
                        "taxPercentage",
                        "taxRegistrarName"
                      ],
                      "properties": {
                        "taxGroup": {
                          "type": "string"
                        },
                        "taxId": {
                          "type": "string"
                        },
                        "taxPercentage": {
                          "type": "integer"
                        },
                        "taxRegistrarName": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "intraStateTaxes": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "required": [
                        "taxGroup",
                        "taxId",
                        "taxPercentage",
                        "taxRegistrarName"
                      ],
                      "properties": {
                        "taxGroup": {
                          "type": "string"
                        },
                        "taxId": {
                          "type": "string"
                        },
                        "taxPercentage": {
                          "anyOf": [
                            {
                              "$ref": "#/$defs/Double"
                            },
                            {
                              "type": "integer"
                            }
                          ]
                        },
                        "taxRegistrarName": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              }
            ]
          },
          "sellingPrice": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "sellingPriceWithDiscount": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "stockHolder": {
            "type": "object",
            "required": [
              "branchtype"
            ],
            "properties": {
              "branchtype": {
                "type": "string"
              },
              "shortName": {
                "type": "string"
              },
              "storeId": {
                "$ref": "#/$defs/ObjectId"
              },
              "storeName": {
                "type": "string"
              },
              "warehouseId": {
                "$ref": "#/$defs/ObjectId"
              },
              "warehouseName": {
                "type": "string"
              }
            }
          },
          "taxAmount": {
            "anyOf": [
              {
                "$ref": "#/$defs/Double"
              },
              {
                "type": "integer"
              }
            ]
          },
          "taxes": {
            "type": "array",
            "items": {
              "type": "object",
              "required": [
                "_id",
                "taxGroup",
                "taxId",
                "taxPercentage",
                "taxRegistrarName"
              ],
              "properties": {
                "_id": {
                  "$ref": "#/$defs/ObjectId"
                },
                "taxGroup": {
                  "type": "string"
                },
                "taxId": {
                  "$ref": "#/$defs/ObjectId"
                },
                "taxName": {
                  "type": "string"
                },
                "taxPercentage": {
                  "anyOf": [
                    {
                      "$ref": "#/$defs/Double"
                    },
                    {
                      "type": "integer"
                    }
                  ]
                },
                "taxRegistrarName": {
                  "type": "string"
                }
              }
            }
          },
          "totalDiscountPrice": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "totalProductPrice": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          },
          "totalTaxAmount": {
            "anyOf": [
              {
                "$ref": "#/$defs/Double"
              },
              {
                "type": "integer"
              }
            ]
          },
          "totalTaxPercentage": {
            "type": "integer"
          },
          "unit": {
            "type": "object",
            "required": [
              "unitId",
              "unitSize",
              "unitSymbol"
            ],
            "properties": {
              "unitId": {
                "$ref": "#/$defs/ObjectId"
              },
              "unitName": {
                "type": "string"
              },
              "unitSize": {
                "type": "integer"
              },
              "unitSymbol": {
                "type": "string"
              }
            }
          },
          "unitMaximumPrice": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          }
        }
      }
    },
    "billRoundOff": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "billTaxSummary": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "taxAmount",
          "taxName",
          "taxPercentage"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "taxAmount": {
            "anyOf": [
              {
                "$ref": "#/$defs/Double"
              },
              {
                "type": "integer"
              }
            ]
          },
          "taxName": {
            "type": "string"
          },
          "taxPercentage": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "$ref": "#/$defs/Double"
              }
            ]
          }
        }
      }
    },
    "businessUnitAddress": {
      "anyOf": [
        {
          "type": "object",
          "required": [
            "_id",
            "addressLine1",
            "addressLine2",
            "city",
            "country",
            "pinCode",
            "state"
          ],
          "properties": {
            "_id": {
              "$ref": "#/$defs/ObjectId"
            },
            "addressLine1": {
              "type": "string"
            },
            "addressLine2": {
              "type": "string"
            },
            "city": {
              "type": "object",
              "required": [
                "cityId",
                "name"
              ],
              "properties": {
                "cityId": {
                  "$ref": "#/$defs/ObjectId"
                },
                "name": {
                  "type": "string"
                }
              }
            },
            "country": {
              "type": "object",
              "required": [
                "countryId",
                "name"
              ],
              "properties": {
                "countryId": {
                  "$ref": "#/$defs/ObjectId"
                },
                "name": {
                  "type": "string"
                }
              }
            },
            "pinCode": {
              "type": "string"
            },
            "state": {
              "type": "object",
              "required": [
                "name",
                "stateCode",
                "stateId"
              ],
              "properties": {
                "name": {
                  "type": "string"
                },
                "stateCode": {
                  "type": "string"
                },
                "stateId": {
                  "$ref": "#/$defs/ObjectId"
                }
              }
            }
          }
        },
        {
          "type": "null"
        }
      ]
    },
    "businessUnitBankDetails": {
      "type": "object",
      "required": [
        "accountName",
        "accountNumber",
        "bankIFSC",
        "bankName",
        "branchName"
      ],
      "properties": {
        "accountName": {
          "type": [
            "string",
            "null"
          ]
        },
        "accountNumber": {
          "type": [
            "string",
            "null"
          ]
        },
        "bankIFSC": {
          "type": [
            "string",
            "null"
          ]
        },
        "bankName": {
          "type": [
            "string",
            "null"
          ]
        },
        "branchName": {
          "type": [
            "string",
            "null"
          ]
        }
      }
    },
    "businessUnitCinNumber": {
      "type": "null"
    },
    "businessUnitEmail": {
      "type": [
        "string",
        "null"
      ]
    },
    "businessUnitGpayUPI_Id": {
      "type": "null"
    },
    "businessUnitGpayUPI_No": {
      "type": "null"
    },
    "businessUnitGSTNumber": {
      "type": [
        "string",
        "null"
      ]
    },
    "businessUnitId": {
      "anyOf": [
        {
          "$ref": "#/$defs/ObjectId"
        },
        {
          "type": "null"
        }
      ]
    },
    "businessUnitMobile": {
      "type": [
        "string",
        "null"
      ]
    },
    "businessUnitName": {
      "type": [
        "string",
        "null"
      ]
    },
    "businessUnitPanNumber": {
      "type": "null"
    },
    "calculatedLoyaltyPoint": {
      "type": [
        "integer",
        "null"
      ]
    },
    "createdAt": {
      "$ref": "#/$defs/Date"
    },
    "creditDays": {
      "type": "integer"
    },
    "creditNoteAmount": {
      "type": "null"
    },
    "creditNoteId": {
      "type": "null"
    },
    "currentCustomerMobile": {
      "type": [
        "null",
        "string"
      ]
    },
    "currentCustomerName": {
      "type": [
        "null",
        "string"
      ]
    },
    "currentCustomerType": {
      "type": [
        "null",
        "string"
      ]
    },
    "customer": {
      "anyOf": [
        {
          "type": "object",
          "required": [
            "_id",
            "billingAddress",
            "customerId",
            "customerName",
            "customerOfflineId",
            "customerType",
            "deliveryAddress",
            "displayName",
            "emailAddress",
            "GSTIN",
            "phoneNumber"
          ],
          "properties": {
            "_id": {
              "$ref": "#/$defs/ObjectId"
            },
            "billingAddress": {
              "anyOf": [
                {
                  "type": "null"
                },
                {
                  "type": "object",
                  "required": [
                    "_id",
                    "addressLine1",
                    "city",
                    "country",
                    "pinCode",
                    "state"
                  ],
                  "properties": {
                    "_id": {
                      "$ref": "#/$defs/ObjectId"
                    },
                    "addressLine1": {
                      "type": "string"
                    },
                    "addressLine2": {
                      "type": "string"
                    },
                    "attention": {
                      "type": "null"
                    },
                    "city": {
                      "type": "object",
                      "required": [
                        "cityId",
                        "name"
                      ],
                      "properties": {
                        "cityId": {
                          "anyOf": [
                            {
                              "$ref": "#/$defs/ObjectId"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        },
                        "name": {
                          "type": "string"
                        }
                      }
                    },
                    "country": {
                      "type": "object",
                      "required": [
                        "countryId",
                        "name"
                      ],
                      "properties": {
                        "countryCode": {
                          "type": [
                            "null",
                            "string"
                          ]
                        },
                        "countryId": {
                          "anyOf": [
                            {
                              "$ref": "#/$defs/ObjectId"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        },
                        "name": {
                          "type": "string"
                        }
                      }
                    },
                    "pinCode": {
                      "type": "string"
                    },
                    "state": {
                      "type": "object",
                      "required": [
                        "name",
                        "stateId"
                      ],
                      "properties": {
                        "name": {
                          "type": "string"
                        },
                        "stateCode": {
                          "type": "string"
                        },
                        "stateId": {
                          "anyOf": [
                            {
                              "$ref": "#/$defs/ObjectId"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            },
            "customerId": {
              "$ref": "#/$defs/ObjectId"
            },
            "customerName": {
              "type": "string"
            },
            "customerOfflineId": {
              "type": [
                "string",
                "null"
              ]
            },
            "customerType": {
              "type": "string"
            },
            "deliveryAddress": {
              "anyOf": [
                {
                  "type": "null"
                },
                {
                  "type": "object",
                  "required": [
                    "_id",
                    "addressLine1",
                    "city",
                    "country",
                    "pinCode",
                    "state"
                  ],
                  "properties": {
                    "_id": {
                      "$ref": "#/$defs/ObjectId"
                    },
                    "addressLine1": {
                      "type": "string"
                    },
                    "addressLine2": {
                      "type": "string"
                    },
                    "city": {
                      "type": "object",
                      "required": [
                        "cityId",
                        "name"
                      ],
                      "properties": {
                        "cityId": {
                          "anyOf": [
                            {
                              "$ref": "#/$defs/ObjectId"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        },
                        "name": {
                          "type": "string"
                        }
                      }
                    },
                    "country": {
                      "type": "object",
                      "required": [
                        "countryCode",
                        "countryId",
                        "name"
                      ],
                      "properties": {
                        "countryCode": {
                          "type": "null"
                        },
                        "countryId": {
                          "$ref": "#/$defs/ObjectId"
                        },
                        "name": {
                          "type": "string"
                        }
                      }
                    },
                    "mapLocation": {
                      "type": "object",
                      "required": [
                        "latitude",
                        "longitude"
                      ],
                      "properties": {
                        "latitude": {
                          "$ref": "#/$defs/Double"
                        },
                        "longitude": {
                          "$ref": "#/$defs/Double"
                        }
                      }
                    },
                    "pinCode": {
                      "type": "string"
                    },
                    "state": {
                      "type": "object",
                      "required": [
                        "name",
                        "stateCode",
                        "stateId"
                      ],
                      "properties": {
                        "name": {
                          "type": "string"
                        },
                        "stateCode": {
                          "type": "string"
                        },
                        "stateId": {
                          "anyOf": [
                            {
                              "$ref": "#/$defs/ObjectId"
                            },
                            {
                              "type": "null"
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              ]
            },
            "displayName": {
              "type": "string"
            },
            "emailAddress": {
              "type": [
                "null",
                "string"
              ]
            },
            "GSTIN": {
              "type": [
                "null",
                "string"
              ]
            },
            "phoneNumber": {
              "type": "string"
            }
          }
        },
        {
          "type": "null"
        }
      ]
    },
    "deliveryChallanNumber": {
      "type": "null"
    },
    "deliveryType": {
      "type": "string"
    },
    "displayedLoyaltyAmount": {
      "type": [
        "integer",
        "null"
      ]
    },
    "displayedLoyaltyPoint": {
      "type": [
        "integer",
        "null"
      ]
    },
    "displayedOutStandingAmount": {
      "type": [
        "integer",
        "null"
      ]
    },
    "displayedWalletAmount": {
      "type": [
        "integer",
        "null"
      ]
    },
    "distanceInKm": {
      "type": "null"
    },
    "eInvoice": {
      "type": "null"
    },
    "eInvoiceQR": {
      "type": [
        "null",
        "string"
      ]
    },
    "eInvoiceStatus": {
      "type": "null"
    },
    "eWayBill": {
      "type": "null"
    },
    "eWayBillStatus": {
      "type": "null"
    },
    "frightCharge": {
      "type": "integer"
    },
    "fromEstimateId": {
      "type": "null"
    },
    "fromProformaInvoiceId": {
      "type": "null"
    },
    "fromSalesOrderId": {
      "type": "null"
    },
    "invoiceDraftNumber": {
      "type": "string"
    },
    "invoiceNumber": {
      "type": [
        "null",
        "string"
      ]
    },
    "isArchived": {
      "type": "boolean"
    },
    "isCompletedFromOffline": {
      "type": "boolean"
    },
    "isCustomerBalancePaidByDirectCash": {
      "type": "boolean"
    },
    "isDaycloseCompleted": {
      "type": "boolean"
    },
    "isDeleted": {
      "type": "boolean"
    },
    "isEditable": {
      "type": "boolean"
    },
    "isVoid": {
      "type": "boolean"
    },
    "isWriteOff": {
      "type": "boolean"
    },
    "lastProcessedAt": {
      "$ref": "#/$defs/Date"
    },
    "loyaltyCalculationFlag": {
      "type": "boolean"
    },
    "loyaltyCurrencyValue": {
      "type": [
        "integer",
        "null"
      ]
    },
    "netPayableAmount": {
      "type": "integer"
    },
    "offlineBillNumber": {
      "type": [
        "string",
        "null"
      ]
    },
    "offlineId": {
      "type": "string"
    },
    "oldSaleBillNumber": {
      "type": [
        "null",
        "string"
      ]
    },
    "otherCharges": {
      "type": "integer"
    },
    "payments": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "cardNumber",
          "createdAt",
          "ledgerId",
          "ledgerTransactionId",
          "ledgerType",
          "paymentAmount",
          "paymentType",
          "posDeviceId",
          "posSubledgerId",
          "reference",
          "transferType",
          "upiId",
          "upiSubledgerId",
          "upiType"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "cardNumber": {
            "type": [
              "null",
              "string"
            ]
          },
          "createdAt": {
            "$ref": "#/$defs/Date"
          },
          "ledgerId": {
            "anyOf": [
              {
                "$ref": "#/$defs/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "ledgerTransactionId": {
            "anyOf": [
              {
                "$ref": "#/$defs/ObjectId"
              },
              {
                "type": "null"
              }
            ]
          },
          "ledgerType": {
            "type": [
              "string",
              "null"
            ]
          },
          "paymentAmount": {
            "type": "integer"
          },
          "paymentNote": {
            "type": [
              "null",
              "string"
            ]
          },
          "paymentOption": {
            "type": "string"
          },
          "paymentType": {
            "type": "string"
          },
          "posDeviceId": {
            "type": [
              "null",
              "string"
            ]
          },
          "posSubledgerId": {
            "anyOf": [
              {
                "type": "null"
              },
              {
                "$ref": "#/$defs/ObjectId"
              }
            ]
          },
          "reference": {
            "type": "null"
          },
          "totalPaidAmount": {
            "type": "integer"
          },
          "transferType": {
            "type": "null"
          },
          "upiId": {
            "type": "null"
          },
          "upiSubledgerId": {
            "type": "null"
          },
          "upiType": {
            "type": "null"
          }
        }
      }
    },
    "paymentStatus": {
      "type": "string"
    },
    "poDate": {
      "type": "null"
    },
    "podBillDate": {
      "$ref": "#/$defs/Date"
    },
    "podBillNumber": {
      "type": [
        "null",
        "string"
      ]
    },
    "podStatus": {
      "type": [
        "null",
        "string"
      ]
    },
    "podToBillAt": {
      "$ref": "#/$defs/Date"
    },
    "poNumber": {
      "type": "null"
    },
    "processStatus": {
      "type": "object",
      "required": [
        "createPaymentTransaction_Completed",
        "generateBillNumber_Completed"
      ],
      "properties": {
        "createPaymentTransaction_Completed": {
          "type": "boolean"
        },
        "generateBillNumber_Completed": {
          "type": "boolean"
        },
        "stockUpdate_Completed": {
          "type": "boolean"
        },
        "updatePaymentTransaction_Completed": {
          "type": "boolean"
        }
      }
    },
    "productSubTotal": {
      "anyOf": [
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "returnBills": {
      "type": "array",
      "items": {
        "type": "object",
        "required": [
          "_id",
          "returnBillPaid",
          "returnBillUnPaid",
          "returnBillValue"
        ],
        "properties": {
          "_id": {
            "$ref": "#/$defs/ObjectId"
          },
          "loyaltyReducedValue": {
            "type": "integer"
          },
          "retrunBillId": {
            "type": "null"
          },
          "returnBillId": {
            "$ref": "#/$defs/ObjectId"
          },
          "returnBillPaid": {
            "type": "integer"
          },
          "returnBillUnPaid": {
            "type": "integer"
          },
          "returnBillValue": {
            "type": "integer"
          }
        }
      }
    },
    "saleBillDate": {
      "$ref": "#/$defs/Date"
    },
    "saleBillNumber": {
      "type": [
        "string",
        "null"
      ]
    },
    "saleBillType": {
      "type": "string"
    },
    "saleIncharge": {
      "type": "object",
      "required": [
        "name"
      ],
      "properties": {
        "name": {
          "type": "string"
        },
        "userId": {
          "$ref": "#/$defs/ObjectId"
        }
      }
    },
    "selectedNotifications": {
      "anyOf": [
        {
          "type": "object",
          "required": [],
          "properties": {
            "sms": {
              "type": "array",
              "items": {
                "type": "string"
              }
            },
            "whatsapp": {
              "type": "array",
              "items": {
                "type": "string"
              }
            }
          }
        },
        {
          "type": "null"
        }
      ]
    },
    "sessionId": {
      "type": [
        "string",
        "null"
      ]
    },
    "status": {
      "type": "string"
    },
    "storeId": {
      "anyOf": [
        {
          "$ref": "#/$defs/ObjectId"
        },
        {
          "type": "null"
        }
      ]
    },
    "storeName": {
      "type": [
        "string",
        "null"
      ]
    },
    "tcsAmount": {
      "type": "null"
    },
    "tempLoyaltyPoint": {
      "type": [
        "null",
        "integer"
      ]
    },
    "tempLoyaltyPointBalance": {
      "type": [
        "null",
        "integer"
      ]
    },
    "termsConditions": {
      "type": "null"
    },
    "totalBillAmount": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "totalDiscountAmount": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "totalSavedAmount": {
      "anyOf": [
        {
          "type": "integer"
        },
        {
          "$ref": "#/$defs/Double"
        }
      ]
    },
    "totalTaxableAmount": {
      "anyOf": [
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "totalTaxAmount": {
      "anyOf": [
        {
          "$ref": "#/$defs/Double"
        },
        {
          "type": "integer"
        }
      ]
    },
    "updatedAt": {
      "$ref": "#/$defs/Date"
    },
    "UPIQR": {
      "type": [
        "null",
        "string"
      ]
    },
    "userFlag": {
      "type": "boolean"
    },
    "vehicleNumber": {
      "type": "null"
    },
    "walletCredit": {
      "type": "null"
    }
  },
  "$defs": {
    "ObjectId": {
      "type": "object",
      "properties": {
        "$oid": {
          "type": "string",
          "pattern": "^[0-9a-fA-F]{24}$"
        }
      },
      "required": [
        "$oid"
      ],
      "additionalProperties": false
    },
    "Double": {
      "oneOf": [
        {
          "type": "number"
        },
        {
          "type": "object",
          "properties": {
            "$numberDouble": {
              "enum": [
                "Infinity",
                "-Infinity",
                "NaN"
              ]
            }
          }
        }
      ]
    },
    "Date": {
      "type": "object",
      "properties": {
        "$date": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "$date"
      ],
      "additionalProperties": false
    }
  }
}

``` 
---

## Security & Multi-Tenant Enforcement

### Mandatory Fields in All Collections
- `org_id`: ObjectId (indexed) - Multi-tenant isolation
- `isDeleted`: Boolean (default: false) - Soft delete
- `createdAt`: ISODate
- `updatedAt`: ISODate

### Security Rules
1. All queries MUST include `org_id` filter
2. All queries MUST include `isDeleted: false` filter
3. No cross-tenant data access allowed
4. RBAC check required before query execution
5. Rate limiting per org_id + user_id

### Index Strategy
- Compound indexes include `org_id` as first field
- TTL indexes for time-based cleanup
- Text indexes for search fields
- Cover indexes for frequent queries