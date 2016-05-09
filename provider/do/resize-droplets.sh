#!/usr/bin/env bash

for droplet_name in react-ui
do
    {
        if tugboat info -q -n $droplet_name; then
            if [ $(tugboat info --porcelain -a size -n $droplet_name) != "1gb" ]; then
                echo "Halting $droplet_name"
        
                ID=$(tugboat info --porcelain -a id -n $droplet_name)
                echo "ID: $ID"
                
                tugboat halt -q --name=$droplet_name
                tugboat wait -q --name=$droplet_name --state=off
        
                echo "$droplet_name is off and ready to resize"
                
                curl -X POST https://api.digitalocean.com/v2/droplets/$ID/actions \
                -H 'Content-Type:application/json' \
                -H "Authorization: Bearer $DO_API_TOKEN" \
                -d '{"type":"resize","size":"1gb"}' > /dev/null 2>&1
                            
                echo "Status $(tugboat info --porcelain -a status -n $droplet_name)"
                
                sleep 60
                
                echo "Starting $droplet_name with new size"                
                tugboat start -q --name=$droplet_name
                tugboat wait -q --name=$droplet_name
            else 
                echo "Droplet does not need resizing."
            fi
            
        else
            echo "No $droplet_name to resize."
        fi
    } &
done

wait
echo Done resizing 
