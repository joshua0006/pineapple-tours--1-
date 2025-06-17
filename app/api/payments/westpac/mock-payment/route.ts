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

  // Return a simple HTML page that simulates Westpac's hosted payment page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Westpac Quick Stream - Mock Payment</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 500px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .payment-form {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            .logo {
                color: #d32f2f;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .amount {
                font-size: 32px;
                font-weight: bold;
                color: #333;
                margin: 20px 0;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #333;
            }
            input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                box-sizing: border-box;
            }
            input:focus {
                outline: none;
                border-color: #d32f2f;
            }
            .button-group {
                display: flex;
                gap: 10px;
                margin-top: 30px;
            }
            button {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .pay-button {
                background: #d32f2f;
                color: white;
            }
            .pay-button:hover {
                background: #b71c1c;
            }
            .cancel-button {
                background: #f5f5f5;
                color: #666;
            }
            .cancel-button:hover {
                background: #e0e0e0;
            }
            .order-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 20px;
            }
            .demo-notice {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 20px;
                text-align: center;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="payment-form">
            <div class="header">
                <div class="logo">Westpac Quick Stream</div>
                <div>Secure Payment Gateway</div>
            </div>

            <div class="demo-notice">
                🧪 <strong>Development Mode:</strong> This is a mock payment page for testing. No real payment will be processed.
            </div>

            <div class="order-info">
                <div><strong>Merchant:</strong> Pineapple Tours</div>
                <div><strong>Order Number:</strong> ${orderNumber}</div>
                <div><strong>Description:</strong> Tour Booking Payment</div>
            </div>

            <div class="amount">AUD $${parseFloat(amount).toFixed(2)}</div>

            <form id="paymentForm">
                <div class="form-group">
                    <label for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
                </div>

                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label for="expiryDate">Expiry Date</label>
                        <input type="text" id="expiryDate" placeholder="MM/YY" maxlength="5" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
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
                // Show processing state
                const submitButton = document.querySelector('.pay-button');
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
