# Helm Chart for AuthHub Sample Custom UI for authentication via flowURL

## 1. Add the Helm Chart and deploy

> helm repo add ah-custom-ui https://paulconnor.github.io/ah-custom-ui/

> helm repo update


## 2. Install 

kubectl create ns custom-ui

helm install custom-ui ah-custom-ui/custom-ui -n custom-ui

....Wait for the Pods and Services to complete startup. This could take several minutes 

kubectl get pods,svc -n custom-ui


## 3. Update your DNS or hosts file with the following

> kubectl get svc -n custom-ui | grep customui-auth | awk '{print $4 " auth.customui.com" }'
> kubectl get svc -n custom-ui | grep customui-cms | awk '{print $4 " cms.customui.com" }'

## 4. Update the flowURL parameter on the AuthHub application you will be using

{ 
  ...
  "flowURL": "http://<ip addr for auth.customui.com above>/login",
  ...
}
  
