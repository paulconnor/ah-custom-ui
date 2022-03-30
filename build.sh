docker build -f Dockerfile.auth -t pconnor/custom-ui-auth:latest .
docker build -f Dockerfile.cms -t  pconnor/custom-ui-cms:latest .
docker push pconnor/custom-ui-cms:latest
docker push pconnor/custom-ui-auth:latest
