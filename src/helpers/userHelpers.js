const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment-timezone");
const ObjectId = require("mongoose").Types.ObjectId;

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
        timezone: timezone,
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

exports.getUser = async ({ userId, timezone }) => {
  try {
    const userFromDb = await User.findOne({ _id: userId, isDeleted: false });
    if (!userFromDb) return { statusCode: 401, message: "No user found" };
    userFromDb.timezone = timezone;
    await userFromDb.save();
    return {
      statusCode: 200,
      user: {
        email: userFromDb.email,
        _id: userFromDb._id,
        name: userFromDb.name,
        timezone: timezone,
      },
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.createCategory = async ({ category, userId }) => {
  try {
    let transformedCategory = modelCategoryName(category);

    const categoryFromDb = await Category.findOne({
      name: transformedCategory,
      user: userId,
    });
    if (categoryFromDb)
      return { statusCode: 409, message: "Category already exist" };
    const categoryObj = new Category({
      name: transformedCategory,
      user: userId,
    });
    let res = await categoryObj.save();

    return {
      statusCode: 200,
      message: "Category created successfully",
      newCategory: res,
    };
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
    let res = await expObj.save();
    console.log(res);
    let populatedRes = await Expense.aggregate([
      {
        $match: {
          _id: new ObjectId(res._id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "labels",
          localField: "label",
          foreignField: "_id",
          as: "labelData",
        },
      },
      {
        $unwind: "$userData",
      },

      {
        $project: {
          category: { $arrayElemAt: ["$categoryData.name", 0] },
          label: { $arrayElemAt: ["$labelData.name", 0] },
          title: "$title",
          amount: "$amount",
          date: "$date",
          remarks: "$remarks",
          timezone: "$userData.timezone",
        },
      },
    ]);
    return {
      statusCode: 200,
      message: "New entry created.",
      expense: populatedRes[0],
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getCategories = async ({ userId }) => {
  try {
    const categoriesFromDb = await Category.find({ user: userId });
    if (categoriesFromDb.length === 0)
      return { statusCode: 204, message: "No data found" };
    return { statusCode: 200, categories: categoriesFromDb };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getLabels = async () => {
  try {
    const labelsFromDb = await Label.find({});
    if (labelsFromDb.length === 0)
      return { statusCode: 204, message: "No data found" };
    return { statusCode: 200, labels: labelsFromDb };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getExpense = async ({ userId,customDate, filter }) => {
  try {
    if (filter != "today" && filter != "custom")
      return {
        statusCode: 409,
        message: "Invalid filter condition: " + filter,
      };
    const userFromDb = await User.findById(userId, { timezone: 1 });
    const timezone = userFromDb.timezone;

    let qry = { user: new ObjectId(userId) };
    let prevDayQry = { user: new ObjectId(userId) };
    let monthQry = { user: new ObjectId(userId) };
    if (filter == "today") {
      // Determine the user's chosen day in their timezone
      const userChosenDay = moment.tz(timezone).startOf("day");

      // Convert the user's chosen day to UTC
      const userChosenDayUTC = userChosenDay.clone().utc();

      // Calculate the start and end of the day in UTC
      const startOfDayUTC = userChosenDayUTC.toDate();
      const endOfDayUTC = userChosenDayUTC.clone().add(1, "days").toDate();

      // get expense of the previous day
      const startOfPrevDay = userChosenDayUTC.clone().subtract(1,"days").toDate();
      const endOfPrevDay =  userChosenDayUTC.toDate();
      
     


      // to get the total expense of that month 
      const userChosenMonth = moment.tz(timezone).startOf("month");
      const userChosenMonthUTC = userChosenMonth.clone().utc();
      const startOfMonth = userChosenMonthUTC.toDate();
      
       

      qry["date"] = { $gte: startOfDayUTC, $lt: endOfDayUTC };
      prevDayQry["date"] = { $gte: startOfPrevDay, $lt: endOfPrevDay };
      monthQry["date"] ={ $gte: startOfMonth, $lt: endOfDayUTC };
      

    }
    if(filter == "custom"){
      if(!customDate)
      return {
        statusCode: 409,
        message: "Invalid date: " + customDate,
      };

      const chosenDate = moment.tz(customDate, timezone);
      const userChosenDayUTC = chosenDate.clone().utc();

      // Calculate the start and end of the day in UTC
      const startOfDayUTC = userChosenDayUTC.toDate();
      const endOfDayUTC = userChosenDayUTC.clone().add(1, "days").toDate();

      qry["date"] = { $gte: startOfDayUTC, $lt: endOfDayUTC };
    }

    const expensesFromDb = await Expense.aggregate([
      {
        $match: qry,
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: "labels",
          localField: "label",
          foreignField: "_id",
          as: "labelData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $project: {
          category: { $arrayElemAt: ["$categoryData.name", 0] },
          label: { $arrayElemAt: ["$labelData.name", 0] },
          title: "$title",
          amount: "$amount",
          date: "$date",
          remarks: "$remarks",
          timezone: "$userData.timezone",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          expenses: { $push: "$$ROOT" }, // This preserves the individual expenses
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: "$totalAmount",
          expenses: 1,
        },
      },
    ]);

    let prevExpensesFromDb = [];
    let monthExpensesFromDb = [];
    if(filter == "today"){
         prevExpensesFromDb = await Expense.aggregate([

          {
            $match: prevDayQry,
          },
          {
            $group:{
              _id:null,
              previousDayExpense:{$sum:'$amount'}
            }
          },
          {
            $project:{
              _id:0,
              previousDayExpense:1
            }
          }
    ])
    monthExpensesFromDb = await Expense.aggregate([

      {
        $match: monthQry,
      },
      {
        $group:{
          _id:null,
          monthlyExpense:{$sum:'$amount'}
        }
      },
      {
        $project:{
          _id:0,
          monthlyExpense:1
        }
      }
])

    }

    // if (expensesFromDb.length === 0)
    //   return { statusCode: 204, message: "No data found" };

    return {
      statusCode: 200,
      expenses:expensesFromDb.length === 0 ?[]: expensesFromDb[0].expenses,
      totalAmount:expensesFromDb.length === 0 ? 0: expensesFromDb[0].totalAmount,
      previousDayTotalAmount:prevExpensesFromDb.length == 0 ? 0:prevExpensesFromDb[0].previousDayExpense,
      thisMonthTotalAmount:monthExpensesFromDb.length == 0 ? 0:monthExpensesFromDb[0].monthlyExpense
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.analysisTheExpenseBy = async ({
  startDate,
  endDate,
  criteria,
  userId,
}) => {
  try {
    const userFromDb = await User.findById(userId, { timezone: 1 });
    let aggregateArry = [
      {
        $match: {
          user: new ObjectId(userId),
          date: {
            $gte: new Date(startDate),
            $lt: new Date(endDate),
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
    ];

    if (criteria == "date") {
      aggregateArry.push({
        $project: {
          dateToSort: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: "$userData.timezone",
            },
          },
          date: 1,
          category: 1,
          label: 1,
          title: 1,
          amount: 1,
          remarks: 1,
          timezone: "$userData.timezone",
        },
      });
      aggregateArry.push(
        {
          $group: {
            _id: "$dateToSort",
            //expenses: { $push: '$$ROOT' }, not needed now
            totalAmount: { $sum: "$amount" },
          },
        },
       
      );
      aggregateArry.push({
        $sort: { _id: -1 }, // Sort by date in descending order
      });
      aggregateArry.push(
        {
          $project: {
            _id: 0,
            day: "$_id",
            totalAmount: 1,
          },
        }
      )
    }
    if(criteria == "category"){

      var categoryLookup = {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryData",
      };

      var catlookup = {$lookup:categoryLookup};
      aggregateArry.push(catlookup);
      
      aggregateArry.push({$project: {
        day: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$date",
            timezone: "$userData.timezone",
          },
        },
        date: 1,
        category: { $arrayElemAt: ["$categoryData.name", 0] },
        amount: 1,}})
        aggregateArry.push(
          {
            $group: {
              _id: "$category",
              //expenses: { $push: '$$ROOT' }, not needed now
              totalAmount: { $sum: "$amount" },
            },
          },
         
        );
        aggregateArry.push(
          {
            $sort: { day: -1 },
          },
         
        );
        aggregateArry.push(
          {
            $project: {
              _id: 0,
              day:1,
              category:'$_id',
              totalAmount: 1,
            },
          }
        )
    }

   

    const expensesFromDb = await Expense.aggregate(aggregateArry);

    if(expensesFromDb.length == 0) return{statusCode:204,message:"No data"}

    return { statusCode: 200, finalArray: expensesFromDb };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.searchExpense = async ({ userId, keyword }) => {
  try {
    
    const expenses = await Expense.find({
      user: userId,
      $or: [
        { title: { $regex: new RegExp(keyword, 'i') } },
        { remarks: { $regex: new RegExp(keyword, 'i') } },
        {
          'category': {
            $in: await Category.find({ user: userId, $or: [{ name: { $regex: new RegExp(keyword, 'i') } }] }).distinct('_id')
          }
        },
      ],
    }).populate('category', 'name');

    // Extract only the name from the populated category field
    const modifiedExpenses = expenses.map(expense => ({
      ...expense.toObject(),
      category: expense.category.name,
    }));

   
    return { statusCode: 200, expense: modifiedExpenses };
  } catch (error) {
    console.log(error);
    throw error;
  }
};


