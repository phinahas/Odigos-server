exports.modelCategoryName = (category)=>{
    try {

        const transformedString = category.trim().toLowerCase().replace(/\s+/g, '-');
        return transformedString
        
    } catch (error) {
        console.log(error);
        throw error;
    }
}