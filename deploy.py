import pexpect
import sys
import os

files = ["index.html", "style.css", "app.js"]
images = os.listdir("images")
password = "Clb1997521"
user_host = "lobin@vpn.agaii.org"
remote_dir = "/mnt/data/Yanlai/ping-agaii-org-frontend"

def run_scp(source, dest):
    print(f"Transferring {source} to {dest}...")
    child = pexpect.spawn(f"scp -o StrictHostKeyChecking=no {source} {user_host}:{dest}")
    try:
        i = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT])
        if i == 0:
            child.sendline(password)
            child.expect(pexpect.EOF)
            print(f"Success: {source}")
        elif i == 1:
            print(f"EOF encountered for {source}")
        else:
            print(f"Timeout for {source}")
    except Exception as e:
        print(f"Error for {source}: {e}")

# Create remote directory
child = pexpect.spawn(f"ssh -o StrictHostKeyChecking=no {user_host} 'mkdir -p {remote_dir}/images'")
i = child.expect(['password:', pexpect.EOF])
if i == 0:
    child.sendline(password)
    child.expect(pexpect.EOF)

# Transfer files
for f in files:
    run_scp(f, f"{remote_dir}/{f}")

for img in images:
    run_scp(f"images/{img}", f"{remote_dir}/images/{img}")

print("Deployment finished.")
