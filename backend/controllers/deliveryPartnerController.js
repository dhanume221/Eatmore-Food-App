import deliveryPartnerModel from "../models/deliveryPartnerModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";
import orderModel from "../models/orderModel.js";

// Create delivery partner
const createDeliveryPartner = async (req, res) => {
    try {
        const { name, email, password, phone, vehicleType, vehicleNumber } = req.body;

        // Validation
        if (!name || !email || !password || !phone || !vehicleType || !vehicleNumber) {
            return res.json({ success: false, message: "All fields are required" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        // Check if email already exists
        const existingPartner = await deliveryPartnerModel.findOne({ email });
        if (existingPartner) {
            return res.json({ success: false, message: "Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const deliveryPartner = new deliveryPartnerModel({
            name,
            email,
            password: hashedPassword,
            phone,
            vehicleType,
            vehicleNumber
        });

        const partner = await deliveryPartner.save();
        const token = createToken(partner._id);

        res.json({ success: true, token, message: "Delivery partner created successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error creating delivery partner" });
    }
}

// Login delivery partner
const loginDeliveryPartner = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "Email and password are required" });
        }

        const partner = await deliveryPartnerModel.findOne({ email });
        if (!partner) {
            return res.json({ success: false, message: "Partner not found" });
        }

        const isMatch = await bcrypt.compare(password, partner.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(partner._id);
        res.json({ success: true, token, message: "Login successful" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error logging in" });
    }
}

// Update location
const updateLocation = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const partnerId = req.body.partnerId;

        await deliveryPartnerModel.findByIdAndUpdate(partnerId, {
            currentLocation: { lat, lng }
        });

        res.json({ success: true, message: "Location updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating location" });
    }
}

// Get assigned orders
const getAssignedOrders = async (req, res) => {
    try {
        const partnerId = req.body.partnerId;
        console.log('Fetching orders for partnerId:', partnerId);

        const orders = await orderModel.find({
            deliveryPartner: partnerId,
            deliveryStatus: { $in: ["Assigned", "Picked Up", "Out for Delivery"] }
        });

        console.log('Found orders:', orders.length);

        res.json({ success: true, data: orders });

    } catch (error) {
        console.log('Error in getAssignedOrders:', error);
        res.json({ success: false, message: "Error fetching orders" });
    }
}

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        await orderModel.findByIdAndUpdate(orderId, {
            deliveryStatus: status,
            status: status === "Delivered" ? "Delivered" : "Out for Delivery"
        });

        if (status === "Delivered") {
            // Update delivery partner stats and make available again
            const order = await orderModel.findById(orderId);
            await deliveryPartnerModel.findByIdAndUpdate(order.deliveryPartner, {
                $inc: { totalDeliveries: 1 },
                isAvailable: true
            });
        }

        res.json({ success: true, message: "Status updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating status" });
    }
}

// Get all delivery partners (for admin)
const getAllDeliveryPartners = async (req, res) => {
    try {
        const partners = await deliveryPartnerModel.find({});
        res.json({ success: true, data: partners });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching partners" });
    }
}

// Get delivery partner profile
const getPartnerProfile = async (req, res) => {
    try {
        const partnerId = req.body.partnerId;
        console.log('Fetching profile for partnerId:', partnerId);

        const partner = await deliveryPartnerModel.findById(partnerId);

        if (!partner) {
            console.log('Partner not found for ID:', partnerId);
            return res.json({ success: false, message: "Partner not found" });
        }

        console.log('Partner found:', partner.name);

        res.json({
            success: true,
            data: {
                name: partner.name,
                email: partner.email,
                phone: partner.phone,
                vehicleType: partner.vehicleType,
                vehicleNumber: partner.vehicleNumber,
                rating: partner.rating,
                totalDeliveries: partner.totalDeliveries,
                status: partner.status,
                isAvailable: partner.isAvailable
            }
        });
    } catch (error) {
        console.log('Error in getPartnerProfile:', error);
        res.json({ success: false, message: "Error fetching profile" });
    }
}

// Assign order to delivery partner
const assignOrder = async (req, res) => {
    try {
        const { orderId, partnerId } = req.body;

        // Generate tracking ID
        const trackingId = "TRK" + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

        await orderModel.findByIdAndUpdate(orderId, {
            deliveryPartner: partnerId,
            deliveryStatus: "Assigned",
            trackingId: trackingId,
            estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString() // 45 minutes from now
        });

        // Update partner availability
        await deliveryPartnerModel.findByIdAndUpdate(partnerId, { isAvailable: false });

        res.json({ success: true, message: "Order assigned successfully", trackingId });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error assigning order" });
    }
}

// Get delivery partner location
const getPartnerLocation = async (req, res) => {
    try {
        const partnerId = req.params.partnerId;
        const partner = await deliveryPartnerModel.findById(partnerId);

        if (!partner) {
            return res.json({ success: false, message: "Partner not found" });
        }

        res.json({ success: true, location: partner.currentLocation });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching location" });
    }
}

// JWT token creation
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

export {
    createDeliveryPartner,
    loginDeliveryPartner,
    updateLocation,
    getAssignedOrders,
    updateDeliveryStatus,
    getAllDeliveryPartners,
    assignOrder,
    getPartnerLocation,
    getPartnerProfile
}