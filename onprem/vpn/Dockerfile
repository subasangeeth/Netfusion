FROM alpine:3.19

RUN apk update && apk add --no-cache \
    wireguard-tools \
    iptables \
    iproute2 \
    iputils \
    bash \
    curl \
    conntrack-tools

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 51820/udp

ENTRYPOINT ["/entrypoint.sh"]
