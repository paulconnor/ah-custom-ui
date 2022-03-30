#!/bin/bash 

rm -Rf ./flowmanager-app

cd ..
npm install; ng build --source-map=false --configuration production

cp dist/flowmanger-app docker/

cd docker/ ; docker image build -t flowmannager:1.0 .
