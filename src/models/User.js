const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
  },

  email: {
    type: Schema.Types.String,
    required: true,
  },

  password: {
    type: Schema.Types.String,
    required: true,
  },
  timezone:{
    type: Schema.Types.String,
    required: true,
  },
  isDeleted:{
    type:Schema.Types.Boolean,
    default: false,
  }

});

module.exports = mongoose.model("User",userSchema);


