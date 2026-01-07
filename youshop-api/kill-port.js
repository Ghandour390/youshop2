const { execSync } = require('child_process');

const port = process.argv[2] || 3000;

try {
  const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8' });
  const lines = result.split('\n').filter(line => line.includes('LISTENING'));
  
  lines.forEach(line => {
    const pid = line.trim().split(/\s+/).pop();
    if (pid && !isNaN(pid)) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`✓ Killed process ${pid} on port ${port}`);
      } catch (e) {}
    }
  });
} catch (e) {
  console.log(`✓ Port ${port} is free`);
}
