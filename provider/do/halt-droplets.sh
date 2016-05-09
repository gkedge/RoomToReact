#!/usr/bin/env bash

for droplet_name in react-ui
do
    {
        if tugboat info -q -n $droplet_name; then
            echo "Halting $droplet_name"
    
            tugboat halt -q --name=$droplet_name
            tugboat wait -q --name=$droplet_name --state=off
    
            echo "$droplet_name is halted"
         else
            echo "No $droplet_name to halt."
        fi
    } &
done

wait
echo Done halting 
 
