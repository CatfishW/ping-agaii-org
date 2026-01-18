import pexpect
import sys
import re

password = "Clb1997521"
user_host = "lobin@vpn.agaii.org"
config_path = "/www/server/panel/vhost/nginx/ping.agaii.org.conf"
new_root = "/mnt/data/Yanlai/ping-agaii-org-frontend"

def run_command_with_sudo_s(cmd_to_run):
    # Use sudo -S to read password from stdin
    full_cmd = f"ssh -o StrictHostKeyChecking=no {user_host} 'echo {password} | sudo -S {cmd_to_run}'"
    child = pexpect.spawn(full_cmd)
    try:
        child.expect(pexpect.EOF)
        output = child.before.decode('utf-8')
        return output
    except Exception as e:
        print(f"Error running command {cmd_to_run}: {e}")
    return None

print("Reading config with sudo -S...")
config = run_command_with_sudo_s(f"cat {config_path}")

if config and "server" in config:
    print("Found config, updating root...")
    # Update the root directive
    new_config = re.sub(r'root\s+[^;]+;', f'root {new_root};', config)
    
    # Write to a local file
    with open("temp_nginx.conf", "w") as f:
        f.write(new_config)
    
    print("Uploading updated config...")
    child = pexpect.spawn(f"scp -o StrictHostKeyChecking=no temp_nginx.conf {user_host}:temp_nginx.conf")
    i = child.expect(['password:', pexpect.EOF])
    if i == 0:
        child.sendline(password)
        child.expect(pexpect.EOF)
        
    print("Moving config to final location and reloading Nginx...")
    run_command_with_sudo_s(f"cp temp_nginx.conf {config_path}")
    run_command_with_sudo_s("nginx -s reload")
    print("Nginx config updated and reloaded.")
else:
    print(f"Could not read config or config is empty. Output was: {config}")
