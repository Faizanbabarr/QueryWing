# 🔐 Password Reset Setup Guide

QueryWing now has a complete password reset flow that sends real emails to users. Here's how to set it up:

## 🚀 Quick Setup (Recommended)

### 1. Sign up for Resend (Free tier available)
- Go to [https://resend.com](https://resend.com)
- Create an account
- Get your API key from the dashboard

### 2. Add to your `.env.local` file
```bash
RESEND_API_KEY=your_api_key_here
RESEND_FROM=your-verified-domain@example.com
```

### 3. Restart your development server
```bash
npm run dev
```

That's it! Password reset emails will now be sent automatically.

## 📧 How It Works

1. **User clicks "Forgot password?"** on the sign-in page
2. **User enters their email** and clicks "Send reset link"
3. **System validates the email** exists in your user database
4. **Reset email is sent** with a secure, time-limited link
5. **User clicks the link** in their email
6. **User sets new password** on the reset page
7. **Password is updated** and user is redirected to sign-in

## 🔧 Advanced Configuration

### Alternative Email Services

#### SendGrid
```bash
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM=your-verified-sender@example.com
```

#### SMTP (Gmail, Outlook, etc.)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### Custom Email Templates

You can customize the email template by editing `src/lib/email.ts` in the `sendPasswordResetEmail` function.

## 🧪 Development Mode

When no email service is configured, the system will:
- Log emails to the console
- Show development messages
- Still allow the reset flow to work for testing

## 🔒 Security Features

- **Time-limited tokens**: Reset links expire in 15 minutes
- **Secure token generation**: Uses timestamp + random string
- **Email validation**: Checks if user exists before sending
- **Token verification**: Validates tokens on the reset page

## 🐛 Troubleshooting

### Emails not sending?
1. Check your API key is correct
2. Verify your sender email is verified
3. Check the console for error messages
4. Ensure your email service account is active

### Reset links not working?
1. Check the token hasn't expired (15 minutes)
2. Verify the email matches the token
3. Clear browser localStorage if testing

### Development issues?
1. Check the console for logged emails
2. Verify the reset flow in localStorage
3. Test with a valid user account

## 📱 Testing the Flow

1. Create a test user account
2. Go to `/auth/forgot-password`
3. Enter the test email
4. Check your email (or console in dev mode)
5. Click the reset link
6. Set a new password
7. Sign in with the new password

## 🎯 Next Steps

- [ ] Configure your email service
- [ ] Test the password reset flow
- [ ] Customize email templates if needed
- [ ] Set up production email configuration

## 📞 Support

If you need help setting up email services or encounter issues:
1. Check the console for error messages
2. Verify your environment variables
3. Test with the development mode first
4. Check the email service documentation

---

**Note**: This password reset system is designed for development and small-scale use. For production applications, consider implementing additional security measures like rate limiting and audit logging.
