import os
from flask import Flask, jsonify, request

def create_app():
    app = Flask(__name__)
    
    @app.route('/ready', methods=['GET'])
    def readiness():
        """Readiness probe"""
        return 'ok', 200
    
    @app.route('/version', methods=['GET'])
    def version():
        """Service version endpoint"""
        return os.environ.get('VERSION', '1.0.0'), 200
    
    @app.route('/challenges/<user_id>', methods=['GET'])
    def get_challenge(user_id):
        """Get AI-generated challenge for user"""
        # TODO: Add your AI logic here
        return jsonify({
            "challenge": f"Save $10 today, {user_id}!",
            "xp": 50,
            "difficulty": "easy"
        }), 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)