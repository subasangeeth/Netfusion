FROM python:3.10-alpine

WORKDIR /app

RUN pip install --no-cache-dir requests

COPY collector.py /app/collector.py

CMD ["python", "-u", "collector.py"]
