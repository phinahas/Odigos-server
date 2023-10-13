exports.tokenTest = async (req,res,next)=>{
 
    try {

        console.log("Base url:", req.baseUrl);
        console.log("Orginal url:",req.originalUrl);

        // add your logic.
        next();
        
    } catch (error) {
        console.log(error);
        const err = new Error(error.message);
            next(err);
    }
    
}

