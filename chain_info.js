const { ApiPromise, WsProvider } = require('@polkadot/api');

// Save the original process.stdout.write function to restore later
const originalStdoutWrite = process.stdout.write;

// Redirect stdout and stderr to null to suppress all logs
//process.stdout.write = function() {};  // Suppresses all stdout (info/debug)
process.stderr.write = function() {};  // Suppresses all stderr (error/warnings)

async function trackBalanceTrend(io_node_url, io_vlt_addr, io_duration, io_block_speed) {
	const wsProvider = new WsProvider(io_node_url); // WebSocket connection to the Polkadot network
	const api = await ApiPromise.create({ provider: wsProvider });

	// Get the current block hash
	const currentBlockHash = await api.rpc.chain.getBlockHash();  // Get the current block hash
	const currentBlockHeader = await api.rpc.chain.getHeader(currentBlockHash);  // Get the block header
	const currentBlockNumber = currentBlockHeader.number.toNumber();  // Get the block number
	//console.log(`Current Block: ${currentBlockNumber}`);

	// Query the balance of the account at the current block
	const { data: { free: currentBalance } } = await api.query.system.account(io_vlt_addr);
	//console.log(`Current Balance: ${currentBalance.toString()}`);

	// Query balances oevr a period
	//const block_speed = Math.floor(6.5);												//seconds per block, moved to read from config file
	const block_speed = Math.floor(Number(io_block_speed));								//seconds per block, from config file
	var blocks_per_day = Math.floor((60 / block_speed) * 60 * 24); 						// [1 block in 6s = (60/6)*60*24 per day] ~ 14440
	var max_history_days = Math.floor(currentBlockNumber / blocks_per_day);
	var remainder = currentBlockNumber % blocks_per_day;
	if (remainder > 0) { max_history_days += 1 };
	var upper_range = max_history_days;
	var multiplier = 1;
	switch (io_duration) {
	case 'day':
		upper_range = 6;
		multiplier = 1;
		break;
	case 'week':
		upper_range = Math.floor(max_history_days / 7) - 1;					//7 days in a week, subtracting genesis week from total weeks since genesis for calc
		multiplier = 7;										//7 days in a week
		break;
	case 'month':
		upper_range = Math.floor(max_history_days / 30);	//assuming 30 day in a month
		multiplier = 7 * Math.floor(30 / 7); 					//week in a month ~ 4
		break;
	case 'year':
		upper_range = Math.floor(max_history_days / 365);  //365 days of a year
		multiplier = 7 * 52;								//52 weeks in a year
		break;
	default :
		upper_range = max_history_days - 1;
		multiplier = 1;
		break;
	};
	//
	var b_at_least_one_block_found = false;
	var resp_json = '{"Response":';
	for (let i = 0; i <= upper_range; i++) {
		const previousBlockHash = await api.rpc.chain.getBlockHash(currentBlockNumber - (i * blocks_per_day * multiplier));

		// Use the .at() method on the API instance to query at the specific block hash
		const apiAt = await api.at(previousBlockHash);  // Get API instance for a specific block hash

		// Query balance at the specific block
		const { data: { free: pastBalance } } = await apiAt.query.system.account(io_vlt_addr);

		// Query the timestamp for the specific block
		const blockTimestamp = await apiAt.query.timestamp.now(); // Retrieves the block timestamp (milliseconds)
        
		// Convert timestamp to Date
		const timestampDate = new Date(blockTimestamp.toNumber());

		const previousBlockHeader = await api.rpc.chain.getHeader(previousBlockHash);
		const previousBlockNumber = previousBlockHeader.number.toNumber();  // Get previous block number
        
		if (i==0) {
			resp_json += '[{"Block":' + '"' + previousBlockNumber + '","Balance":"' + pastBalance.toString() + '","Timestamp":"' + timestampDate + '"}';
		}
		else {
			resp_json += ',{"Block":' + '"' + previousBlockNumber + '","Balance":"' + pastBalance.toString() + '","Timestamp":"' + timestampDate + '"}';
		};
		b_at_least_one_block_found = true
		// Output the balance and timestamp for the specific block
		//process.stdout.write(`Block ${previousBlockNumber} - Balance: ${pastBalance.toString()} | Timestamp: ${timestampDate}`);
	};
	if (b_at_least_one_block_found == true) { resp_json += ']' } ;
	resp_json += '}';
	
	// Restore stdout to display the balance
	process.stdout.write = originalStdoutWrite;
    
	process.stdout.write(resp_json);

	await api.disconnect();
}

const nodeUrl = process.argv[2];
const accountId = process.argv[3];
const duration = process.argv[4];
const blockSpeed = process.argv[5];
trackBalanceTrend(nodeUrl, accountId, duration, blockSpeed).catch(console.error);
