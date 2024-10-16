const mongoose = require('mongoose');

const subaccountSchema = new mongoose.Schema({
    business_name: { type: String, required: true },
    account_number: { type: String, required: true },
    percentage_charge: { type: Number, required: true },
    settlement_bank: { type: String, required: true },
    currency: { type: String, required: true },
    subaccount_code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Subaccount = mongoose.model('Subaccount', subaccountSchema);

module.exports = Subaccount;
