# License Validator - C# Integration Example

This folder contains a C# example application that demonstrates how to integrate with the License Manager API.

## Contents

- `LicenseValidator.cs` - A client library for validating licenses against the API
- `LoginForm.cs` - A sample Windows Forms application with login, registration, and license validation functionality

## Features

- **License Validation** - Validate license keys against the API
- **User Registration** - Register new users with license keys
- **User Login** - Basic login interface
- **Tab-based Interface** - Easy to navigate between functions

## How to Use

1. Make sure the License Manager API is running (`node api.js` in the parent directory)
2. Create a new .NET Framework Windows Forms application in Visual Studio
3. Add the `LicenseValidator.cs` and `LoginForm.cs` files to your project
4. Update the API URL in `LoginForm.cs` if it's different from the default (`http://localhost:3000`)
5. Build and run the application

## API Integration

The `LicenseValidator` class provides two methods for license validation:

```csharp
// Asynchronous validation
public async Task<LicenseValidationResult> ValidateLicenseAsync(string licenseKey)

// Synchronous validation
public LicenseValidationResult ValidateLicense(string licenseKey)
```

The validation result contains license details:

```csharp
public class LicenseValidationResult
{
    public bool Success { get; set; }  // API call success
    public string Error { get; set; }   // Error message (if any)
    public LicenseInfo License { get; set; }  // License details
}

public class LicenseInfo
{
    public string Key { get; set; }
    public string Game { get; set; }
    public string GameCode { get; set; }
    public bool IsValid { get; set; }
    public bool IsActive { get; set; }
    public bool IsExpired { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string Email { get; set; }
    public DateTime? IssueDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
}
```

## Extending the Example

This example provides a foundation for your own license-protected application. To extend it:

1. Create your main application form (e.g., `MainForm.cs`)
2. On successful login/registration, open your main form and pass user information
3. Add game-specific functionality based on the validated license
4. Consider implementing periodic license validation checks to ensure continued validity

## Requirements

- .NET Framework 4.5+ or .NET Core 3.0+
- Visual Studio 2017 or later
- Windows OS 