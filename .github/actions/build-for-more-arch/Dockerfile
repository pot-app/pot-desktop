FROM ubuntu:focal
COPY entrypoint.sh /entrypoint.sh
ENV DEBIAN_FRONTEND=noninteractive
RUN chmod a+x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"] 