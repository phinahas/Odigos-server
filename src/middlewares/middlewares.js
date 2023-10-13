exports.middleware1 = async (req,res,next)=>{
 
    try {

        
        // add your logic.
        next();
    } catch (error) {
        console.log(error);
        const err = new Error(error.message);
            next(err);
    }
    
}




