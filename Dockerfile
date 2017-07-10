FROM node:8.1.0-onbuild

COPY . /app

RUN cd /app \
  && npm install

RUN apt-get update \
  && apt-get install build-essential chrpath libssl-dev libxft-dev -y \
  && apt-get install libfreetype6 libfreetype6-dev -y \
  && apt-get install libfontconfig1 libfontconfig1-dev -y
# RUN wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
RUN tar xvjf phantomjs-2.1.1-linux-x86_64.tar.bz2 \
  && mv phantomjs-2.1.1-linux-x86_64 /usr/local/share \
  && ln -sf /usr/local/share/phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin
RUN unlink /etc/localtime \
  && ln -s /usr/share/zoneinfo/America/Denver /etc/localtime

WORKDIR /app

CMD npm start
