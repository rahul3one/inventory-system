from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Order, OrderItem, Product, Customer
from ..schemas import OrderCreate, OrderUpdate, Order as OrderSchema

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderSchema, status_code=201)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    # Validate customer
    if not db.query(Customer).filter(Customer.id == order_in.customer_id).first():
        raise HTTPException(status_code=404, detail="Customer not found")

    total = 0.0
    items_data = []

    # Validate stock for all items before making any changes
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock_quantity}"
            )
        items_data.append((product, item.quantity))
        total += product.price * item.quantity

    # All validations passed — create order
    order = Order(customer_id=order_in.customer_id, total_amount=total)
    db.add(order)
    db.flush()  # Get order.id without committing

    for product, quantity in items_data:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            unit_price=product.price
        ))
        product.stock_quantity -= quantity  # Deduct stock atomically

    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=List[OrderSchema])
def list_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Order).offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=OrderSchema)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", response_model=OrderSchema)
def update_order_status(order_id: int, update: OrderUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = update.status
    db.commit()
    db.refresh(order)
    return order