import pexpect
import sys
import os

files = ["index.html", "style.css", "app.js"]
images = os.listdir("images")
password = "Clb1997521"
user_host = "lobin@vpn.agaii.org"
target_dir = "/mnt/data/Yanlai/ping-agaii-org-frontend"
temp_dir = "/home/lobin/temp_frontend"

def run_cmd(cmd, provide_password=True):
    print(f"Running: {cmd}")
    child = pexpect.spawn(cmd, encoding='utf-8')
    # child.logfile = sys.stdout
    try:
        if provide_password:
            i = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
            if i == 0:
                child.sendline(password)
                child.expect(pexpect.EOF)
            else:
                # Might not have asked for password
                child.expect(pexpect.EOF)
        else:
            child.expect(pexpect.EOF)
        return child.before
    except Exception as e:
        print(f"Error: {e}")
    return None

def run_sudo_cmd(cmd):
    # Use sudo -S
    full_cmd = f"ssh -o StrictHostKeyChecking=no {user_host} 'echo {password} | sudo -S {cmd}'"
    return run_cmd(full_cmd, provide_password=False)

# 1. Create temp dir on remote
run_cmd(f"ssh -o StrictHostKeyChecking=no {user_host} 'mkdir -p {temp_dir}/images'")

# 2. Transfer files to temp dir
for f in files:
    run_cmd(f"scp -o StrictHostKeyChecking=no {f} {user_host}:{temp_dir}/{f}")

for img in images:
    run_cmd(f"scp -o StrictHostKeyChecking=no images/{img} {user_host}:{temp_dir}/images/{img}")

# 3. Move from temp to target using sudo
print("Moving files to target directory with sudo...")
run_sudo_cmd(f"cp -r {temp_dir}/* {target_dir}/")
run_sudo_cmd(f"rm -rf {temp_dir}")

print("Deployment complete.")
