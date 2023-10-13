const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const labelSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
  },

});

module.exports = mongoose.model("Label",labelSchema);


