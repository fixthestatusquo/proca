
For recurring donations, create a product
create a 1 euro product

Do we need to create a price for each amount?

curl https://api.stripe.com/v1/prices \
  -u sk_test_xxxxxx: \
  -d product="{{PRODUCT_ID}}" \
  -d unit_amount=1000 \
  -d currency=eur \
  -d recurring[interval]=month

