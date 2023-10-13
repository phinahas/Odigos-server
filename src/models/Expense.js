const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  category: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Category",
  },
  label:{
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Label",
  },
  name: {
    type: Schema.Types.String,
    required: true,
  },
  remarks:{
    type: Schema.Types.String,
    required: true,
  },
  date:{
    type: Schema.Types.Date,
    required: true,
  },
  amount:{
    type: Schema.Types.Number,
    required: true
  }
});

module.exports = mongoose.model("Expense", expenseSchema);
