import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema({
    name: {type:String,required:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    phone: {type:String,required:true},
    vehicleType: {type:String,required:true,enum:["Bike","Scooter","Car"]},
    vehicleNumber: {type:String,required:true},
    currentLocation: {
        lat: {type:Number,default:null},
        lng: {type:Number,default:null}
    },
    isAvailable: {type:Boolean,default:true},
    rating: {type:Number,default:5.0,min:0,max:5},
    totalDeliveries: {type:Number,default:0},
    status: {type:String,default:"Active",enum:["Active","Inactive","Suspended"]},
    date: {type:Date,default:Date.now()}
})

const deliveryPartnerModel = mongoose.models.deliveryagent || mongoose.model("deliveryagent", deliveryPartnerSchema);
export default deliveryPartnerModel;