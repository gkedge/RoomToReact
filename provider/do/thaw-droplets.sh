#!/usr/bin/env bash

_DEBUG="off"
function DEBUG()
{
 [ "${_DEBUG}" == "on" ] &&  $@
}

_DEBUG_EX="off"
function DEBUG_EX()
{
 [ "${_DEBUG_EX}" == "on" ] &&  $@
}

for droplet_name in react-ui
do
    {  
        DEBUG echo "Is ${droplet_name} in droplet form already?"
        
        if ! tugboat info -q -n ${droplet_name}; then
            awk_command1="/^$droplet_name/{ match(\$0, /id: ([0-9]*)/); print substr(\$0, RSTART + length(\"id: \"), RLENGTH - length(\"id: \")) }"
            DEBUG_EX echo "awk(1) command: ${awk_command1}"
            
            image_id=$(tugboat images -p | awk "$awk_command1" | sort -r | head -n 1)
            DEBUG_EX echo "${droplet_name} image ID: ${image_id}"
            
            if [[ ${image_id} ]]; then
                echo "Creating $droplet_name from $image_id..."
                
                quiet="-q";
                
                if [ ${_DEBUG} = "on" ]; then
                    quiet=""
                fi
                
                DEBUG set -x
                tugboat create ${quiet} --size=4gb ${droplet_name} -i ${image_id} --keys=1559563,1515932
                tugboat wait ${quiet} --name=${droplet_name}
                DEBUG set +x
                
                echo "${droplet_name} created from ${image_id}."
                
                droplet_ip=$(tugboat info --name=${droplet_name} --attribute=ip4 --porcelain)
                DEBUG_EX echo "${droplet_name} IP: ${droplet_ip}"
                
                grep_inventory_pattern="^$droplet_name ansible_ssh_host=[0-9.]*$"
                DEBUG_EX echo "grep(1) inventory pattern: ${grep_inventory_pattern}"
                
                if grep "$grep_inventory_pattern" -q inventory; then
                    DEBUG set -x
                    sed -i.bak 's/'"$grep_inventory_pattern"'/'"$droplet_name ansible_ssh_host=$droplet_ip"'/' inventory
                    DEBUG set +x
                    echo "inventory file updated with new IP: $droplet_ip"
                else
                    echo "inventory file does not contain: $grep_inventory_pattern; added IP: $droplet_ip"
                    echo "${droplet_name} ansible_ssh_host=${droplet_ip}" >> inventory
                fi
                echo "Run: % ansible-playbook ../../provision/ansible/playbooks/post-thaw.yml --ask-vault-pass"
            else
                echo "${droplet_name} has no snapshots"
            fi
        else
            echo "${droplet_name} is already created"
        fi 
    } &
done

wait
echo Done
