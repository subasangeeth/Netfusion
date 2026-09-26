FROM python:3.10-alpine

WORKDIR /app

RUN apk add --no-cache iproute2 curl iputils bash

COPY app_server.py /app/app_server.py

EXPOSE 8080

CMD ["python", "app_server.py"]
