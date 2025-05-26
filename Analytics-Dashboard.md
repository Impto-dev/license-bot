# 📊 Analytics Dashboard

The Discord License Manager Bot includes a comprehensive analytics dashboard that provides visual insights into your license data and usage patterns.

## Dashboard Access

The dashboard runs on port 3001 by default and can be accessed at:

```
http://your-server:3001/?token=your_dashboard_token
```

The access token is defined in your `.env` file as `DASHBOARD_TOKEN`. For security reasons, keep this token private and share it only with authorized administrators.

## Dashboard Features

### Overview Section

![Dashboard Overview](https://via.placeholder.com/800x400?text=Dashboard+Overview)

The main overview provides a quick snapshot of your license system:

- **Total Licenses**: Count of all licenses in the system
- **Active Licenses**: Number and percentage of currently active licenses
- **Expiring Soon**: Licenses expiring in the next 7 days
- **Recent Activity**: Latest license operations (creation, assignment, expiration)

### Game Distribution

![Game Distribution](https://via.placeholder.com/800x300?text=Game+Distribution)

This section shows the distribution of licenses across different game categories:

- Pie chart showing percentage distribution by game
- Bar chart showing total counts by game
- Active vs. inactive license comparison for each game

### License Trends

![License Trends](https://via.placeholder.com/800x300?text=License+Trends)

Track license creation and usage over time:

- Line chart showing license creation over days/weeks/months
- Comparison between created and expired licenses
- Growth rate indicators
- Seasonal pattern analysis

### User Analytics

![User Analytics](https://via.placeholder.com/800x300?text=User+Analytics)

Monitor user engagement with the license system:

- Top users by license count
- User activity heatmap
- New user acquisition rate
- User retention statistics

### License Management

![License Management](https://via.placeholder.com/800x400?text=License+Management)

Advanced license search and management interface:

- Powerful search functionality with filters for game, status, date, etc.
- Bulk operations for selected licenses
- Detailed license history and audit trails
- Export capabilities (CSV, JSON)

## Dashboard Navigation

The dashboard includes a navigation sidebar with the following sections:

- **Home**: Overview and key metrics
- **Licenses**: Comprehensive license management
- **Users**: User-focused analytics
- **Games**: Game-specific data and trends
- **Reports**: Customizable reports and exports
- **Settings**: Dashboard configuration options

## Customizing the Dashboard

Administrators can customize various aspects of the dashboard:

### Display Preferences

- Toggle between light and dark themes
- Adjust refresh rate for real-time data
- Configure default date ranges
- Choose between different chart types

### Custom Reports

Create and save custom reports with specific filters and parameters:

1. Navigate to the Reports section
2. Click "New Report"
3. Select metrics and dimensions
4. Apply filters and sorting options
5. Save the report configuration

### User Access Management

Manage who can access the dashboard:

1. Go to the Settings section
2. Select "User Access"
3. Add new access tokens with specific permissions
4. Revoke existing tokens when needed

## API Integration

The dashboard includes a built-in API client for testing API endpoints:

1. Navigate to the API section
2. Select an endpoint from the dropdown
3. Fill in required parameters
4. Execute the request and view results

## Technical Details

The dashboard is built with:

- **Frontend**: React.js with Material-UI components
- **Charts**: Chart.js for data visualization
- **State Management**: Redux for application state
- **Authentication**: JWT-based token authentication
- **Communication**: WebSocket for real-time updates

## Best Practices

- **Regular Monitoring**: Check the dashboard daily for unusual activities
- **Data Exports**: Schedule regular data exports for backup
- **Performance Analysis**: Use trend data to optimize license distribution
- **Security**: Change the dashboard access token periodically 