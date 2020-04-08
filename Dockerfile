FROM node:12

RUN mkdir /public

COPY package.json /app/package.json
RUN npm --loglevel warn install --production
COPY . /app

WORKDIR /app
RUN npm --loglevel warn run postinstall --production
RUN chown -R nodejs:nodejs /public

USER 1000

CMD ["/app/run.sh"]

EXPOSE 8080
