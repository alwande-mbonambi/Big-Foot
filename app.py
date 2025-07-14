
import stripe
from flask import Flask, render_template, jsonify, request, url_for
import os # Import the os module
from dotenv import load_dotenv # Import load_dotenv

# --- CONFIGURATION ---
app = Flask(__name__)

# Load environment variables from .env file
# This must be called BEFORE you try to access any environment variables
load_dotenv()

# Get Stripe keys from environment variables
# It's good practice to provide a default or raise an error if not found
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_PUBLIC_KEY = os.environ.get("STRIPE_PUBLIC_KEY")

# Optional: Add checks to ensure keys are loaded (highly recommended for production)
if not stripe.api_key:
    raise ValueError("STRIPE_SECRET_KEY environment variable not set.")
if not STRIPE_PUBLIC_KEY:
    raise ValueError("STRIPE_PUBLIC_KEY environment variable not set.")


# --- E-COMMERCE ROUTES ---

@app.route('/')
@app.route('/login.html')
def login():
    """Renders the login.html template."""
    return render_template('login.html')

@app.route('/client_side.html')
def client_side():
    """Renders the client_side.html template and passes the public key."""
    # We pass the public key to the template
    return render_template('client_side.html', stripe_public_key=STRIPE_PUBLIC_KEY)

@app.route('/admin_side.html')
def admin_side():
    """Renders the admin_side.html template."""
    return render_template('admin_side.html')


# --- STRIPE PAYMENT ROUTES (NEW) ---

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """
    This new route receives the cart data from the frontend,
    creates a Stripe Checkout Session, and returns the session ID.
    """
    data = request.get_json()
    cart_items = data.get('cart', [])

    line_items = []
    for item in cart_items:
        line_items.append({
            'price_data': {
                'currency': 'zar', # South African Rand
                'product_data': {
                    'name': item['name'],
                    'images': [item['image']],
                },
                'unit_amount': int(item['price'] * 100),  # Price in cents
            },
            'quantity': item['quantity'],
        })

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            # These are the URLs Stripe will redirect to on success or failure
            success_url=url_for('order_success', _external=True),
            cancel_url=url_for('order_cancel', _external=True),
        )
        return jsonify({'id': checkout_session.id})
    except Exception as e:
        return jsonify(error=str(e)), 403


@app.route('/order/success')
def order_success():
    """Renders the success page after a successful payment."""
    # In a real app, you would use webhooks to confirm the order
    # and update your database before showing this page.
    return render_template('success.html')


@app.route('/order/cancel')
def order_cancel():
    """Renders the cancel page if the user cancels the checkout."""
    return render_template('cancel.html')


# --- MAIN EXECUTION ---
if __name__ == '__main__':
    app.run(debug=True, port=5000) # Using port 5000 to be explicit