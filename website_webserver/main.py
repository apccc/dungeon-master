from flask import Flask, send_from_directory
import os

port = 8885
site_directory = '../website'
index_file = 'index.html'

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory(site_directory, index_file)

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory(site_directory, filename)

if __name__ == '__main__':
    print("Starting web server...")
    print(f"Server will be available at: http://localhost:{port}")
    print(f"Serving files from: {site_directory}/")
    app.run(host='0.0.0.0', port=port, debug=True)
