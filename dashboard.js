/**
 * License Manager Dashboard
 * A simple web dashboard for license analytics
 */

const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// Connect to database
const dbPath = path.join(__dirname, 'data/licenses.db');
const db = new sqlite3.Database(dbPath);

// Set up handlebars as the view engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create necessary directories
const viewsDir = path.join(__dirname, 'views');
const layoutsDir = path.join(viewsDir, 'layouts');
const publicDir = path.join(__dirname, 'public');
const cssDir = path.join(publicDir, 'css');
const jsDir = path.join(publicDir, 'js');

[viewsDir, layoutsDir, publicDir, cssDir, jsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create main layout if it doesn't exist
const layoutPath = path.join(layoutsDir, 'main.handlebars');
if (!fs.existsSync(layoutPath)) {
  const layoutContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>License Manager Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <header>
    <h1>License Manager Dashboard</h1>
    <nav>
      <ul>
        <li><a href="/">Overview</a></li>
        <li><a href="/games">Games</a></li>
        <li><a href="/licenses">Licenses</a></li>
        <li><a href="/users">Users</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    {{{body}}}
  </main>
  
  <footer>
    <p>&copy; ${new Date().getFullYear()} License Manager</p>
  </footer>
</body>
</html>
  `;
  fs.writeFileSync(layoutPath, layoutContent);
}

// Create CSS file if it doesn't exist
const cssPath = path.join(cssDir, 'styles.css');
if (!fs.existsSync(cssPath)) {
  const cssContent = `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f4f4;
}

header {
  background-color: #333;
  color: #fff;
  padding: 1rem;
}

header h1 {
  margin-bottom: 0.5rem;
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-right: 1rem;
}

nav ul li a {
  color: #fff;
  text-decoration: none;
}

nav ul li a:hover {
  color: #ddd;
}

main {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card h2 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.chart-container {
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.data-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.data-table tr:hover {
  background-color: #f9f9f9;
}

footer {
  text-align: center;
  padding: 1rem;
  background-color: #333;
  color: #fff;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}
  `;
  fs.writeFileSync(cssPath, cssContent);
}

// Create home view if it doesn't exist
const homePath = path.join(viewsDir, 'home.handlebars');
if (!fs.existsSync(homePath)) {
  const homeContent = `
<h1>License Analytics Dashboard</h1>

<div class="dashboard-grid">
  <div class="card">
    <h2>Total Licenses</h2>
    <div class="stat-value">{{stats.totalLicenses}}</div>
    <div class="stat-label">Active: {{stats.activeLicenses}} ({{stats.activePercentage}}%)</div>
  </div>
  
  <div class="card">
    <h2>Licenses by Game</h2>
    <div class="stat-value">{{stats.topGame.name}}</div>
    <div class="stat-label">Most popular game with {{stats.topGame.count}} licenses</div>
  </div>
  
  <div class="card">
    <h2>Recent Activity</h2>
    <div class="stat-value">{{stats.recentActivity}}</div>
    <div class="stat-label">Licenses created in the last 7 days</div>
  </div>
  
  <div class="card">
    <h2>Expiring Soon</h2>
    <div class="stat-value">{{stats.expiringSoon}}</div>
    <div class="stat-label">Licenses expiring in the next 7 days</div>
  </div>
</div>

<div class="chart-container">
  <h2>Licenses by Game</h2>
  <canvas id="gameChart"></canvas>
</div>

<div class="chart-container">
  <h2>License Creation Trend</h2>
  <canvas id="trendChart"></canvas>
</div>

<script>
  // Game distribution chart
  const gameCtx = document.getElementById('gameChart').getContext('2d');
  const gameChart = new Chart(gameCtx, {
    type: 'pie',
    data: {
      labels: {{{json gameData.labels}}},
      datasets: [{
        data: {{{json gameData.data}}},
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
  
  // Trend chart
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  const trendChart = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: {{{json trendData.labels}}},
      datasets: [{
        label: 'New Licenses',
        data: {{{json trendData.data}}},
        borderColor: '#36A2EB',
        tension: 0.1,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
</script>
  `;
  fs.writeFileSync(homePath, homeContent);
}

// Create games view
const gamesPath = path.join(viewsDir, 'games.handlebars');
if (!fs.existsSync(gamesPath)) {
  const gamesContent = `
<h1>Games Overview</h1>

<div class="chart-container">
  <h2>Licenses by Game</h2>
  <canvas id="gameChart"></canvas>
</div>

<table class="data-table">
  <thead>
    <tr>
      <th>Game</th>
      <th>Total Licenses</th>
      <th>Active Licenses</th>
      <th>Average Duration (days)</th>
      <th>Lifetime Licenses</th>
    </tr>
  </thead>
  <tbody>
    {{#each games}}
    <tr>
      <td>{{name}}</td>
      <td>{{total}}</td>
      <td>{{active}}</td>
      <td>{{averageDuration}}</td>
      <td>{{lifetime}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<script>
  // Game distribution chart
  const gameCtx = document.getElementById('gameChart').getContext('2d');
  const gameChart = new Chart(gameCtx, {
    type: 'bar',
    data: {
      labels: {{{json chartData.labels}}},
      datasets: [{
        label: 'Total Licenses',
        data: {{{json chartData.total}}},
        backgroundColor: '#36A2EB'
      }, {
        label: 'Active Licenses',
        data: {{{json chartData.active}}},
        backgroundColor: '#4BC0C0'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
</script>
  `;
  fs.writeFileSync(gamesPath, gamesContent);
}

// Create licenses view
const licensesPath = path.join(viewsDir, 'licenses.handlebars');
if (!fs.existsSync(licensesPath)) {
  const licensesContent = `
<h1>License Management</h1>

<div class="filters">
  <form method="GET" action="/licenses">
    <select name="game">
      <option value="">All Games</option>
      {{#each games}}
      <option value="{{value}}" {{#if selected}}selected{{/if}}>{{name}}</option>
      {{/each}}
    </select>
    
    <select name="status">
      <option value="">All Statuses</option>
      <option value="active" {{#if filters.activeSelected}}selected{{/if}}>Active</option>
      <option value="expired" {{#if filters.expiredSelected}}selected{{/if}}>Expired</option>
      <option value="inactive" {{#if filters.inactiveSelected}}selected{{/if}}>Inactive</option>
    </select>
    
    <button type="submit">Filter</button>
  </form>
</div>

<table class="data-table">
  <thead>
    <tr>
      <th>License Key</th>
      <th>Game</th>
      <th>User</th>
      <th>Issue Date</th>
      <th>Expiration</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {{#each licenses}}
    <tr>
      <td>{{licenseKey}}</td>
      <td>{{game}}</td>
      <td>{{userName}}</td>
      <td>{{issueDate}}</td>
      <td>{{expiration}}</td>
      <td>{{status}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<div class="pagination">
  {{#if pagination.hasPrev}}
  <a href="/licenses?page={{pagination.prev}}{{pagination.queryString}}">&laquo; Previous</a>
  {{/if}}
  
  <span>Page {{pagination.current}} of {{pagination.total}}</span>
  
  {{#if pagination.hasNext}}
  <a href="/licenses?page={{pagination.next}}{{pagination.queryString}}">Next &raquo;</a>
  {{/if}}
</div>
  `;
  fs.writeFileSync(licensesPath, licensesContent);
}

// Create users view
const usersPath = path.join(viewsDir, 'users.handlebars');
if (!fs.existsSync(usersPath)) {
  const usersContent = `
<h1>User Analytics</h1>

<div class="chart-container">
  <h2>Top Users by License Count</h2>
  <canvas id="userChart"></canvas>
</div>

<table class="data-table">
  <thead>
    <tr>
      <th>User</th>
      <th>Total Licenses</th>
      <th>Active Licenses</th>
      <th>Games</th>
      <th>First License</th>
      <th>Latest License</th>
    </tr>
  </thead>
  <tbody>
    {{#each users}}
    <tr>
      <td>{{name}}</td>
      <td>{{totalLicenses}}</td>
      <td>{{activeLicenses}}</td>
      <td>{{games}}</td>
      <td>{{firstLicense}}</td>
      <td>{{latestLicense}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>

<script>
  // User chart
  const userCtx = document.getElementById('userChart').getContext('2d');
  const userChart = new Chart(userCtx, {
    type: 'bar',
    data: {
      labels: {{{json chartData.labels}}},
      datasets: [{
        label: 'Total Licenses',
        data: {{{json chartData.data}}},
        backgroundColor: '#9966FF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
</script>
  `;
  fs.writeFileSync(usersPath, usersContent);
}

// Helper function to format JSON for handlebars
app.engine('handlebars', engine({
  helpers: {
    json: function(context) {
      return JSON.stringify(context);
    }
  }
}));

// Authentication middleware (simple for this example)
function authenticate(req, res, next) {
  // In a real application, you would implement proper authentication
  // For this example, we'll just check for a token in the query string
  const authToken = req.query.token || '';
  
  if (process.env.DASHBOARD_TOKEN && authToken === process.env.DASHBOARD_TOKEN) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

// Routes
app.get('/', authenticate, async (req, res) => {
  try {
    // Get total licenses
    const totalLicenses = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM licenses', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    // Get active licenses
    const activeLicenses = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM licenses WHERE is_active = 1 AND (expiration_date IS NULL OR expiration_date > ?)',
        [Math.floor(Date.now() / 1000)],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
    
    // Calculate active percentage
    const activePercentage = totalLicenses > 0 ? Math.round((activeLicenses / totalLicenses) * 100) : 0;
    
    // Get licenses by game
    const gameDistribution = await new Promise((resolve, reject) => {
      db.all('SELECT language, COUNT(*) as count FROM licenses GROUP BY language ORDER BY count DESC', 
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    
    // Get top game
    const topGame = gameDistribution.length > 0 ? {
      name: getGameName(gameDistribution[0].language),
      count: gameDistribution[0].count
    } : { name: 'None', count: 0 };
    
    // Get recent activity
    const recentActivity = await new Promise((resolve, reject) => {
      const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
      db.get('SELECT COUNT(*) as count FROM licenses WHERE issue_date > ?',
        [oneWeekAgo],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
    
    // Get licenses expiring soon
    const expiringSoon = await new Promise((resolve, reject) => {
      const now = Math.floor(Date.now() / 1000);
      const oneWeekLater = now + (7 * 24 * 60 * 60);
      db.get('SELECT COUNT(*) as count FROM licenses WHERE is_active = 1 AND expiration_date IS NOT NULL AND expiration_date > ? AND expiration_date < ?',
        [now, oneWeekLater],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
    
    // Prepare data for game chart
    const gameChartData = {
      labels: gameDistribution.map(item => getGameName(item.language)),
      data: gameDistribution.map(item => item.count)
    };
    
    // Get license creation trend (last 14 days)
    const trendData = await getLicenseTrend(14);
    
    res.render('home', {
      stats: {
        totalLicenses,
        activeLicenses,
        activePercentage,
        topGame,
        recentActivity,
        expiringSoon
      },
      gameData: gameChartData,
      trendData
    });
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/games', authenticate, async (req, res) => {
  try {
    // Get licenses by game with details
    const games = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          language,
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 AND (expiration_date IS NULL OR expiration_date > ?) THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN expiration_date IS NULL THEN 1 ELSE 0 END) as lifetime,
          AVG(CASE WHEN expiration_date IS NOT NULL THEN (expiration_date - issue_date) / 86400.0 ELSE NULL END) as avg_duration
        FROM licenses 
        GROUP BY language 
        ORDER BY total DESC
      `, [Math.floor(Date.now() / 1000)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Format game data for display
    const gameData = games.map(game => ({
      name: getGameName(game.language),
      total: game.total,
      active: game.active,
      lifetime: game.lifetime,
      averageDuration: game.avg_duration ? Math.round(game.avg_duration) : 'N/A'
    }));
    
    // Prepare chart data
    const chartData = {
      labels: gameData.map(game => game.name),
      total: gameData.map(game => game.total),
      active: gameData.map(game => game.active)
    };
    
    res.render('games', {
      games: gameData,
      chartData
    });
  } catch (error) {
    console.error('Error rendering games page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/licenses', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    // Get filter parameters
    const gameFilter = req.query.game || '';
    const statusFilter = req.query.status || '';
    
    // Build query conditions
    let conditions = [];
    let params = [];
    let queryString = '';
    
    if (gameFilter) {
      conditions.push('language = ?');
      params.push(gameFilter);
      queryString += `&game=${gameFilter}`;
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    if (statusFilter === 'active') {
      conditions.push('is_active = 1 AND (expiration_date IS NULL OR expiration_date > ?)');
      params.push(now);
      queryString += '&status=active';
    } else if (statusFilter === 'expired') {
      conditions.push('expiration_date IS NOT NULL AND expiration_date <= ?');
      params.push(now);
      queryString += '&status=expired';
    } else if (statusFilter === 'inactive') {
      conditions.push('is_active = 0');
      queryString += '&status=inactive';
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get filtered licenses
    const licenses = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, license_key, language, user_id, user_name, email, issue_date, expiration_date, is_active 
        FROM licenses 
        ${whereClause}
        ORDER BY issue_date DESC
        LIMIT ? OFFSET ?
      `, [...params, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Get total count for pagination
    const totalCount = await new Promise((resolve, reject) => {
      db.get(`
        SELECT COUNT(*) as count 
        FROM licenses 
        ${whereClause}
      `, params, (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    // Format license data
    const licenseData = licenses.map(license => {
      const now = Math.floor(Date.now() / 1000);
      let status = 'Unknown';
      
      if (license.is_active === 0) {
        status = 'Inactive';
      } else if (!license.expiration_date) {
        status = 'Lifetime';
      } else if (license.expiration_date <= now) {
        status = 'Expired';
      } else {
        status = 'Active';
      }
      
      return {
        licenseKey: license.license_key,
        game: getGameName(license.language),
        userName: license.user_name || 'Unassigned',
        issueDate: formatDate(license.issue_date),
        expiration: license.expiration_date ? formatDate(license.expiration_date) : 'Never',
        status
      };
    });
    
    // Get all games for filter dropdown
    const games = [
      { name: 'Fortnite', value: 'fortnite' },
      { name: 'FiveM', value: 'fivem' },
      { name: 'GTA V', value: 'gtav' },
      { name: 'Escape From Tarkov', value: 'eft' },
      { name: 'Black Ops 6', value: 'bo6' },
      { name: 'Warzone', value: 'warzone' },
      { name: 'Counter-Strike 2', value: 'cs2' }
    ].map(game => ({
      ...game,
      selected: game.value === gameFilter
    }));
    
    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    
    res.render('licenses', {
      licenses: licenseData,
      games,
      filters: {
        activeSelected: statusFilter === 'active',
        expiredSelected: statusFilter === 'expired',
        inactiveSelected: statusFilter === 'inactive'
      },
      pagination: {
        current: page,
        total: totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prev: page - 1,
        next: page + 1,
        queryString
      }
    });
  } catch (error) {
    console.error('Error rendering licenses page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/users', authenticate, async (req, res) => {
  try {
    // Get user data
    const users = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          user_id,
          user_name,
          COUNT(*) as total_licenses,
          SUM(CASE WHEN is_active = 1 AND (expiration_date IS NULL OR expiration_date > ?) THEN 1 ELSE 0 END) as active_licenses,
          MIN(issue_date) as first_license,
          MAX(issue_date) as latest_license
        FROM licenses 
        WHERE user_id IS NOT NULL 
        GROUP BY user_id 
        ORDER BY total_licenses DESC
        LIMIT 20
      `, [Math.floor(Date.now() / 1000)], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    // Get games per user
    const userGames = await Promise.all(users.map(async user => {
      return new Promise((resolve, reject) => {
        db.all('SELECT DISTINCT language FROM licenses WHERE user_id = ?', 
          [user.user_id], 
          (err, rows) => {
            if (err) reject(err);
            else resolve({ 
              userId: user.user_id, 
              games: rows.map(row => getGameName(row.language))
            });
          }
        );
      });
    }));
    
    // Format user data
    const userData = users.map(user => {
      const userGameList = userGames.find(g => g.userId === user.user_id) || { games: [] };
      
      return {
        name: user.user_name,
        totalLicenses: user.total_licenses,
        activeLicenses: user.active_licenses,
        games: userGameList.games.join(', '),
        firstLicense: formatDate(user.first_license),
        latestLicense: formatDate(user.latest_license)
      };
    });
    
    // Prepare chart data (top 10 users)
    const chartData = {
      labels: userData.slice(0, 10).map(user => user.name),
      data: userData.slice(0, 10).map(user => user.totalLicenses)
    };
    
    res.render('users', {
      users: userData,
      chartData
    });
  } catch (error) {
    console.error('Error rendering users page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Helper function to get game name from code
function getGameName(gameCode) {
  const gameMap = {
    'fortnite': 'Fortnite',
    'fivem': 'FiveM',
    'gtav': 'GTA V',
    'eft': 'Escape From Tarkov',
    'bo6': 'Black Ops 6',
    'warzone': 'Warzone',
    'cs2': 'Counter-Strike 2'
  };
  
  return gameMap[gameCode] || gameCode;
}

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
}

// Helper function to get license trend data
async function getLicenseTrend(days) {
  const labels = [];
  const data = [];
  
  // Generate dates for the last N days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString());
    
    // Get license count for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM licenses WHERE issue_date >= ? AND issue_date <= ?',
        [Math.floor(startOfDay.getTime() / 1000), Math.floor(endOfDay.getTime() / 1000)],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
    
    data.push(count);
  }
  
  return { labels, data };
}

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Dashboard running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down dashboard server...');
  server.close(() => {
    console.log('Dashboard server closed');
    db.close();
    process.exit(0);
  });
});

module.exports = { app, server }; 