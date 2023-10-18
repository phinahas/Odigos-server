const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");

//Models
const User = require("../models/User");
const Category = require("../models/Category");
const Expense = require("../models/Expense");
const Label = require("../models/Label");


//helpers
const { jwt_secret } = require("../configurations/constants");
const { modelCategoryName } = require("../utils/commonFns");

exports.signup = async ({ email, name, password, timezone }) => {
  try {
    const userfromDb = await User.findOne({ email: email });
    if (userfromDb)
      return { statusCode: 409, message: "User with email already exists" };

    const hashedPassword = await bcrypt.hash(password, 12);

    const userObj = new User({
      email: email,
      name: name,
      password: hashedPassword,
      timezone: timezone,
    });
    await userObj.save();
    return { statusCode: 200, message: "User created" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.signin = async ({ email, password, timezone }) => {
  try {
    const userFromDb = await User.findOne({ email: email, isDeleted: false });
    if (!userFromDb) return { statusCode: 409, message: "User not found" };
    const passwordCheck = await bcrypt.compare(password, userFromDb.password);
    if (!passwordCheck) return { statusCode: 409, message: "Wrong password." };
    const token = jwt.sign(
      {
        email: userFromDb.email,
        userId: userFromDb._id.toString(),
      },
      jwt_secret,
      { expiresIn: "168h" }
    );
    userFromDb.timezone = timezone;
    await userFromDb.save();
    return {
      statusCode: 200,
      user: {
        email: userFromDb.email,
        _id: userFromDb._id,
        name: userFromDb.name,
        timezone:timezone
      },
      token: token,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.isUserVerification = async ({ userId }) => {
  try {
    const userFromDb = await User.findOne({ _id: userId, isDeleted: false });
    if (!userFromDb) return { statusCode: 401, message: "No user found" };
    return { statusCode: 200 };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getUser = async({userId, timezone})=> {
  try {
    const userFromDb = await User.findOne({ _id: userId, isDeleted: false });
    if (!userFromDb) return { statusCode: 401, message: "No user found" };
    userFromDb.timezone = timezone;
    await userFromDb.save();
    return { statusCode: 200,user: {
      email: userFromDb.email,
      _id: userFromDb._id,
      name: userFromDb.name,
      timezone:timezone
    }, };
  } catch (error) {
    console.log(error);
    throw error;
  }
};


exports.createCategory = async ({ category,userId }) => {
  try {
    let transformedCategory = modelCategoryName(category);

    const categoryFromDb = await Category.findOne({
      name: transformedCategory,
      user:userId
    });
    if (categoryFromDb)
      return { statusCode: 409, message: "Category already exist" };
    const categoryObj = new Category({
      name: transformedCategory,
      user:userId
    });
    await categoryObj.save();
    return { statusCode: 200, message: "Category created successfully" };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.addExpense = async ({
  userId,
  category,
  label,
  title,
  remarks,
  date,
  amount,
}) => {
  try {
    const userFromDb = await User.findById(userId, { timezone: 1 });
    const utcTimestamp = moment.tz(date, userFromDb.timezone).utc();
    const expObj = Expense({
      user: userId,
      category: category,
      label: label,
      title: title,
      remarks: remarks,
      amount: amount,
      date: utcTimestamp,
    });
    await expObj.save();
    return { statusCode: 200, message: "New entry created." };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getCategories = async({userId})=>{
  try {
 

    const categoriesFromDb = await Category.find({user:userId});
    if (categoriesFromDb.length === 0)
      return { statusCode: 204, message: "No data found" };
    return { statusCode: 200, categories:categoriesFromDb };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

exports.getLabels = async()=>{
  try {
    const labelsFromDb = await Label.find({});
    if (labelsFromDb.length === 0)
      return { statusCode: 204, message: "No data found" };
    return { statusCode: 200, labels:labelsFromDb };
  } catch (error) {
    console.log(error);
    throw error;
  }
}