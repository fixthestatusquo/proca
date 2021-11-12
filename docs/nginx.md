to check, can we use a regex on the referer (page that embeded the url) to automatically fetch the right widget?

regex WIP

# /https?:\/\/(www.|)([^\?]+)(\?.*)?/

# /([^\?]+)(\?.*)?/g

location /d {
gzip_static on;

# brotli_static on;

# add_header X-uri $uri;

    add_header content-Type application/javascript;
    root /var/www/nodepetition/build;

# index index.js;

    try_files $uri $uri/index.js =404;

}
