import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Loader } from '@googlemaps/js-api-loader';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
    const { url } = useContext(StoreContext);
    const [partnerData, setPartnerData] = useState(null);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const watchIdRef = useRef(null);

    useEffect(() => {
        fetchPartnerData();
        getCurrentLocation();
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (partnerData && currentLocation) {
            initializeMap();
        }
    }, [partnerData, currentLocation]);

    const fetchPartnerData = async () => {
        try {
            const token = localStorage.getItem('partnerToken');
            if (!token) {
                console.log('No token found, redirecting to login');
                window.location.href = '/delivery-login';
                return;
            }

            console.log('Fetching data with token:', token);

            // Test token validity first
            try {
                const testResponse = await axios.post(`${url}/api/delivery-partner/assigned-orders`, {}, {
                    headers: { token }
                });
                console.log('Token test response:', testResponse.data);
            } catch (tokenError) {
                console.error('Token validation failed:', tokenError.response?.data || tokenError.message);
                localStorage.removeItem('partnerToken');
                window.location.href = '/delivery-login';
                return;
            }

            // Fetch assigned orders
            const ordersResponse = await axios.post(`${url}/api/delivery-partner/assigned-orders`, {}, {
                headers: { token }
            });

            console.log('Orders response:', ordersResponse.data);

            if (ordersResponse.data.success) {
                setAssignedOrders(ordersResponse.data.data);
            } else {
                console.error('Failed to fetch orders:', ordersResponse.data.message);
            }

            // Fetch partner profile
            const profileResponse = await axios.post(`${url}/api/delivery-partner/profile`, {}, {
                headers: { token }
            });

            console.log('Profile response:', profileResponse.data);

            if (profileResponse.data.success) {
                setPartnerData(profileResponse.data.data);
            } else {
                console.error('Failed to fetch profile:', profileResponse.data.message);
                // Set default data if profile fetch fails
                setPartnerData({
                    name: data.name,
                    email: "partner@example.com",
                    vehicleType: "Bike",
                    vehicleNumber: "N/A",
                    rating: 5.0,
                    totalDeliveries: 0
                });
            }

        } catch (error) {
            console.error('Error fetching partner data:', error);
            console.error('Error details:', error.response?.data || error.message);
            toast.error('Failed to load dashboard data');
            // Set fallback data
            setPartnerData({
                name: "Delivery Partner",
                email: "partner@example.com",
                vehicleType: "Bike",
                vehicleNumber: "N/A",
                rating: 5.0,
                totalDeliveries: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(location);
                    updateLocationOnServer(location);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Unable to get your location');
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            toast.error('Geolocation is not supported by this browser');
        }
    };

    const updateLocationOnServer = async (location) => {
        try {
            const token = localStorage.getItem('partnerToken');
            await axios.post(`${url}/api/delivery-partner/update-location`, {
                lat: location.lat,
                lng: location.lng
            }, {
                headers: { token }
            });
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const initializeMap = async () => {
        if (!currentLocation) return;

        try {
            const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: 'weekly',
                libraries: ['places']
            });

            const { Map } = await loader.importLibrary('maps');
            const { Marker } = await loader.importLibrary('marker');

            mapInstance.current = new Map(mapRef.current, {
                center: currentLocation,
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
            });

            markerRef.current = new Marker({
                position: currentLocation,
                map: mapInstance.current,
                title: 'Your Location',
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="white" stroke-width="3"/>
                            <path d="M20 8 L28 16 L20 24 L12 16 Z" fill="white"/>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(40, 40)
                }
            });

        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    const updateDeliveryStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('partnerToken');
            const response = await axios.post(`${url}/api/delivery-partner/update-status`, {
                orderId,
                status
            }, {
                headers: { token }
            });

            if (response.data.success) {
                toast.success(`Order status updated to ${status}`);
                fetchPartnerData(); // Refresh orders
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const logout = () => {
        localStorage.removeItem('partnerToken');
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="delivery-dashboard">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="delivery-dashboard">
            <div className="dashboard-header">
                <h1>Delivery Partner Dashboard</h1>
                <button onClick={logout} className="logout-btn">Logout</button>
            </div>

            <div className="dashboard-content">
                <div className="partner-info">
                    <div className="info-card">
                        <h3>Profile Information</h3>
                        <div className="profile-details">
                            <p><strong>Name:</strong> {partnerData?.name}</p>
                            <p><strong>Email:</strong> {partnerData?.email}</p>
                            <p><strong>Vehicle:</strong> {partnerData?.vehicleType} ({partnerData?.vehicleNumber})</p>
                            <p><strong>Rating:</strong> ⭐ {partnerData?.rating}/5</p>
                            <p><strong>Total Deliveries:</strong> {partnerData?.totalDeliveries}</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Current Location</h3>
                        <div ref={mapRef} className="location-map"></div>
                        {currentLocation && (
                            <p className="location-coords">
                                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="assigned-orders">
                    <h3>Assigned Orders ({assignedOrders.length})</h3>
                    <div className="orders-list">
                        {assignedOrders.length === 0 ? (
                            <p className="no-orders">No orders assigned yet</p>
                        ) : (
                            assignedOrders.map((order) => (
                                <div key={order._id} className="order-card">
                                    <div className="order-header">
                                        <h4>Order #{order._id.slice(-8)}</h4>
                                        <span className={`status ${order.deliveryStatus?.toLowerCase().replace(' ', '-')}`}>
                                            {order.deliveryStatus || 'Assigned'}
                                        </span>
                                    </div>

                                    <div className="order-details">
                                        <div className="customer-info">
                                            <p><strong>Customer:</strong> {order.address?.firstName} {order.address?.lastName}</p>
                                            <p><strong>Phone:</strong> {order.address?.phone}</p>
                                            <p><strong>Address:</strong> {order.address?.street}, {order.address?.city}</p>
                                        </div>

                                        <div className="order-items">
                                            <p><strong>Items:</strong></p>
                                            <ul>
                                                {order.items?.map((item, index) => (
                                                    <li key={index}>{item.name} x {item.quantity}</li>
                                                ))}
                                            </ul>
                                            <p><strong>Total:</strong> ₹{order.amount}</p>
                                        </div>
                                    </div>

                                    <div className="order-actions">
                                        {order.deliveryStatus === 'Assigned' && (
                                            <button
                                                onClick={() => updateDeliveryStatus(order._id, 'Picked Up')}
                                                className="status-btn pickup"
                                            >
                                                Mark as Picked Up
                                            </button>
                                        )}
                                        {order.deliveryStatus === 'Picked Up' && (
                                            <button
                                                onClick={() => updateDeliveryStatus(order._id, 'Out for Delivery')}
                                                className="status-btn out-for-delivery"
                                            >
                                                Out for Delivery
                                            </button>
                                        )}
                                        {order.deliveryStatus === 'Out for Delivery' && (
                                            <button
                                                onClick={() => updateDeliveryStatus(order._id, 'Delivered')}
                                                className="status-btn delivered"
                                            >
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;