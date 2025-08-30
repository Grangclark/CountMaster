FROM nginx:alpine

# 設定ファイルをコピー
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]