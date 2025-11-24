import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { Loader } from '@googlemaps/js-api-loader';
import './TrackOrder.css';

const TrackOrder = () => {
    const { orderId } = useParams();
    const { url } = useContext(StoreContext);
    const [orderData, setOrderData] = useState(null);
    const [deliveryPartner, setDeliveryPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markerRef = useRef(null);
    const directionsRendererRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (orderData && deliveryPartner) {
            initializeMap();
        }
    }, [orderData, deliveryPartner]);

    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(`${url}/api/order/track/${orderId}`);
            const data = await response.json();

            if (data.success) {
                setOrderData(data.order);
                setDeliveryPartner(data.deliveryPartner);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const initializeMap = async () => {
        if (!orderData || !deliveryPartner) return;

        try {
            const loader = new Loader({
                apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
                version: 'weekly',
                libraries: ['places', 'geometry']
            });

            const { Map } = await loader.importLibrary('maps');
            const { Marker } = await loader.importLibrary('marker');
            const { DirectionsService, DirectionsRenderer } = await loader.importLibrary('routes');

            // Initialize map
            mapInstance.current = new Map(mapRef.current, {
                center: {
                    lat: deliveryPartner.currentLocation?.lat || 12.9716,
                    lng: deliveryPartner.currentLocation?.lng || 77.5946
                },
                zoom: 15,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false
            });

            // Add delivery partner marker
            if (deliveryPartner.currentLocation) {
                markerRef.current = new Marker({
                    position: {
                        lat: deliveryPartner.currentLocation.lat,
                        lng: deliveryPartner.currentLocation.lng
                    },
                    map: mapInstance.current,
                    title: `Delivery Partner: ${deliveryPartner.name}`,
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
            }

            // Add delivery address marker
            if (orderData.address) {
                new Marker({
                    position: {
                        lat: parseFloat(orderData.address.lat) || 12.9716,
                        lng: parseFloat(orderData.address.lng) || 77.5946
                    },
                    map: mapInstance.current,
                    title: 'Delivery Address',
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="white" stroke-width="3"/>
                                <path d="M20 8 L28 16 L20 24 L12 16 Z" fill="white"/>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });
            }

            // Draw route if both locations are available
            if (deliveryPartner.currentLocation && orderData.address) {
                const directionsService = new DirectionsService();
                directionsRendererRef.current = new DirectionsRenderer({
                    map: mapInstance.current,
                    suppressMarkers: true,
                    polylineOptions: {
                        strokeColor: '#FF6B35',
                        strokeWeight: 4
                    }
                });

                const request = {
                    origin: {
                        lat: deliveryPartner.currentLocation.lat,
                        lng: deliveryPartner.currentLocation.lng
                    },
                    destination: {
                        lat: parseFloat(orderData.address.lat) || 12.9716,
                        lng: parseFloat(orderData.address.lng) || 77.5946
                    },
                    travelMode: google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        directionsRendererRef.current.setDirections(result);
                    }
                });
            }

        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    const updateLocation = async () => {
        if (deliveryPartner && deliveryPartner.currentLocation) {
            try {
                const response = await fetch(`${url}/api/delivery-partner/location/${deliveryPartner._id}`);
                const data = await response.json();

                if (data.success && data.location) {
                    const newLocation = data.location;

                    // Update marker position
                    if (markerRef.current) {
                        markerRef.current.setPosition(newLocation);
                    }

                    // Update map center
                    if (mapInstance.current) {
                        mapInstance.current.setCenter(newLocation);
                    }

                    setDeliveryPartner(prev => ({
                        ...prev,
                        currentLocation: newLocation
                    }));
                }
            } catch (error) {
                console.error('Error updating location:', error);
            }
        }
    };

    useEffect(() => {
        if (orderData && deliveryPartner) {
            const interval = setInterval(updateLocation, 10000); // Update every 10 seconds
            return () => clearInterval(interval);
        }
    }, [orderData, deliveryPartner]);

    if (loading) {
        return (
            <div className="track-order">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="track-order">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/myorders')}>Back to Orders</button>
                </div>
            </div>
        );
    }

    return (
        <div className="track-order">
            <div className="track-header">
                <h1>Track Your Order</h1>
                <p>Order ID: {orderData?.trackingId || orderId}</p>
            </div>

            <div className="track-content">
                <div className="order-info">
                    <div className="info-card">
                        <h3>Order Status</h3>
                        <div className={`status ${orderData?.deliveryStatus?.toLowerCase().replace(' ', '-')}`}>
                            {orderData?.deliveryStatus || 'Processing'}
                        </div>
                        <p>Estimated Delivery: {orderData?.estimatedDeliveryTime ?
                            new Date(orderData.estimatedDeliveryTime).toLocaleTimeString() : 'N/A'}</p>
                    </div>

                    {deliveryPartner && (
                        <div className="info-card">
                            <h3>Delivery Partner</h3>
                            <div className="partner-info">
                                <p><strong>Name:</strong> {deliveryPartner.name}</p>
                                <p><strong>Phone:</strong> {deliveryPartner.phone}</p>
                                <p><strong>Vehicle:</strong> {deliveryPartner.vehicleType} ({deliveryPartner.vehicleNumber})</p>
                                <p><strong>Rating:</strong> ⭐ {deliveryPartner.rating}/5</p>
                            </div>
                        </div>
                    )}

                    <div className="info-card">
                        <h3>Delivery Address</h3>
                        <p>{orderData?.address?.street}</p>
                        <p>{orderData?.address?.city}, {orderData?.address?.state} {orderData?.address?.zipcode}</p>
                        <p>{orderData?.address?.country}</p>
                    </div>
                </div>

                <div className="map-container">
                    <div ref={mapRef} className="map"></div>
                </div>
            </div>

            <div className="track-actions">
                <button onClick={() => navigate('/myorders')} className="back-btn">
                    Back to Orders
                </button>
                <button onClick={fetchOrderDetails} className="refresh-btn">
                    Refresh Status
                </button>
            </div>
        </div>
    );
};

export default TrackOrder;