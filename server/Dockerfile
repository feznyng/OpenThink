FROM elixir:1.16 AS builder

ENV MIX_ENV=prod
ARG JWT_SECRET
ARG REDIS_HOST

WORKDIR /usr/local/openthink_backend

# Get 

# This step installs all the build tools we'll need
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs && \
    mix local.rebar --force && \
    mix local.hex --force
    

# Copies our app source code into the build container
COPY . .

# Compile Elixir
RUN mix do deps.get, deps.compile, compile

# Compile Javascript
RUN cd assets \
    && npm install \
    && ./node_modules/webpack/bin/webpack.js --mode production \
    && cd .. \
    && mix phx.digest

# Build Release
RUN mkdir -p /opt/release \
    && mix release \
    && mv _build/${MIX_ENV}/rel/openthink_backend /opt/release

# Create the runtime container
FROM erlang:26 as runtime

WORKDIR /usr/local/openthink_backend

COPY --from=builder /opt/release/openthink_backend .

CMD [ "bin/openthink_backend", "start" ]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=2 \
 CMD nc -vz -w 2 localhost 4000 || exit 1
