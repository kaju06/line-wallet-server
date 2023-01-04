const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "User",
    },
    account_id: {
      type: String,
      required: true,
    },
    routing: {
      type: String,
      required: true,
    },
    customer_link: {
      type: String,
    },
    dwolla_link: {
      type: String,
    },
    bank_link: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
