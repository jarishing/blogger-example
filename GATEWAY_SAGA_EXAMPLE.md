# 🎭 API Gateway + Saga Orchestration Example

## Combined Pattern: Gateway Routes to Saga Orchestrator

```
Frontend → tRPC Gateway → Saga Orchestrator → Multiple Services
```

## Example: E-commerce Order Creation

### 1. Frontend Request (Same as always)
```typescript
// Frontend - Simple tRPC call
const createOrder = trpc.orders.create.useMutation();

const handleCheckout = async () => {
  try {
    const order = await createOrder.mutateAsync({
      productId: "123",
      quantity: 2,
      cardId: "card_456",
      address: "123 Main St"
    });
    
    console.log('Order created:', order);
  } catch (error) {
    console.error('Order failed:', error);
  }
};
```

### 2. tRPC Gateway (Routes to Orchestrator)
```typescript
// packages/api/src/routers/orders.ts
import { OrderSagaOrchestrator } from '../services/OrderSagaOrchestrator';

export const ordersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      // Gateway forwards to Saga Orchestrator
      const orchestrator = new OrderSagaOrchestrator();
      
      try {
        const order = await orchestrator.executeOrderSaga({
          ...input,
          userId: ctx.user.userId
        });
        
        return order;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Order creation failed'
        });
      }
    })
});
```

### 3. Saga Orchestrator (Manages Complex Transaction)
```typescript
// packages/api/src/services/OrderSagaOrchestrator.ts
export class OrderSagaOrchestrator {
  private inventoryService = new InventoryServiceClient();
  private paymentService = new PaymentServiceClient();
  private shippingService = new ShippingServiceClient();
  private orderService = new OrderServiceClient();
  
  async executeOrderSaga(orderData: CreateOrderData): Promise<Order> {
    const sagaId = `saga_${Date.now()}_${Math.random()}`;
    
    // Track saga state
    const sagaState = {
      id: sagaId,
      status: 'started',
      completedSteps: [],
      rollbackSteps: []
    };
    
    try {
      // Step 1: Check and reserve inventory
      console.log(`[${sagaId}] Step 1: Reserving inventory...`);
      const inventoryReservation = await this.inventoryService.reserve({
        productId: orderData.productId,
        quantity: orderData.quantity,
        sagaId
      });
      sagaState.completedSteps.push('inventory');
      sagaState.rollbackSteps.push(() => 
        this.inventoryService.cancelReservation(inventoryReservation.id)
      );
      
      // Step 2: Process payment
      console.log(`[${sagaId}] Step 2: Processing payment...`);
      const payment = await this.paymentService.charge({
        amount: inventoryReservation.totalAmount,
        cardId: orderData.cardId,
        sagaId
      });
      sagaState.completedSteps.push('payment');
      sagaState.rollbackSteps.push(() => 
        this.paymentService.refund(payment.id)
      );
      
      // Step 3: Create shipment
      console.log(`[${sagaId}] Step 3: Creating shipment...`);
      const shipment = await this.shippingService.createShipment({
        address: orderData.address,
        items: inventoryReservation.items,
        sagaId
      });
      sagaState.completedSteps.push('shipping');
      sagaState.rollbackSteps.push(() => 
        this.shippingService.cancelShipment(shipment.id)
      );
      
      // Step 4: Create order record
      console.log(`[${sagaId}] Step 4: Creating order...`);
      const order = await this.orderService.create({
        userId: orderData.userId,
        items: inventoryReservation.items,
        paymentId: payment.id,
        shipmentId: shipment.id,
        totalAmount: payment.amount,
        status: 'confirmed',
        sagaId
      });
      
      console.log(`[${sagaId}] ✅ Order saga completed successfully`);
      return order;
      
    } catch (error) {
      console.error(`[${sagaId}] ❌ Order saga failed:`, error);
      
      // Execute rollback in reverse order
      await this.executeRollback(sagaState);
      
      throw new Error(`Order creation failed: ${error.message}`);
    }
  }
  
  private async executeRollback(sagaState: SagaState) {
    console.log(`[${sagaState.id}] 🔄 Starting rollback...`);
    
    // Execute rollback steps in reverse order
    for (let i = sagaState.rollbackSteps.length - 1; i >= 0; i--) {
      try {
        await sagaState.rollbackSteps[i]();
        console.log(`[${sagaState.id}] ↩️ Rolled back step ${sagaState.completedSteps[i]}`);
      } catch (rollbackError) {
        console.error(`[${sagaState.id}] ❌ Rollback failed for step ${sagaState.completedSteps[i]}:`, rollbackError);
      }
    }
    
    console.log(`[${sagaState.id}] 🔄 Rollback completed`);
  }
}
```

### 4. Service Clients (Call Microservices)
```typescript
// packages/api/src/services/InventoryServiceClient.ts
export class InventoryServiceClient {
  private baseUrl = process.env.INVENTORY_SERVICE_URL;
  
  async reserve(data: ReserveInventoryData) {
    const response = await fetch(`${this.baseUrl}/api/inventory/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Inventory reservation failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async cancelReservation(reservationId: string) {
    const response = await fetch(`${this.baseUrl}/api/inventory/cancel/${reservationId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      console.error('Failed to cancel inventory reservation');
    }
  }
}

// packages/api/src/services/PaymentServiceClient.ts
export class PaymentServiceClient {
  private baseUrl = process.env.PAYMENT_SERVICE_URL;
  
  async charge(data: ChargePaymentData) {
    const response = await fetch(`${this.baseUrl}/api/payments/charge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Payment failed: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async refund(paymentId: string) {
    const response = await fetch(`${this.baseUrl}/api/payments/refund/${paymentId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      console.error('Failed to refund payment');
    }
  }
}
```

## Flow Example

### Success Case:
```
1. Frontend → Gateway: createOrder()
2. Gateway → Orchestrator: executeOrderSaga()
3. Orchestrator → Inventory: reserve() ✅
4. Orchestrator → Payment: charge() ✅
5. Orchestrator → Shipping: create() ✅
6. Orchestrator → Order: create() ✅
7. Gateway → Frontend: Success! 🎉
```

### Failure Case (Payment fails):
```
1. Frontend → Gateway: createOrder()
2. Gateway → Orchestrator: executeOrderSaga()
3. Orchestrator → Inventory: reserve() ✅
4. Orchestrator → Payment: charge() ❌ FAILS
5. Orchestrator → Rollback:
   - Cancel inventory reservation ↩️
6. Gateway → Frontend: Error! Order failed 💥
```

## When to Use This Pattern

### ✅ Use Gateway + Saga when you have:
- Complex multi-step business processes
- Need guaranteed data consistency
- Multiple services that must work together
- High-value transactions (orders, payments, bookings)

### ❌ Don't use when you have:
- Simple CRUD operations
- Single-service operations
- Learning/prototyping
- Low-complexity business logic

## For Your Blog App

**Do you need Saga Orchestration?**

❌ **Probably NOT** because:
- Creating an article is a single operation
- No complex multi-step transactions
- No financial transactions
- No inventory management

✅ **API Gateway (Option C) might be enough** for:
- Routing requests
- Aggregating user + article data
- Centralized auth

**Simple blog operations don't need saga complexity!**