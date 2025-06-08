import { NextRequest, NextResponse } from 'next/server'
import { GiftVoucherPurchaseData, GiftVoucherValidation } from '@/lib/types/rezdy'

export async function POST(request: NextRequest) {
  try {
    const body: GiftVoucherPurchaseData = await request.json()
    
    // Validate required fields
    const validation = validatePurchaseData(body)
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    // Generate unique voucher code
    const voucherCode = generateVoucherCode()
    
    // Calculate expiry date (12 months from now)
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)

    // Here you would integrate with your payment processor
    // For now, we'll simulate a successful payment
    const paymentResult = await processPayment(body)
    
    if (!paymentResult.success) {
      return NextResponse.json(
        { 
          error: 'Payment failed', 
          details: paymentResult.error 
        },
        { status: 402 }
      )
    }

    // Create voucher record (you would save this to your database)
    const voucher = {
      voucherCode,
      recipientName: body.recipientName,
      recipientEmail: body.recipientEmail,
      senderName: body.senderName,
      senderEmail: body.senderEmail,
      amount: body.amount,
      personalMessage: body.personalMessage,
      deliveryDate: body.deliveryDate,
      voucherType: body.voucherType,
      productCode: body.productCode,
      purchaseDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      isRedeemed: false,
      remainingBalance: body.amount,
      originalAmount: body.amount,
      paymentId: paymentResult.paymentId
    }

    // Send confirmation emails (you would implement this)
    await sendVoucherEmails(voucher)

    return NextResponse.json({
      success: true,
      voucher: {
        voucherCode: voucher.voucherCode,
        amount: voucher.amount,
        expiryDate: voucher.expiryDate,
        recipientEmail: voucher.recipientEmail
      },
      message: 'Gift voucher purchased successfully'
    })

  } catch (error) {
    console.error('Gift voucher purchase error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process gift voucher purchase'
      },
      { status: 500 }
    )
  }
}

function validatePurchaseData(data: GiftVoucherPurchaseData): GiftVoucherValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Required field validation
  if (!data.recipientName?.trim()) {
    errors.push('Recipient name is required')
  }

  if (!data.recipientEmail?.trim()) {
    errors.push('Recipient email is required')
  } else if (!isValidEmail(data.recipientEmail)) {
    errors.push('Invalid recipient email format')
  }

  if (!data.senderName?.trim()) {
    errors.push('Sender name is required')
  }

  if (!data.senderEmail?.trim()) {
    errors.push('Sender email is required')
  } else if (!isValidEmail(data.senderEmail)) {
    errors.push('Invalid sender email format')
  }

  if (!data.amount || data.amount < 25) {
    errors.push('Minimum voucher amount is $25')
  }

  if (data.amount && data.amount > 5000) {
    warnings.push('Large voucher amount - please verify')
  }

  if (!data.voucherType) {
    errors.push('Voucher type is required')
  }

  // Delivery date validation
  if (data.deliveryDate) {
    const deliveryDate = new Date(data.deliveryDate)
    const now = new Date()
    if (deliveryDate < now) {
      errors.push('Delivery date cannot be in the past')
    }
  }

  return {
    isValid: errors.length === 0,
    voucherCode: '', // Will be generated if valid
    errors,
    warnings,
    isExpired: false,
    isRedeemed: false
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function generateVoucherCode(): string {
  // Generate a unique voucher code (you might want to use a more sophisticated method)
  const prefix = 'PTV'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

async function processPayment(data: GiftVoucherPurchaseData): Promise<{
  success: boolean
  paymentId?: string
  error?: string
}> {
  // This is where you would integrate with your payment processor
  // (Stripe, PayPal, Square, etc.)
  
  // For demonstration, we'll simulate a successful payment
  // In reality, you would:
  // 1. Create a payment intent
  // 2. Process the payment
  // 3. Handle webhooks for payment confirmation
  
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate 95% success rate
    if (Math.random() > 0.05) {
      return {
        success: true,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2)}`
      }
    } else {
      return {
        success: false,
        error: 'Payment declined by bank'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Payment processing failed'
    }
  }
}

async function sendVoucherEmails(voucher: any): Promise<void> {
  // This is where you would send confirmation emails
  // You might use services like SendGrid, Mailgun, or AWS SES
  
  try {
    // Send email to purchaser
    console.log(`Sending purchase confirmation to ${voucher.senderEmail}`)
    
    // Send voucher to recipient
    console.log(`Sending gift voucher to ${voucher.recipientEmail}`)
    
    // In a real implementation, you would:
    // 1. Create beautiful HTML email templates
    // 2. Include voucher code and redemption instructions
    // 3. Add calendar reminders for expiry
    // 4. Include QR codes for easy redemption
    
  } catch (error) {
    console.error('Failed to send voucher emails:', error)
    // You might want to queue this for retry
  }
} 