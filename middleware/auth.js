module.exports.auth = (req,res,next)=>{
    const clientToken = req.cookies['admin']
    if(!clientToken){
       return res.render("admin/accessDenied")
    }
    else{
        next()
    }
}