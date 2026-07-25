# ==============================================================================
# Production Dockerfile for AI Resume Builder & Python Resume Intelligence Engine
# Packages Node.js 20 + Python 3.11 + OpenCV + PyMuPDF + pdfplumber + Express
# ==============================================================================

FROM nikolaik/python-nodejs:python3.11-nodejs20-slim

# Install system dependencies for OpenCV, PyMuPDF, and graphics processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install --production

# Copy application source code
COPY . .

# Environment variables
ENV PORT=3000
ENV PYTHON_PARSER_URL=http://127.0.0.1:5001
ENV NODE_ENV=production

EXPOSE 3000
EXPOSE 5001

# Start command
CMD ["npm", "start"]
