const express=require("express");
const router=express.Router({mergeParams:true});
const listings=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const expressError=require("../utils/expressError.js");
const{listingSchema,reviewSchema}=require("../schema.js");
const reviews=require("../models/review.js");
const listing=require("../routes/listing.js");
const {isLoggedIn,isReviewAuthor}=require("../middleware.js");

 const validateReview=(req,res,next)=>{
   let {error}=reviewSchema.validate(req.body);
   if(error){
      throw new expressError(400,error);
   }
   else{
      next();
   }
 };

 
// reviews
router.post(("/"),isLoggedIn,validateReview,wrapAsync(async(req,res)=>{
   const listing=await listings.findById(req.params.id);
   let newReview=new reviews(req.body.review);
   newReview.author=req.user._id;
   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save();
   
   req.flash("success","New Review Added!");
   res.redirect(`/listing/${listing._id}`);
}));

// delete reviews
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(async(req,res)=>{
   let {id,reviewId}=req.params;

   await listings.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
   await reviews.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
   res.redirect(`/listing/${id}`);
}));

module.exports=router;