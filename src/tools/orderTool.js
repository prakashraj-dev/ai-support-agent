import { DynamicTool } from 'langchain/tools';

const mockOrders = {
  'ORD-1001': {
    status: 'Delivered',
    item: 'Wireless Headphones',
    date: '2024-12-10',
    deliveredOn: '2024-12-14',
    courier: 'Delhivery',
    tracking: 'DL789456123',
  },
  'ORD-1002': {
    status: 'In Transit',
    item: 'Mechanical Keyboard',
    date: '2024-12-12',
    estimatedDelivery: '2024-12-17',
    courier: 'BlueDart',
    tracking: 'BD456123789',
  },
  'ORD-1003': {
    status: 'Processing',
    item: 'USB-C Hub',
    date: '2024-12-14',
    estimatedDelivery: '2024-12-20',
    courier: 'FedEx',
    tracking: 'Not yet assigned',
  },
  'ORD-1004': {
    status: 'Cancelled',
    item: 'Laptop Stand',
    date: '2024-12-08',
    refundStatus: 'Refund processed on 2024-12-10',
  },
};

export const orderTool = new DynamicTool({
  name: 'get_order_status',
  description:
    'Use this when the user asks about a specific order status or tracking. Input must be the order ID in format ORD-XXXX.',
  func: async (orderId) => {
    const cleanId = orderId.trim().toUpperCase();
    const order = mockOrders[cleanId];

    if (!order) {
      return `Order ${cleanId} not found. Please check your order ID — it should look like ORD-1001. You can find it in your confirmation email.`;
    }

    let response = `Order ${cleanId} — ${order.item}\nStatus: ${order.status}\nOrder Date: ${order.date}`;
    if (order.deliveredOn) response += `\nDelivered On: ${order.deliveredOn}`;
    if (order.estimatedDelivery) response += `\nEstimated Delivery: ${order.estimatedDelivery}`;
    if (order.courier) response += `\nCourier: ${order.courier}`;
    if (order.tracking) response += `\nTracking: ${order.tracking}`;
    if (order.refundStatus) response += `\n${order.refundStatus}`;

    return response;
  },
});