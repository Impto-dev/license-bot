using System;
using System.Windows.Forms;
using LicenseValidation;

namespace LicenseValidatorDemo
{
    public partial class SampleForm : Form
    {
        private readonly LicenseValidator _licenseValidator;
        
        public SampleForm()
        {
            InitializeComponent();
            
            // Initialize the license validator with your API URL
            _licenseValidator = new LicenseValidator("http://localhost:3000");
        }
        
        // This would be part of your Form's designer code
        private void InitializeComponent()
        {
            this.txtLicenseKey = new System.Windows.Forms.TextBox();
            this.lblLicenseKey = new System.Windows.Forms.Label();
            this.btnValidate = new System.Windows.Forms.Button();
            this.txtResults = new System.Windows.Forms.RichTextBox();
            this.SuspendLayout();
            
            // lblLicenseKey
            this.lblLicenseKey.AutoSize = true;
            this.lblLicenseKey.Location = new System.Drawing.Point(12, 15);
            this.lblLicenseKey.Name = "lblLicenseKey";
            this.lblLicenseKey.Size = new System.Drawing.Size(76, 16);
            this.lblLicenseKey.TabIndex = 0;
            this.lblLicenseKey.Text = "License Key:";
            
            // txtLicenseKey
            this.txtLicenseKey.Location = new System.Drawing.Point(94, 12);
            this.txtLicenseKey.Name = "txtLicenseKey";
            this.txtLicenseKey.Size = new System.Drawing.Size(320, 22);
            this.txtLicenseKey.TabIndex = 1;
            
            // btnValidate
            this.btnValidate.Location = new System.Drawing.Point(420, 11);
            this.btnValidate.Name = "btnValidate";
            this.btnValidate.Size = new System.Drawing.Size(75, 23);
            this.btnValidate.TabIndex = 2;
            this.btnValidate.Text = "Validate";
            this.btnValidate.UseVisualStyleBackColor = true;
            this.btnValidate.Click += new System.EventHandler(this.btnValidate_Click);
            
            // txtResults
            this.txtResults.Location = new System.Drawing.Point(12, 45);
            this.txtResults.Name = "txtResults";
            this.txtResults.ReadOnly = true;
            this.txtResults.Size = new System.Drawing.Size(483, 200);
            this.txtResults.TabIndex = 3;
            this.txtResults.Text = "";
            
            // SampleForm
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(507, 257);
            this.Controls.Add(this.txtResults);
            this.Controls.Add(this.btnValidate);
            this.Controls.Add(this.txtLicenseKey);
            this.Controls.Add(this.lblLicenseKey);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "SampleForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "License Validator Demo";
            this.ResumeLayout(false);
            this.PerformLayout();
        }
        
        private System.Windows.Forms.Label lblLicenseKey;
        private System.Windows.Forms.TextBox txtLicenseKey;
        private System.Windows.Forms.Button btnValidate;
        private System.Windows.Forms.RichTextBox txtResults;
        
        private async void btnValidate_Click(object sender, EventArgs e)
        {
            try
            {
                // Get the license key from the text box
                string licenseKey = txtLicenseKey.Text.Trim();
                
                if (string.IsNullOrEmpty(licenseKey))
                {
                    MessageBox.Show("Please enter a license key.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }
                
                // Disable the button during validation
                btnValidate.Enabled = false;
                btnValidate.Text = "Validating...";
                txtResults.Text = "Checking license...";
                
                // Validate the license asynchronously
                var result = await _licenseValidator.ValidateLicenseAsync(licenseKey);
                
                // Display the results
                DisplayResults(result);
            }
            catch (Exception ex)
            {
                txtResults.Text = $"Error: {ex.Message}";
            }
            finally
            {
                // Re-enable the button
                btnValidate.Enabled = true;
                btnValidate.Text = "Validate";
            }
        }
        
        private void DisplayResults(LicenseValidationResult result)
        {
            txtResults.Clear();
            
            if (!result.Success)
            {
                txtResults.Text = $"Error: {result.Error}";
                return;
            }
            
            var license = result.License;
            
            // Build a formatted result text
            txtResults.AppendText($"License Key: {license.Key}\n");
            txtResults.AppendText($"Game: {license.Game}\n");
            txtResults.AppendText($"Valid: {(license.IsValid ? "Yes" : "No")}\n");
            
            if (!license.IsValid)
            {
                if (license.IsExpired)
                {
                    txtResults.AppendText("Status: Expired\n");
                }
                else if (!license.IsActive)
                {
                    txtResults.AppendText("Status: Deactivated\n");
                }
            }
            else
            {
                txtResults.AppendText("Status: Active\n");
            }
            
            if (license.IssueDate.HasValue)
            {
                txtResults.AppendText($"Issued: {license.IssueDate.Value.ToLocalTime():yyyy-MM-dd HH:mm:ss}\n");
            }
            
            if (license.ExpirationDate.HasValue)
            {
                txtResults.AppendText($"Expires: {license.ExpirationDate.Value.ToLocalTime():yyyy-MM-dd HH:mm:ss}\n");
            }
            else
            {
                txtResults.AppendText("Expires: Never (Lifetime)\n");
            }
            
            if (!string.IsNullOrEmpty(license.UserName))
            {
                txtResults.AppendText($"Assigned to: {license.UserName}\n");
            }
            
            if (!string.IsNullOrEmpty(license.Email))
            {
                txtResults.AppendText($"Email: {license.Email}\n");
            }
        }
    }
    
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SampleForm());
        }
    }
} 