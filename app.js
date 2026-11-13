if (process.env.NODE_ENV!=="production"){
   require('dotenv').config();
}

const express=require ("express");
const app=express();
const path=require("path");
const mongoose=require("mongoose");
const methodOverride=require("method-override");
const listings=require("./models/listing.js");
const ejsMate=require("ejs-mate");
const nodemon=require("nodemon");
const wrapAsync=require("./utils/wrapAsync.js");
const expressError=require("./utils/expressError.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const cookieParser=require("cookie-parser");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const localStrategy=require("passport-local");
const User=require("./models/user.js");

const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/reviews.js");
const userRouter = require("./routes/user.js");

main()
 .then(()=>{
    console.log("connection successfull");
 })
 .catch((err)=>console.log(err));

 async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust")
 };

 app.set("views",path.join(__dirname,"views"));
 app.set("view engine","ejs");

 app.use(express.json());
 app.use(express.static(path.join(__dirname,"public")));
 app.use(express.urlencoded({extended:true}));
 app.use(methodOverride("_method"));
 app.engine("ejs",ejsMate);
 app.use(cookieParser());

 const sessionOptions={
   secret:"mysupersecretcode",
   resave:false,
   saveUninitialized:true,
   cookie:{
      expires:Date.now()+7*24*60*60*1000,
      maxAge:7*24*60*60*1000,
      httpOnly:true
   }
 };

 app.use(session(sessionOptions));
 app.use(flash());

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new localStrategy(User.authenticate()));

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 app.use((req,res,next)=>{
   res.locals.success=req.flash("success");
   res.locals.error=req.flash("error");
   res.locals.currUser=req.user;
   next();
 });

 app.get("/",(req,res)=>{
    res.send("working root");
 });

 app.use("/listing",listingRouter);
 app.use("/listing/:id/reviews" ,reviewRouter);
 app.use(("/"),userRouter);


 app.all("/{*splat}",(req,res,next)=>{
   next(new expressError(404,"Page Not Found!"));
 });

 app.use((err,req,res,next)=>{
   let{statusCode=500,message="Something Went Wrong!"}=err;
   res.status(statusCode).render("error.ejs",{err});
 });

 app.listen(1234,()=>{
    console.log("app is listening at port 1234");
 });