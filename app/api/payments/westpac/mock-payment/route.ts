import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orderNumber = searchParams.get("orderNumber");
  const amount = searchParams.get("amount");

  if (!orderNumber || !amount) {
    return NextResponse.json(
      { error: "Missing required parameters: orderNumber and amount" },
      { status: 400 }
    );
  }

  // Try to retrieve booking data to display booking details
  let bookingData = null;
  try {
    const { bookingDataStore } = await import(
      "@/lib/services/booking-data-store"
    );
    // Use fallback retrieval to handle different order number formats
    bookingData = await bookingDataStore.retrieveWithFallbacks(orderNumber);
  } catch (error) {
    console.log("Could not retrieve booking data for display:", error);
  }

  // Format booking information for display
  const formatBookingInfo = (data: any) => {
    if (!data) return "";

    const guestSummary = data.guests?.reduce(
      (acc: Record<string, number>, guest: any) => {
        acc[guest.type] = (acc[guest.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const guestText = guestSummary
      ? Object.entries(guestSummary)
          .map(
            ([type, count]) =>
              `${count as number} ${type.toLowerCase()}${
                (count as number) > 1 ? "s" : ""
              }`
          )
          .join(", ")
      : "";

    const sessionDate = data.session?.startTime
      ? new Date(data.session.startTime).toLocaleDateString("en-AU", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

    const sessionTime = data.session?.startTime
      ? new Date(data.session.startTime).toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return `
      <div class="booking-details">
        <h3>Booking Details</h3>
        <div class="detail-row">
          <span class="detail-label">Tour:</span>
          <span class="detail-value">${data.product?.name || "N/A"}</span>
        </div>
        ${
          sessionDate
            ? `
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${sessionDate}</span>
          </div>
        `
            : ""
        }
        ${
          sessionTime
            ? `
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${sessionTime}</span>
          </div>
        `
            : ""
        }
        ${
          guestText
            ? `
          <div class="detail-row">
            <span class="detail-label">Guests:</span>
            <span class="detail-value">${guestText}</span>
          </div>
        `
            : ""
        }
        ${
          data.session?.pickupLocation?.name
            ? `
          <div class="detail-row">
            <span class="detail-label">Pickup:</span>
            <span class="detail-value">${data.session.pickupLocation.name}</span>
          </div>
        `
            : ""
        }
        ${
          data.contact?.firstName
            ? `
          <div class="detail-row">
            <span class="detail-label">Contact:</span>
            <span class="detail-value">${data.contact.firstName} ${data.contact.lastName}</span>
          </div>
        `
            : ""
        }
        ${
          data.contact?.email
            ? `
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">${data.contact.email}</span>
          </div>
        `
            : ""
        }
      </div>
    `;
  };

  // Return a beautiful HTML page that simulates Westpac's hosted payment page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Westpac Quick Stream - Secure Payment</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                line-height: 1.6;
            }
            
            .container {
                max-width: 900px;
                margin: 0 auto;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                align-items: start;
            }
            
            @media (max-width: 768px) {
                .container {
                    grid-template-columns: 1fr;
                    max-width: 500px;
                }
            }
            
            .payment-card, .booking-card {
                background: white;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .card-header {
                background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
            }
            
            .subtitle {
                opacity: 0.9;
                font-size: 16px;
                font-weight: 400;
            }
            
            .card-body {
                padding: 30px;
            }
            
            .demo-notice {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                border: 1px solid #ffd93d;
                color: #856404;
                padding: 16px;
                border-radius: 12px;
                margin-bottom: 25px;
                text-align: center;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
            }
            
            .amount-section {
                text-align: center;
                margin: 25px 0;
                padding: 20px;
                background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
                border-radius: 12px;
                border: 1px solid #e1f5fe;
            }
            
            .amount {
                font-size: 36px;
                font-weight: 700;
                color: #1565c0;
                margin-bottom: 8px;
            }
            
            .amount-label {
                color: #666;
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .order-info {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                border: 1px solid #e9ecef;
            }
            
            .order-info h4 {
                color: #333;
                margin-bottom: 15px;
                font-size: 16px;
                font-weight: 600;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .info-label {
                color: #666;
                font-weight: 500;
            }
            
            .info-value {
                color: #333;
                font-weight: 600;
            }
            
            .form-section {
                margin-bottom: 25px;
            }
            
            .section-title {
                font-size: 18px;
                font-weight: 600;
                color: #333;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }
            
            input {
                width: 100%;
                padding: 16px;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 16px;
                transition: all 0.3s ease;
                background: #fafafa;
            }
            
            input:focus {
                outline: none;
                border-color: #d32f2f;
                background: white;
                box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
            }
            
            .button-group {
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 15px;
                margin-top: 30px;
            }
            
            button {
                padding: 18px 30px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .pay-button {
                background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
                color: white;
                box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
            }
            
            .pay-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 30px rgba(211, 47, 47, 0.4);
            }
            
            .pay-button:disabled {
                background: #ccc;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            .cancel-button {
                background: #f5f5f5;
                color: #666;
                border: 2px solid #e0e0e0;
            }
            
            .cancel-button:hover {
                background: #e0e0e0;
                transform: translateY(-1px);
            }
            
            .booking-details {
                background: white;
                border-radius: 16px;
            }
            
            .booking-details h3 {
                color: white;
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 0;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                color: #666;
                font-weight: 500;
                font-size: 14px;
            }
            
            .detail-value {
                color: #333;
                font-weight: 600;
                text-align: right;
                max-width: 60%;
                word-break: break-word;
            }
            
            .security-badges {
                display: flex;
                justify-content: center;
                gap: 20px;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #f0f0f0;
            }
            
            .badge {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #666;
                font-size: 12px;
                font-weight: 500;
            }
            
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .loading-content {
                background: white;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                max-width: 300px;
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #d32f2f;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Payment Form -->
            <div class="payment-card">
                <div class="card-header">
                    <div class="logo">Westpac Quick Stream</div>
                    <div class="subtitle">Secure Payment Gateway</div>
                </div>
                
                <div class="card-body">
                    <div class="demo-notice">
                        🧪 <strong>Development Mode:</strong> This is a mock payment page for testing. No real payment will be processed.
                    </div>

                    <div class="order-info">
                        <h4>Transaction Details</h4>
                        <div class="info-row">
                            <span class="info-label">Merchant:</span>
                            <span class="info-value">Pineapple Tours</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Order Number:</span>
                            <span class="info-value">${orderNumber}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Description:</span>
                            <span class="info-value">Tour Booking Payment</span>
                        </div>
                    </div>

                    <div class="amount-section">
                        <div class="amount">AUD $${parseFloat(amount).toFixed(
                          2
                        )}</div>
                        <div class="amount-label">Total Amount</div>
                    </div>

                    <div class="form-section">
                        <div class="section-title">Payment Information</div>
                        
                        <form id="paymentForm">
                            <div class="form-group">
                                <label for="cardNumber">Card Number</label>
                                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="expiryDate">Expiry Date</label>
                                    <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                                </div>
                                <div class="form-group">
                                    <label for="cvv">CVV</label>
                                    <input type="text" id="cvv" placeholder="123" maxlength="4" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="cardholderName">Cardholder Name</label>
                                <input type="text" id="cardholderName" placeholder="John Doe" required>
                            </div>

                            <div class="button-group">
                                <button type="button" class="cancel-button" onclick="cancelPayment()">Cancel</button>
                                <button type="submit" class="pay-button">Pay Now</button>
                            </div>
                        </form>
                    </div>
                    
                    <div class="security-badges">
                        <div class="badge">
                            🔒 SSL Encrypted
                        </div>
                        <div class="badge">
                            🛡️ PCI Compliant
                        </div>
                        <div class="badge">
                            ✅ Secure Processing
                        </div>
                    </div>
                </div>
            </div>

            <!-- Booking Details -->
            <div class="booking-card">
                <div class="card-header">
                    <h3>Booking Summary</h3>
                </div>
                
                <div class="card-body">
                    ${formatBookingInfo(bookingData)}
                    
                    <div class="order-info" style="margin-top: 20px;">
                        <h4>Payment Summary</h4>
                        <div class="info-row">
                            <span class="info-label">Subtotal:</span>
                            <span class="info-value">AUD $${
                              bookingData?.pricing?.subtotal?.toFixed(2) ||
                              parseFloat(amount).toFixed(2)
                            }</span>
                        </div>
                        ${
                          bookingData?.pricing?.taxAndFees
                            ? `
                        <div class="info-row">
                            <span class="info-label">Taxes & Fees:</span>
                            <span class="info-value">AUD $${bookingData.pricing.taxAndFees.toFixed(
                              2
                            )}</span>
                        </div>
                        `
                            : ""
                        }
                        <div class="info-row" style="border-top: 2px solid #e0e0e0; padding-top: 10px; margin-top: 10px; font-weight: 700;">
                            <span class="info-label">Total:</span>
                            <span class="info-value">AUD $${parseFloat(
                              amount
                            ).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Loading Overlay -->
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-content">
                <div class="spinner"></div>
                <h3>Processing Payment</h3>
                <p>Please wait while we securely process your payment...</p>
            </div>
        </div>

        <script>
            // Format card number input
            document.getElementById('cardNumber').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });

            // Format expiry date input
            document.getElementById('expiryDate').addEventListener('input', function(e) {
                let value = e.target.value.replace(/\\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });

            // CVV input - numbers only
            document.getElementById('cvv').addEventListener('input', function(e) {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });

            // Handle form submission
            document.getElementById('paymentForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const cardNumber = document.getElementById('cardNumber').value.replace(/\\s/g, '');
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;
                const cardholderName = document.getElementById('cardholderName').value;

                // Basic validation
                if (cardNumber.length < 13 || cardNumber.length > 19) {
                    alert('Please enter a valid card number');
                    return;
                }

                if (!/^\\d{2}\\/\\d{2}$/.test(expiryDate)) {
                    alert('Please enter a valid expiry date (MM/YY)');
                    return;
                }

                if (cvv.length < 3 || cvv.length > 4) {
                    alert('Please enter a valid CVV');
                    return;
                }

                if (!cardholderName.trim()) {
                    alert('Please enter the cardholder name');
                    return;
                }

                // Simulate payment processing
                processPayment(cardNumber, expiryDate, cvv, cardholderName);
            });

            function processPayment(cardNumber, expiryDate, cvv, cardholderName) {
                // Show loading overlay and processing state
                const loadingOverlay = document.getElementById('loadingOverlay');
                const submitButton = document.querySelector('.pay-button');
                
                loadingOverlay.style.display = 'flex';
                submitButton.textContent = 'Processing...';
                submitButton.disabled = true;

                // Simulate payment processing delay
                setTimeout(() => {
                    // Simulate success/failure (90% success rate)
                    const isSuccess = Math.random() > 0.1;
                    
                    if (isSuccess) {
                        // Simulate successful payment callback
                        const callbackData = {
                            orderNumber: '${orderNumber}',
                            paymentStatus: 'SUCCESS',
                            responseCode: '00',
                            responseText: 'Transaction Approved',
                            transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
                            amount: ${
                              parseFloat(amount) * 100
                            }, // Convert to cents
                            currency: 'AUD',
                            paymentMethod: getCardType(cardNumber),
                            cardLast4: cardNumber.slice(-4),
                            timestamp: new Date().toISOString()
                        };

                        // Redirect to callback endpoint
                        const callbackUrl = '/api/payments/westpac/callback';
                        
                        // Create form to POST callback data
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = callbackUrl;
                        
                        Object.keys(callbackData).forEach(key => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = callbackData[key];
                            form.appendChild(input);
                        });
                        
                        document.body.appendChild(form);
                        form.submit();
                    } else {
                        // Simulate payment failure
                        loadingOverlay.style.display = 'none';
                        alert('Payment failed: Card declined by bank');
                        submitButton.textContent = 'Pay Now';
                        submitButton.disabled = false;
                    }
                }, 2000);
            }

            function getCardType(cardNumber) {
                if (cardNumber.startsWith('4')) return 'VISA';
                if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) return 'MASTERCARD';
                if (cardNumber.startsWith('3')) return 'AMEX';
                return 'VISA'; // Default
            }

            function cancelPayment() {
                if (confirm('Are you sure you want to cancel this payment?')) {
                    window.location.href = '/booking/cancelled?orderNumber=${orderNumber}';
                }
            }
        </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
