# Stripe Setup Guide for QueryWing

This guide will help you set up Stripe integration to fix the "Missing Stripe price ID env vars" error.

## 🚀 Quick Setup

### 1. **Create Environment File**
Copy the `env-template.txt` file to `.env.local` in your project root:

```bash
cp env-template.txt .env.local
```

### 2. **Get Stripe API Keys**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable Key** (starts with `pk_test_`)
3. Copy your **Secret Key** (starts with `sk_test_`)

### 3. **Create Products and Get Price IDs**
1. Go to [Stripe Products](https://dashboard.stripe.com/products)
2. Create 3 products:
   - **Starter Plan** - $29/month
   - **Growth Plan** - $99/month  
   - **Scale Plan** - $299/month
3. For each product, create a recurring price and copy the Price ID (starts with `price_`)

### 4. **Update .env.local**
Fill in your actual values (do not commit this file):

```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_PRICE_STARTER=your_starter_price_id_here
STRIPE_PRICE_GROWTH=your_growth_price_id_here
STRIPE_PRICE_SCALE=your_scale_price_id_here
```

### 5. **Restart Development Server**
```bash
npm run dev
```

## 🔧 Detailed Steps

### **Step 1: Stripe Account Setup**
1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Switch to test mode (toggle in dashboard)

### **Step 2: Create Products**
1. **Starter Plan**
   - Name: "Starter Plan"
   - Price: $29/month
   - Billing: Recurring monthly
   - Copy Price ID

2. **Growth Plan**
   - Name: "Growth Plan" 
   - Price: $99/month
   - Billing: Recurring monthly
   - Copy Price ID

3. **Scale Plan**
   - Name: "Scale Plan"
   - Price: $299/month
   - Billing: Recurring monthly
   - Copy Price ID

### **Step 3: Environment Variables**
Your `.env.local` should look like this (example placeholders only):

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:26257/defaultdb?sslmode=verify-full"

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Stripe Price IDs
STRIPE_PRICE_STARTER=your_starter_price_id_here
STRIPE_PRICE_GROWTH=your_growth_price_id_here
STRIPE_PRICE_SCALE=your_scale_price_id_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🧪 Testing

### **Test Mode**
- Stripe test mode uses test card numbers
- Use `4242 4242 4242 4242` for successful payments
- Use `4000 0000 0000 0002` for declined payments

### **Test Cards**
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **Expired Card**: `4000 0000 0000 0069`

## 🐛 Troubleshooting

### **Common Issues**

1. **"Stripe not configured"**
   - Check if `.env.local` exists
   - Verify `STRIPE_SECRET_KEY` is set
   - Restart development server

2. **"Missing Stripe price ID env vars"**
   - Verify all 3 price IDs are set
   - Check for typos in environment variables
   - Ensure products exist in Stripe dashboard

3. **"Failed to create checkout session"**
   - Verify Stripe secret key is correct
   - Check if price IDs are valid
   - Ensure Stripe account is active

### **Debug Steps**
1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Stripe API keys manually
4. Check Stripe dashboard for product status

## 🔒 Security Notes

- **Never commit `.env.local` to version control**
- **Use test keys for development**
- **Switch to live keys only in production**
- **Keep secret keys secure**

## 📱 Production Deployment

When deploying to production:

1. Switch to live Stripe keys
2. Update price IDs for live products
3. Set proper success/cancel URLs
4. Configure webhook endpoints
5. Test with real payment methods

## 🎯 Next Steps

After successful Stripe setup:

1. Test checkout flow with test cards
2. Implement webhook handling
3. Add subscription management
4. Set up customer portal
5. Configure usage tracking

## 📞 Support

If you encounter issues:

1. Check [Stripe Documentation](https://stripe.com/docs)
2. Verify your Stripe account status
3. Check environment variable syntax
4. Ensure development server is restarted
5. Review browser console for detailed errors

---

**Note**: This setup uses Stripe test mode. For production, you'll need to switch to live mode and use real payment methods.
