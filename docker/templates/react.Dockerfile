FROM --platform=linux/arm64 node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
# Normally we'd serve via nginx, but for sandbox we can just run a static server 
# or run dev server if vite
RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
