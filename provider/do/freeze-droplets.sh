#!/usr/bin/env bash

for droplet_name in react-ui
do
    {
        if tugboat info -q -n $droplet_name; then
            echo "Halting $droplet_name"
    
            tugboat halt -q --name=$droplet_name
            tugboat wait -q --name=$droplet_name --state=off
    
            echo "$droplet_name is off and ready to snap $droplet_snap"
            
            droplet_snap="$droplet_name"
            tugboat snapshot $droplet_snap -q --name=$droplet_name
            # DigitalOcean immediately restarts a droplet after a snap
            # completes; wait for it to be active.
            tugboat wait -q --name=$droplet_name
            
            echo "Snap $droplet_snap done"
            sleep 15
            
            echo "Halting $droplet_name"
            tugboat halt -q --name=$droplet_name
            tugboat wait -q --name=$droplet_name --state=off
            
            echo "$droplet_name is off and ready to destroy"
            tugboat destroy -q --name=$droplet_name  --confirm
        else
            echo "No $droplet_name to freeze."
        fi
    } &
done

wait
echo Done mothballing 
