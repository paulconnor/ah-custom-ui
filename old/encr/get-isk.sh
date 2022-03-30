(kubectl get secrets -n ssp ssp-ssp-keys-isk -o jsonpath="{.data.tls\.key}" | base64 --decode; echo) > isk.key
(kubectl get secrets -n ssp ssp-ssp-keys-isk -o jsonpath="{.data.tls\.crt}" | base64 --decode; echo) > isk.crt

#(kubectl get secrets -n ssp ssp-ssp-keys-mek -o jsonpath="{.data.tls\.key}" | base64 --decode; echo) > mek.key
#(kubectl get secrets -n ssp ssp-ssp-keys-mek -o jsonpath="{.data.tls\.crt}" | base64 --decode; echo) > mek.crt

openssl x509 -in isk.crt -text
openssl rsa -in isk.key -text
