const express=require("express");
const router=express.Router();
const listings=require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const expressError=require("../utils/expressError.js");
const{listingSchema,reviewSchema}=require("../schema.js");
const {isLoggedIn, isOwner}=require("../middleware.js");

const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});

const validateListing=(req,res,next)=>{
   let {error}=listingSchema.validate(req.body);
   if(error){
      throw new expressError(400,error);
   }
   else{
      next();
   }
 };


router.get("/",wrapAsync(async(req,res)=>{
   const allListing=await listings.find({});
   res.render("listing/index.ejs",{allListing});
 }));

 router.get("/new",isLoggedIn,(req,res)=>{
  res.render("listing/new.ejs");
 });

 router.post("/",validateListing,isLoggedIn,upload.single("listing[image]"),wrapAsync(async(req,res,next)=>{
  let url=req.file.path;
  let filename=req.file.filename;
   const newListing=new listings(req.body.listing);
   newListing.owner=req.user._id;
   newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listing");
 }));

 router.get("/:id",wrapAsync(async(req,res)=>{
   let {id}=req.params;
   const listing=await listings.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
   if(id==="fevicon.ico"||id==="undefined"){
    return res.status(204).end();
   }
   if(!listing){
    req.flash("error","listing you requested for does not exist!");
    return res.redirect("/listing");
   }
   res.render("listing/show.ejs",{listing});
 }));

 router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
   let {id}=req.params;
   const listing= await listings.findById(id);
   if(!listing){
    req.flash("error","listing you requested for does not exist!");
    return res.redirect("/listing");
   }
   
   let originalImageUrl=listing.image.url;
   originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250")
   res.render("listing/edit.ejs",{listing,originalImageUrl})
 }));

 router.put("/:id",isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(async(req,res)=>{
   let {id}=req.params;
  let listing=await listings.findByIdAndUpdate(id,{...req.body.listing});

  if(typeof req.file!=="undefined"){
     let url=req.file.path;
     let filename=req.file.filename;
     listing.image={url,filename};
     await listing.save();
  }
  req.flash("success","Listing Updated!");
  res.redirect(`/listing/${id}`);
 }));

 router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
   let {id}=req.params;
   await listings.findByIdAndDelete(id);
   req.flash("success","Listing Deleted!");
   res.redirect("/listing");
 }));

 module.exports=router;