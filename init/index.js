const mongoose=require("mongoose");
const initData=require("./data.js");
const listing=require("../models/listing.js");

main()
 .then(()=>{
    console.log("connection successfull");
 })
 .catch((err)=>console.log(err));

 async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderLust")
 };

 const initDB=async()=>{
    await listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({
      ...obj,owner:"6a5b475a3bb4512bfe27c018"
    }));
    await listing.insertMany(initData.data);
    console.log("data was initialized");
 };

 initDB();

