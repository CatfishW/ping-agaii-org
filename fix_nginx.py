import pexpect
import sys
import re

password = "Clb1997521"
user_host = "lobin@vpn.agaii.org"
config_path = "/www/server/panel/vhost/nginx/ping.agaii.org.conf"
new_root = "/mnt/data/Yanlai/ping-agaii-org-frontend"

def run_sudo_cmd_s(cmd_to_run):
    full_cmd = f"ssh -o StrictHostKeyChecking=no {user_host} 'echo {password} | sudo -S {cmd_to_run}'"
    child = pexpect.spawn(full_cmd, encoding='utf-8')
    child.expect(pexpect.EOF)
    return child.before

def fix_config():
    print("Reading current config...")
    # Read the file directly
    raw_content = run_sudo_cmd_s(f"cat {config_path}")
    
    # Clean the content: find the first 'server' and everything after it
    # We use re.DOTALL to match across lines
    match = re.search(r'(server\s*\{.*)', raw_content, re.DOTALL)
    if not match:
        print("Could not find 'server {' block in config!")
        return

    clean_content = match.group(1)
    # Ensure the root is correct and remove accidental sudo prompts
    # The sudo prompt usually looks like '[sudo] password for lobin: '
    clean_content = re.sub(r'\[sudo\] password for lobin: ', '', clean_content)
    clean_content = re.sub(r'root\s+[^;]+;', f'root {new_root};', clean_content)

    with open("fixed_nginx.conf", "w") as f:
        f.write(clean_content)
    
    print("Uploading fixed config...")
    child = pexpect.spawn(f"scp -o StrictHostKeyChecking=no fixed_nginx.conf {user_host}:fixed_nginx.conf")
    i = child.expect(['password:', pexpect.EOF])
    if i == 0:
        child.sendline(password)
        child.expect(pexpect.EOF)
    
    print("Applying fixed config and reloading...")
    run_sudo_cmd_s(f"cp fixed_nginx.conf {config_path}")
    test_result = run_sudo_cmd_s("nginx -t")
    print(f"Nginx test: {test_result}")
    
    if "successful" in test_result:
        run_sudo_cmd_s("nginx -s reload")
        print("Nginx reloaded successfully.")
    else:
        print("Nginx test failed, not reloading.")

fix_config()
