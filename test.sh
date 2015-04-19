#!/bin/sh
curl -v -H "Content-Type: application/json" -X PUT localhost:3000/api/v1/sensor\?account=5534084abd970cf5b5aca880\&sensor=tempature\&value=30 
