#!/usr/bin/env bash

for droplet_name in react-ui
do
    {  
        if ! tugboat info -q -n $droplet_name; then
            echo "Creating $droplet_name..."
            
            tugboat create -q $droplet_name --keys=1559563,1538923
            tugboat wait -q --name=$droplet_name
    
            echo "$droplet_name created"
            
            IP=$(tugboat info --name=$droplet_name --attribute=ip4 --porcelain)
            
            PATTERN="^$droplet_name ansible_ssh_host=[0-9.]*$"
            
            if grep "$PATTERN0" -q inventory; then
                sed -i.bak 's/'"$PATTERN"'/'"$droplet_name ansible_ssh_host=$IP"'/' inventory
            else
                echo "$droplet_name ansible_ssh_host=$IP" >> inventory
            fi
        else
            echo "$droplet_name already exists"
        fi
    } &
done

wait
echo Done creating 
