# Helm Chart for AuthHub Sample Custom UI for authentication via flowURL

## ASSUMPTIONS:
- To be used to add second factor AuthN to Siteminder protected resources.
- User credentials exist for SMSOTP


## 1. Create AuthHub application and policy for the custom-ui application  

- AuthHub application: clientCredentials grant and similar Authorization rights as the demoClient.  
- AuthHub policy: include SMSOTP for second factor only  

## 2. Add the Helm Chart and deploy

> helm repo add ah-custom-ui https://paulconnor.github.io/ah-custom-ui/

> helm repo update


## 3. Install 

> kubectl create ns custom-ui

> export CLIENTID=\<AuthHub Application Client ID\>

> export CLIENTSECRET=\<AuthHub Application Client Secret\>

> export SSPHOST=\<AuthHub SSP Host FQDN\>

> helm install custom-ui ah-custom-ui/custom-ui -n custom-ui \\  
>     --set customui.sspHost=${SSPHOST} \\  
>     --set customui.clientId=${CLIENTID} \\  
>     --set customui.clientSecret=${CLIENTSECRET}

....Wait for the Pods and Services to complete startup. This could take several minutes 

> kubectl get pods,svc -n custom-ui


## 4. Update your DNS or hosts file with the following

> kubectl get svc -n custom-ui | grep customui-auth | awk '{print $4 " auth.customui.com" }'

> kubectl get svc -n custom-ui | grep customui-cms | awk '{print $4 " cms.customui.com" }'

## 5. Update the flowURL parameter on the AuthHub application you will be using

{  
  ...  
  "flowURL": "http://\<ip addr for auth.customui.com above\>/login",  
  ...  
}  
  
