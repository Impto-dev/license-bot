# 🔄 C# Integration

The Discord License Manager Bot includes ready-to-use C# components that allow you to easily integrate license validation into your .NET applications.

## Overview

The C# integration package consists of:

1. **LicenseValidator Library**: Core library for license validation and management
2. **Sample Implementation**: Example code showing how to use the library
3. **UI Controls**: Optional WPF/WinForms controls for license activation

## Getting Started

### Requirements

- .NET Framework 4.7.2+ or .NET Core 3.1+ / .NET 5.0+
- Visual Studio 2019+ or other C# development environment
- Active internet connection for license validation

### Installation

#### Option 1: Direct File Reference

1. Download the `LicenseValidator.cs` file from the project
2. Add it to your C# project
3. Adjust the namespace if needed

#### Option 2: NuGet Package (Recommended)

```
Install-Package DiscordLicenseManager.Client
```

Or using the .NET CLI:

```
dotnet add package DiscordLicenseManager.Client
```

## Basic Usage

### Initialize the Validator

```csharp
using DiscordLicenseManager;

// Create a validator instance with your API endpoint
var validator = new LicenseValidator("https://your-api-url.com");

// Optionally provide your API key
validator.SetApiKey("your-api-key");
```

### Validate a License

```csharp
// Simple validation
bool isValid = await validator.ValidateLicenseAsync("F-XXXX-XXXX-XXXX");

// Validation with detailed information
var result = await validator.GetLicenseDetailsAsync("F-XXXX-XXXX-XXXX");

if (result.IsValid)
{
    Console.WriteLine($"License is valid for {result.Game}");
    Console.WriteLine($"Expires on: {result.ExpirationDate}");
    
    if (result.AssignedUser != null)
    {
        Console.WriteLine($"Assigned to: {result.AssignedUser.Username}");
    }
}
```

### License Activation

```csharp
// Activate a license for the current user
var activationResult = await validator.ActivateLicenseAsync(
    "F-XXXX-XXXX-XXXX", 
    Environment.MachineName, 
    GetHardwareId()
);

if (activationResult.Success)
{
    // Store activation information locally
    SaveActivationData(activationResult.ActivationToken);
}
```

### Hardware ID Generation

The library includes a helper method to generate a unique hardware ID:

```csharp
string hardwareId = LicenseValidator.GenerateHardwareId();
```

This creates a unique identifier based on:
- CPU information
- Motherboard serial
- Primary disk serial
- MAC address

## Advanced Features

### Offline Validation

For applications that need to work offline:

```csharp
// During online activation, save the license data
var licenseData = await validator.GetLicenseDataForOfflineUse("F-XXXX-XXXX-XXXX");
SaveLicenseData(licenseData);

// Later, validate offline
var offlineValidator = new OfflineLicenseValidator();
bool isValid = offlineValidator.ValidateLicense(LoadLicenseData());
```

### License Caching

Improve performance by caching license validation results:

```csharp
// Enable caching with a specific duration
validator.EnableCaching(TimeSpan.FromMinutes(30));

// First call will contact the server
var result1 = await validator.ValidateLicenseAsync("F-XXXX-XXXX-XXXX");

// Subsequent calls within the cache period will use cached data
var result2 = await validator.ValidateLicenseAsync("F-XXXX-XXXX-XXXX");
```

### Event Handling

Subscribe to license-related events:

```csharp
validator.LicenseExpiring += (sender, e) => {
    MessageBox.Show($"Your license will expire in {e.DaysRemaining} days");
};

validator.LicenseValidated += (sender, e) => {
    Console.WriteLine("License validated successfully");
};

validator.ValidationFailed += (sender, e) => {
    Console.WriteLine($"Validation failed: {e.ErrorMessage}");
};
```

## Sample Implementation

### Basic License Check

```csharp
using System;
using System.Windows.Forms;
using DiscordLicenseManager;

namespace MyApplication
{
    public partial class MainForm : Form
    {
        private LicenseValidator _validator;
        private bool _isLicensed = false;

        public MainForm()
        {
            InitializeComponent();
            InitializeLicenseValidator();
        }

        private async void InitializeLicenseValidator()
        {
            _validator = new LicenseValidator("https://your-api-url.com");
            
            // Try to load saved license
            string savedLicense = Properties.Settings.Default.LicenseKey;
            
            if (!string.IsNullOrEmpty(savedLicense))
            {
                try
                {
                    var result = await _validator.ValidateLicenseAsync(savedLicense);
                    
                    if (result)
                    {
                        _isLicensed = true;
                        EnablePremiumFeatures();
                    }
                    else
                    {
                        ShowActivationDialog();
                    }
                }
                catch (Exception ex)
                {
                    // Handle offline scenario
                    MessageBox.Show("Could not validate license online. Running in limited mode.");
                }
            }
            else
            {
                ShowActivationDialog();
            }
        }

        private void ShowActivationDialog()
        {
            using (var dialog = new LicenseActivationForm(_validator))
            {
                if (dialog.ShowDialog() == DialogResult.OK)
                {
                    _isLicensed = true;
                    Properties.Settings.Default.LicenseKey = dialog.LicenseKey;
                    Properties.Settings.Default.Save();
                    EnablePremiumFeatures();
                }
            }
        }

        private void EnablePremiumFeatures()
        {
            // Enable premium features in your application
        }
    }
}
```

### License Activation Form

```csharp
using System;
using System.Windows.Forms;
using DiscordLicenseManager;

namespace MyApplication
{
    public partial class LicenseActivationForm : Form
    {
        private readonly LicenseValidator _validator;
        
        public string LicenseKey { get; private set; }
        
        public LicenseActivationForm(LicenseValidator validator)
        {
            InitializeComponent();
            _validator = validator;
        }
        
        private async void btnActivate_Click(object sender, EventArgs e)
        {
            string licenseKey = txtLicenseKey.Text.Trim();
            
            if (string.IsNullOrEmpty(licenseKey))
            {
                MessageBox.Show("Please enter a license key");
                return;
            }
            
            btnActivate.Enabled = false;
            lblStatus.Text = "Validating license...";
            
            try
            {
                var result = await _validator.ValidateLicenseAsync(licenseKey);
                
                if (result)
                {
                    LicenseKey = licenseKey;
                    DialogResult = DialogResult.OK;
                    Close();
                }
                else
                {
                    lblStatus.Text = "Invalid license key";
                    btnActivate.Enabled = true;
                }
            }
            catch (Exception ex)
            {
                lblStatus.Text = "Error: " + ex.Message;
                btnActivate.Enabled = true;
            }
        }
    }
}
```

## Security Considerations

The C# integration includes several security features:

- **Tamper Protection**: License data is cryptographically signed
- **Hardware Binding**: Licenses can be bound to specific hardware
- **Obfuscation**: The library is designed to work with code obfuscation tools
- **API Key Protection**: API keys are never stored in plain text in the client

## Troubleshooting

### Common Issues

#### Cannot Connect to License Server

- Check internet connectivity
- Verify the API URL is correct
- Ensure the server is running and accessible

#### License Shows as Invalid

- Verify the license key is entered correctly
- Check if the license has expired
- Ensure the license is assigned to the correct user

#### Offline Validation Fails

- Make sure the license was properly activated online first
- Check if the hardware ID has changed significantly
- Verify the system date has not been tampered with

## Support

For issues with the C# integration:

- Check the provided sample code for reference
- Review the API documentation for endpoint details
- Contact support through the Discord server 