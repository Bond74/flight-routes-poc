# flight-routes-poc

flight-routes-poc - the AWS based solution which aggregates data from several endpoints (fake-providers of flight routes) and expoxes the aggregated items via AWS lambda-based API

## How to build
```
yarn
tsc
```
Note: the project uses yarn, it should be installed globally

## How to deploy

```
yarn sls:deploy 
```
Note: AWS creds should be saved locally before the deployment, see more details here: https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

## Solution archetecture diagram
![alt text](https://github.com/Bond74/flight-routes-poc/blob/main/flight-routes-aggregator-POC-diagram.png?raw=true)
