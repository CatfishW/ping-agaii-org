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
        child = pexpect.spawn(cmd)
        i = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT])
        if i == 0:
            child.sendline(password)
            child.expect(pexpect.EOF)
        
    # Move to final destination using sudo
    ssh_cmd = f"ssh -o PasswordAuthentication=yes {host}"
    child = pexpect.spawn(ssh_cmd)
    try:
        i = child.expect(['password:', 'lobin@', pexpect.TIMEOUT], timeout=30)
        if i == 0:
            child.sendline(password)
            child.expect('lobin@')
        elif i == 2:
            print("SSH connection timed out.")
            return

        # Run sudo command
        print("Running sudo copy command...")
        child.sendline(f"echo '{password}' | sudo -S cp -r {temp_dir}/* {target_dir}/")
        child.expect('lobin@')
        print("Deployment successful!")
    except Exception as e:
        print(f"Error during SSH/Sudo phase: {e}")
        print(f"Buffer: {child.before}")

if __name__ == "__main__":
    deploy()
