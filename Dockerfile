# 基本となるイメージを指定
FROM node:14

# アプリケーションの作業ディレクトリを設定
WORKDIR /app

# package.json、package-lock.json、init.sql、my_image_post.envをコピー
COPY package*.json ./
COPY init.sql ./
COPY .env ./
COPY /image-post/app/.env /app/app/.env
COPY /image-post/app/components/.env /app/app/components/.env

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY /image-post/app /app/app
COPY /image-post/public /app/public

# アプリケーションがリッスンするポートを指定
EXPOSE 3000

# アプリケーションを起動するコマンドを指定
CMD [ "npm", "start" ]