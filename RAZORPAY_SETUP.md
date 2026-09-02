# Environment Variables for Razorpay Integration

## Frontend (Public - Safe to expose)
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Backend (Secret - Never expose)
```env
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
ADMIN_EMAIL=admin@agrawal-enterprise.com
```

### How to get Razorpay credentials:
1. Go to https://dashboard.razorpay.com/
2. Log in or create account
3. Navigate to Settings → API Keys
4. Copy Key ID (for NEXT_PUBLIC_RAZORPAY_KEY_ID)
5. Copy Key Secret (for RAZORPAY_KEY_SECRET)

### Payment Flow:
1. Customer fills checkout form (address, coupon)
2. On "Pay Now", creates Razorpay order via `/api/payments/razorpay/create-order`
3. Razorpay checkout modal opens
4. Customer completes payment
5. Razorpay returns payment details
6. Frontend calls `/api/payments/razorpay/verify` with payment details
7. Backend verifies signature (uses RAZORPAY_KEY_SECRET)
8. If valid:
   - Creates order in database
   - Creates order items
   - Updates inventory
   - Sends admin notification
   - Returns success + order ID
9. Frontend clears cart and shows confirmation

### Security:
- Key Secret never exposed to frontend
- Payment signature verified server-side
- Order amount comes from database, not frontend
- User verification ensures order belongs to authenticated user
- Duplicate order prevention via payment ID check
