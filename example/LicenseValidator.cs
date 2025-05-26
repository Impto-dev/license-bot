using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;

namespace LicenseValidation
{
    /// <summary>
    /// License validation result from the API
    /// </summary>
    public class LicenseValidationResult
    {
        public bool Success { get; set; }
        public string Error { get; set; }
        public LicenseInfo License { get; set; }
    }

    /// <summary>
    /// License information details
    /// </summary>
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

    /// <summary>
    /// Client for validating licenses with the license server API
    /// </summary>
    public class LicenseValidator
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiUrl;

        /// <summary>
        /// Initialize a new license validator client
        /// </summary>
        /// <param name="apiUrl">Base URL of the license API (e.g., "http://localhost:3000")</param>
        public LicenseValidator(string apiUrl)
        {
            _httpClient = new HttpClient();
            _apiUrl = apiUrl.TrimEnd('/');
        }

        /// <summary>
        /// Validate a license key asynchronously
        /// </summary>
        /// <param name="licenseKey">The license key to validate</param>
        /// <returns>A validation result containing license details if successful</returns>
        public async Task<LicenseValidationResult> ValidateLicenseAsync(string licenseKey)
        {
            try
            {
                // Prepare request content
                var requestData = new { licenseKey };
                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Send request to API
                var response = await _httpClient.PostAsync($"{_apiUrl}/api/validate", content);
                var responseBody = await response.Content.ReadAsStringAsync();

                // Handle non-success status codes
                if (!response.IsSuccessStatusCode)
                {
                    // Try to parse error message from JSON if possible
                    try
                    {
                        var errorResult = JsonSerializer.Deserialize<LicenseValidationResult>(responseBody);
                        return errorResult;
                    }
                    catch
                    {
                        // If we can't parse the error, create a generic one
                        return new LicenseValidationResult
                        {
                            Success = false,
                            Error = $"API Error: {response.StatusCode} - {responseBody}"
                        };
                    }
                }

                // Parse successful response
                var result = JsonSerializer.Deserialize<LicenseValidationResult>(responseBody);
                return result;
            }
            catch (Exception ex)
            {
                // Handle any exceptions during the request
                return new LicenseValidationResult
                {
                    Success = false,
                    Error = $"Request Error: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Synchronous wrapper for ValidateLicenseAsync
        /// </summary>
        public LicenseValidationResult ValidateLicense(string licenseKey)
        {
            try
            {
                return ValidateLicenseAsync(licenseKey).GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                return new LicenseValidationResult
                {
                    Success = false,
                    Error = $"Validation Error: {ex.Message}"
                };
            }
        }
    }
} 