FROM python:3.13.3

WORKDIR /app

COPY requirements.txt .

RUN pip install --timeout=30 --retries=5 -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
