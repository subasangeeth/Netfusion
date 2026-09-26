FROM alpine:3.19

RUN apk update && apk add --no-cache \
    iproute2 \
    iptables \
    iputils \
    bash \
    curl \
    conntrack-tools \
    tcpdump

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
