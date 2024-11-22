#!/bin/bash

PROJECT_ID="bubbly-display-425420-b8"
IMAGE_NAME="urna-apiv3"
IMAGE_VERSION=$(git rev-parse --short HEAD)

REGION="southamerica-east1"
# pnpm build

docker buildx build --platform=linux/amd64 -t ${IMAGE_NAME}:${IMAGE_VERSION} .

# autenticar no Google Cloud -- interação do uisuário necessária
gcloud auth configure-docker

docker tag ${IMAGE_NAME}:${IMAGE_VERSION} gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_VERSION}

# A partir daqui a coisa começa a custar!!!
# Além de parar a aplicação, tem que lembrar de excluir as imagens depois de não usar mais
docker push gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_VERSION}
gcloud run deploy ${IMAGE_NAME} --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_VERSION} --platform managed --region ${REGION} --allow-unauthenticated --port 4000

