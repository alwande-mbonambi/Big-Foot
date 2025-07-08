from flask import Flask, render_template, redirect, url_for, request

app = Flask(__name__)

# Route for the login page (root URL)
@app.route('/')
@app.route('/login.html')
def login():
    """Renders the login.html template."""
    return render_template('login.html')

# Route for the client-side store
@app.route('/client_side.html')
def client_side():
    """Renders the client_side.html template."""
    return render_template('client_side.html')

# Route for the admin panel
@app.route('/admin_side.html')
def admin_side():
    """Renders the admin_side.html template."""
    return render_template('admin_side.html')

if __name__ == '__main__':
    # Run the Flask development server.
    # In a production environment, you would use a production-ready WSGI server
    # like Gunicorn or uWSGI instead of app.run(debug=True).
    app.run(debug=True)