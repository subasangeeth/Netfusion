FROM alpine:3.19

RUN apk update && apk add --no-cache \
    iproute2 \
    iputils \
    curl \
    netcat-openbsd \
    traceroute \
    bind-tools \
    bash \
    nmap \
    iperf3

COPY test-connectivity.sh /usr/local/bin/test-connectivity.sh
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/test-connectivity.sh /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
