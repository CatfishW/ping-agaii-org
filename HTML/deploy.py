import pexpect
import sys
import os

def deploy():
    password = "Clb1997521"
    host = "lobin@vpn.agaii.org"
    temp_dir = "/home/lobin/temp_frontend"
    target_dir = "/mnt/data/Yanlai/ping-agaii-org-frontend"
    files = ["index.html", "style.css", "app.js", "images"]

    print(f"Deploying to {host}...")

    # SCP to temp directory
    for f in files:
        cmd = f"scp -r {f} {host}:{temp_dir}/"
        print(f"Running: {cmd}")
        os.system(cmd)
        
    # Move to final destination using sudo
    print("Moving files to final destination...")
    ssh_cmd = f"ssh {host} \"echo '{password}' | sudo -S cp -r {temp_dir}/* {target_dir}/\""
    os.system(ssh_cmd)
    
    print("Deployment successful!")

if __name__ == "__main__":
    deploy()
