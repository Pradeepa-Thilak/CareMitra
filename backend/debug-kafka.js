const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runCommand(cmd, description) {
  console.log(`\n📝 ${description}:`);
  console.log(`   Command: ${cmd}`);
  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 10000 });
    if (stdout) console.log(`   Output: ${stdout.trim()}`);
    if (stderr) console.log(`   Error: ${stderr.trim()}`);
    return { success: true, stdout, stderr };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, error };
  }
}

async function main() {
  console.log('🔍 Kafka Debug Script');
  console.log('=' .repeat(50));
  
  // 1. Check Docker
  await runCommand('docker --version', 'Docker version');
  await runCommand('docker ps', 'Running containers');
  
  // 2. Check ports
  await runCommand('sudo lsof -i :9092 | head -20', 'Port 9092 usage');
  await runCommand('sudo lsof -i :2181 | head -20', 'Port 2181 usage');
  
  // 3. Check container logs
  await runCommand('docker logs kafka --tail 20', 'Kafka logs (last 20 lines)');
  await runCommand('docker logs zookeeper --tail 10', 'Zookeeper logs (last 10 lines)');
  
  // 4. Check container networking
  await runCommand('docker inspect kafka --format="{{json .NetworkSettings.Ports}}"', 'Kafka port mapping');
  await runCommand('docker exec kafka netstat -tulpn | grep 9092', 'Kafka listening ports inside container');
  
  // 5. Test connection from inside container
  await runCommand('docker exec kafka bash -c "nc -z localhost 9092 && echo Kafka port 9092 is listening"', 'Kafka port test inside container');
  
  // 6. Test connection from host
  await runCommand('timeout 3 bash -c "cat < /dev/null > /dev/tcp/localhost/9092" && echo "Host can connect to 9092" || echo "Host cannot connect to 9092"', 'Host connection test');
  
  // 7. Try to create topic directly
  await runCommand('docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list', 'List topics from inside container');
  
  console.log('\n' + '=' .repeat(50));
  console.log('Debug complete');
}

main().catch(console.error);
