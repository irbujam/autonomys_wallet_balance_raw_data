<#  ------------------------------------------------------------------------------------------------
	Script location on Github: https://github.com/irbujam/autonomys_wallet_balance_raw_data
	--------------------------------------------------------------------------------------------- #>


function  fMain() {
$script:_duration = "all"
$script:_vlt_address = ""
$script:_node_url = ""
$script:_block_speed = 0

	Clear-Host
	fReloadConfig
	####
	$_c_info = ""
	if ($script:_block_speed -ne 0 -and $script:_vlt_address.Length -gt 0 -and $script:_vlt_address -ne $null) {
		$_b_windows_host = fCheckPlatformType
		try {
			Write-Host "Processing, please wait..."
			if ($_b_windows_host)
			{
				$_c_info = node .\chain_info.js $script:_node_url $script:_vlt_address $script:_duration $script:_block_speed
			}
			else
			{
				$_c_info = node ./chain_info.js $script:_node_url $script:_vlt_address $script:_duration $script:_block_speed
			}
		}
		catch {}
	}
	#
	$_c_info | Out-File ./autonomys-balance-raw-data.json
	Write-Host "Finished...Data written to file 'Autonomys-balance-raw-data.json' in current folder."
	
	# ps objects from json - SAVED for later use
	<#
	$_ps_obj_arr =  ConvertFrom-Json -InputObject $_c_info
	foreach ($_ps_obj in $_ps_obj_arr.Response)
	{
		Write-Host "Block: " $_ps_obj.Block -nonewline
		Write-Host ", " -nonewline
		Write-Host "Balance: " $_ps_obj.Balance -nonewline
		Write-Host ", " -nonewline
		Write-Host "Timestamp: " $_ps_obj.Timestamp
	}
	#>	
}

function fReloadConfig() {
	$_configFile = "./balance-config.txt"
	$_pattern_to_match = "="
	$_ip_arr = Get-Content -Path $_configFile | Select-String -Pattern $_pattern_to_match

	for ($arrPos = 0; $arrPos -lt $_ip_arr.Count; $arrPos++)
	{
		if ($_ip_arr[$arrPos].toString().Trim(' ') -ne "" -and $_ip_arr[$arrPos].toString().IndexOf("#") -lt 0) {
			$_config = $_ip_arr[$arrPos].toString().split($_pattern_to_match).Trim(" ")
			$_ip_type = $_config[0].toString()
			if ($_ip_type.toLower().IndexOf("duration-to-pull") -ge 0) { $script:_duration = $_config[1].toString()}
			elseif ($_ip_type.toLower().IndexOf("wallet-address") -ge 0) { $script:_vlt_address = $_config[1].toString() }
			elseif ($_ip_type.toLower().IndexOf("block-speed") -ge 0) { $script:_block_speed = $_config[1].toString() }
			elseif ($_ip_type.toLower().IndexOf("rpc-node-url") -ge 0) { $script:_node_url = $_config[1].toString() }
		}
	}
}

function fCheckPlatformType () {
	$_b_windows_os = $true
	$_env = [System.Environment]::OSVersion.Platform
	Switch ($_env) {
		Win32NT {
			$_b_windows_os = $true
		}
		Unix {
			$_b_windows_os = $false
		}
		#default {
		#	$_b_windows_os = $false
		#}
	}
	
	return $_b_windows_os
}

fMain
