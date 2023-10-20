//Model
const Label = require('../models/Label');

//helpers
const {modelCategoryName} = require('../utils/commonFns')

exports.createLabel = async ({label})=>{
    try {

        let transformedLabel = modelCategoryName(label);
        
        const labelFromDb = await Label.findOne({name:transformedLabel});
        if(labelFromDb) return {statusCode:409,message:"Label already exist"}
        const labelObj = new Label({
            name:transformedLabel
        })
        await labelObj.save();
        return {statusCode:200,message:"Label created successfully"}


        
    } catch (error) {
        console.log(error);
        throw error;
    }
}