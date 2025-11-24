import express from 'express';
import {
    createDeliveryPartner,
    loginDeliveryPartner,
    updateLocation,
    getAssignedOrders,
    updateDeliveryStatus,
    getAllDeliveryPartners,
    assignOrder,
    getPartnerLocation,
    getPartnerProfile
} from '../controllers/deliveryPartnerController.js';
import authMiddleware from '../middleware/auth.js';

const deliveryPartnerRouter = express.Router();

// Public routes
deliveryPartnerRouter.post("/register", createDeliveryPartner);
deliveryPartnerRouter.post("/login", loginDeliveryPartner);

// Protected routes
deliveryPartnerRouter.post("/update-location", authMiddleware, updateLocation);
deliveryPartnerRouter.post("/assigned-orders", authMiddleware, getAssignedOrders);
deliveryPartnerRouter.post("/update-status", authMiddleware, updateDeliveryStatus);
deliveryPartnerRouter.post("/profile", authMiddleware, getPartnerProfile);

// Admin routes
deliveryPartnerRouter.get("/list", getAllDeliveryPartners);
deliveryPartnerRouter.post("/assign-order", assignOrder);
deliveryPartnerRouter.get("/location/:partnerId", getPartnerLocation);

export default deliveryPartnerRouter;