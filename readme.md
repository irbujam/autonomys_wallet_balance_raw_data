How to use:
- save all files from latest release in a folder on local computer
- copy contents of sample-balance-config.txt to a new file and save it in the same folder. Name the new file as balance-config.txt
- adjust balance-config.txt to match your wallet address. Adjust other parameters as necessary if not using preset defaults.
- run chain_info.ps1 file in powershell

**Requirements:**
- powershell is installed (Windows should have powershell pre-installed. For installing powershell on linux see https://learn.microsoft.com/en-us/powershell/scripting/install/install-ubuntu?view=powershell-7.4)
- install dependencies to use wallet balance feature as outlined in steps below:

Instructions for Windows OS:
- open powershell session
- type winget install nodejs and press enter
- close powershell session 
- open a new powershell session
- type npm install @polkadot/api and press enter
- close powershell session

Note: powershell session is needed by default to use wallet balance feature, To enable windows command use follow steps below:

> Verify the PATH Environment Variable:
- Open System Properties: Right-click on This PC (or Computer), and select Properties.
- Advanced System Settings: In the left-hand menu, click on Advanced system settings.
- Environment Variables: In the System Properties window, click Environment Variables.
> Edit PATH:
- In the System variables section, scroll down and find the Path variable. Click on Edit.
- Make sure the path C:\Program Files\nodejs\ is included in the list of paths. If it's not, add it by clicking New and typing C:\Program Files\nodejs\.
- Restart Command Prompt: After updating the PATH, close and reopen Command Prompt for the changes to take effect.

Instructions for Linux OS:
open shell and type following command(s) and press enter 
- sudo apt install nodejs -y && sudo apt install npm -y && npm install @polkadot/api
