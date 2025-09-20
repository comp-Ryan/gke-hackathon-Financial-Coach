FROM python:3.10-slim
WORKDIR /app
COPY requirements.in .
RUN pip install -r requirements.in
COPY . .
EXPOSE 8080
CMD ["python", "main.py"]