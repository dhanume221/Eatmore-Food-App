import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {type:String,required:true},
    items: { type: Array, required:true},
    amount: { type: Number, required: true},
    address:{type:Object,required:true},
    status: {type:String,default:"Food Processing"},
    date: {type:Date,default:Date.now()},
    payment:{type:Boolean,default:false},
    deliveryPartner: {type:String,default:null},
    trackingId: {type:String,unique:true},
    estimatedDeliveryTime: {type:String,default:null},
    currentLocation: {
        lat: {type:Number,default:null},
        lng: {type:Number,default:null}
    },
    deliveryStatus: {type:String,default:"Not Assigned", enum:["Not Assigned","Assigned","Picked Up","Out for Delivery","Delivered"]}
})

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;