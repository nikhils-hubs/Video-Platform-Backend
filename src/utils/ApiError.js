class ApiError extends Error{
    constructor(
        statuscode,
        message = "something went wrong",
        stack ="",
        errors =[],
    ){
        this.errors = errors;
        this.message = message,
        this.success = false;
        this.data = null;
        this.statuscode = statuscode;
         
        if(stack){
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}

