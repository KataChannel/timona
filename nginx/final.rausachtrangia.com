# Main frontend service với domain tg.rausachtrangia.com
server {
    listen 80;
    server_name tg.rausachtrangia.com;

    # Đường dẫn cho Certbot xác thực
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }

    location / {
        proxy_pass http://116.118.49.243:54301;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# MinIO Storage service với domain media.rausachtrangia.com
server {
    listen 80;
    server_name media.rausachtrangia.com;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    # MinIO specific configurations
    client_max_body_size 100M;

    # Đường dẫn cho Certbot xác thực
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }

    location / {
        proxy_pass http://116.118.49.243:59000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Important for MinIO
        proxy_buffering off;
        proxy_request_buffering off;
    }
}

# API service với domain apitg.rausachtrangia.com
server {
    listen 80;
    server_name apitg.rausachtrangia.com;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";

    # API specific configurations
    client_max_body_size 50M;

    # Đường dẫn cho Certbot xác thực
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }

    location / {
        proxy_pass http://localhost:53331;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # API specific headers
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Server $host;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}