import React, { useEffect, useState } from 'react'
import './Orders.css'
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Order = ({ url, token }) => {

  const [orders, setOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const navigate = useNavigate();

  const fetchAllOrders = async () => {
    const response = await axios.get(`${url}/api/order/list`, { headers: { token } })
    if (response.data.success) {
      setOrders(response.data.data.reverse());
    }
    else {
      toast.error("Error")
    }
  }

  const fetchDeliveryPartners = async () => {
    try {
      const response = await axios.get(`${url}/api/delivery-partner/list`, { headers: { token } });
      if (response.data.success) {
        setDeliveryPartners(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching delivery partners:", error);
    }
  }

  const statusHandler = async (event, orderId) => {
    console.log(event, orderId);
    const response = await axios.post(`${url}/api/order/status`, {
      orderId,
      status: event.target.value
    }, { headers: { token } })
    if (response.data.success) {
      await fetchAllOrders();
    }
  }

  const assignDeliveryPartner = async (orderId, partnerId) => {
    try {
      const response = await axios.post(`${url}/api/delivery-partner/assign-order`, {
        orderId,
        partnerId
      }, { headers: { token } });
      if (response.data.success) {
        toast.success("Delivery partner assigned successfully");
        await fetchAllOrders();
      } else {
        toast.error("Failed to assign delivery partner");
      }
    } catch (error) {
      toast.error("Error assigning delivery partner");
    }
  }


  useEffect(() => {
    fetchAllOrders();
    fetchDeliveryPartners();
  }, [])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => (
          <div key={index} className='order-item'>
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className='order-item-food'>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity
                  }
                  else {
                    return item.name + " x " + item.quantity + ", "
                  }
                })}
              </p>
              <p className='order-item-name'>{order.address.firstName + " " + order.address.lastName}</p>
              <div className='order-item-address'>
                <p>{order.address.street + ","}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
              </div>
              <p className='order-item-phone'>{order.address.phone}</p>
            </div>
            <p>Items : {order.items.length}</p>
            <p>{currency}{order.amount}</p>
            <div className="order-actions">
              {order.deliveryStatus && (
                <p className="delivery-status">Delivery: {order.deliveryStatus}</p>
              )}
              {order.trackingId && (
                <p className="tracking-id">Tracking: {order.trackingId}</p>
              )}
              <select onChange={(e) => statusHandler(e, order._id)} value={order.status} name="" id="">
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
              {!order.deliveryPartner && (
                <select
                  onChange={(e) => assignDeliveryPartner(order._id, e.target.value)}
                  defaultValue=""
                  className="partner-select"
                >
                  <option value="" disabled>Assign Partner</option>
                  {deliveryPartners.filter(partner => partner.isAvailable).map(partner => (
                    <option key={partner._id} value={partner._id}>
                      {partner.name} ({partner.vehicleType})
                    </option>
                  ))}
                </select>
              )}
              {order.deliveryPartner && (
                <p className="assigned-partner">
                  Partner: {deliveryPartners.find(p => p._id === order.deliveryPartner)?.name || 'Assigned'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Order
