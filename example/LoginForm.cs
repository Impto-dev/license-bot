using System;
using System.Drawing;
using System.Windows.Forms;
using LicenseValidation;

namespace LicenseValidatorDemo
{
    public partial class LoginForm : Form
    {
        private readonly LicenseValidator _licenseValidator;
        private bool _isLoginMode = true; // Toggle between login and register mode
        
        // Form controls
        private TabControl tabControl;
        private TabPage tabLogin;
        private TabPage tabRegister;
        private TabPage tabValidate;
        
        // Login tab controls
        private TextBox txtLoginUsername;
        private TextBox txtLoginPassword;
        private Button btnLogin;
        private Label lblLoginUsername;
        private Label lblLoginPassword;
        
        // Register tab controls
        private TextBox txtRegisterUsername;
        private TextBox txtRegisterPassword;
        private TextBox txtRegisterEmail;
        private TextBox txtRegisterLicenseKey;
        private Button btnRegister;
        private Label lblRegisterUsername;
        private Label lblRegisterPassword;
        private Label lblRegisterEmail;
        private Label lblRegisterLicenseKey;
        
        // Validate tab controls
        private TextBox txtValidateLicenseKey;
        private Button btnValidate;
        private RichTextBox txtValidateResults;
        private Label lblValidateLicenseKey;
        
        public LoginForm()
        {
            InitializeComponent();
            
            // Initialize the license validator with your API URL
            _licenseValidator = new LicenseValidator("http://localhost:3000");
        }
        
        private void InitializeComponent()
        {
            this.tabControl = new TabControl();
            this.tabLogin = new TabPage();
            this.tabRegister = new TabPage();
            this.tabValidate = new TabPage();
            
            // Setup main form
            this.Text = "License Management";
            this.Size = new Size(550, 400);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            
            // Setup tab control
            this.tabControl.Dock = DockStyle.Fill;
            this.tabControl.Controls.Add(this.tabLogin);
            this.tabControl.Controls.Add(this.tabRegister);
            this.tabControl.Controls.Add(this.tabValidate);
            this.Controls.Add(this.tabControl);
            
            // Setup tabs
            this.tabLogin.Text = "Login";
            this.tabRegister.Text = "Register";
            this.tabValidate.Text = "Validate License";
            
            // Initialize tabs
            InitializeLoginTab();
            InitializeRegisterTab();
            InitializeValidateTab();
        }
        
        private void InitializeLoginTab()
        {
            // Create controls
            this.lblLoginUsername = new Label();
            this.lblLoginPassword = new Label();
            this.txtLoginUsername = new TextBox();
            this.txtLoginPassword = new TextBox();
            this.btnLogin = new Button();
            
            // Configure labels
            this.lblLoginUsername.Text = "Username:";
            this.lblLoginUsername.Location = new Point(30, 40);
            this.lblLoginUsername.Size = new Size(80, 20);
            
            this.lblLoginPassword.Text = "Password:";
            this.lblLoginPassword.Location = new Point(30, 80);
            this.lblLoginPassword.Size = new Size(80, 20);
            
            // Configure textboxes
            this.txtLoginUsername.Location = new Point(120, 40);
            this.txtLoginUsername.Size = new Size(250, 20);
            
            this.txtLoginPassword.Location = new Point(120, 80);
            this.txtLoginPassword.Size = new Size(250, 20);
            this.txtLoginPassword.UseSystemPasswordChar = true;
            
            // Configure button
            this.btnLogin.Text = "Login";
            this.btnLogin.Location = new Point(120, 120);
            this.btnLogin.Size = new Size(100, 30);
            this.btnLogin.Click += new EventHandler(this.btnLogin_Click);
            
            // Add controls to tab
            this.tabLogin.Controls.Add(this.lblLoginUsername);
            this.tabLogin.Controls.Add(this.lblLoginPassword);
            this.tabLogin.Controls.Add(this.txtLoginUsername);
            this.tabLogin.Controls.Add(this.txtLoginPassword);
            this.tabLogin.Controls.Add(this.btnLogin);
        }
        
        private void InitializeRegisterTab()
        {
            // Create controls
            this.lblRegisterUsername = new Label();
            this.lblRegisterPassword = new Label();
            this.lblRegisterEmail = new Label();
            this.lblRegisterLicenseKey = new Label();
            this.txtRegisterUsername = new TextBox();
            this.txtRegisterPassword = new TextBox();
            this.txtRegisterEmail = new TextBox();
            this.txtRegisterLicenseKey = new TextBox();
            this.btnRegister = new Button();
            
            // Configure labels
            this.lblRegisterUsername.Text = "Username:";
            this.lblRegisterUsername.Location = new Point(30, 30);
            this.lblRegisterUsername.Size = new Size(80, 20);
            
            this.lblRegisterPassword.Text = "Password:";
            this.lblRegisterPassword.Location = new Point(30, 70);
            this.lblRegisterPassword.Size = new Size(80, 20);
            
            this.lblRegisterEmail.Text = "Email:";
            this.lblRegisterEmail.Location = new Point(30, 110);
            this.lblRegisterEmail.Size = new Size(80, 20);
            
            this.lblRegisterLicenseKey.Text = "License Key:";
            this.lblRegisterLicenseKey.Location = new Point(30, 150);
            this.lblRegisterLicenseKey.Size = new Size(80, 20);
            
            // Configure textboxes
            this.txtRegisterUsername.Location = new Point(120, 30);
            this.txtRegisterUsername.Size = new Size(250, 20);
            
            this.txtRegisterPassword.Location = new Point(120, 70);
            this.txtRegisterPassword.Size = new Size(250, 20);
            this.txtRegisterPassword.UseSystemPasswordChar = true;
            
            this.txtRegisterEmail.Location = new Point(120, 110);
            this.txtRegisterEmail.Size = new Size(250, 20);
            
            this.txtRegisterLicenseKey.Location = new Point(120, 150);
            this.txtRegisterLicenseKey.Size = new Size(250, 20);
            
            // Configure button
            this.btnRegister.Text = "Register";
            this.btnRegister.Location = new Point(120, 190);
            this.btnRegister.Size = new Size(100, 30);
            this.btnRegister.Click += new EventHandler(this.btnRegister_Click);
            
            // Add controls to tab
            this.tabRegister.Controls.Add(this.lblRegisterUsername);
            this.tabRegister.Controls.Add(this.lblRegisterPassword);
            this.tabRegister.Controls.Add(this.lblRegisterEmail);
            this.tabRegister.Controls.Add(this.lblRegisterLicenseKey);
            this.tabRegister.Controls.Add(this.txtRegisterUsername);
            this.tabRegister.Controls.Add(this.txtRegisterPassword);
            this.tabRegister.Controls.Add(this.txtRegisterEmail);
            this.tabRegister.Controls.Add(this.txtRegisterLicenseKey);
            this.tabRegister.Controls.Add(this.btnRegister);
        }
        
        private void InitializeValidateTab()
        {
            // Create controls
            this.lblValidateLicenseKey = new Label();
            this.txtValidateLicenseKey = new TextBox();
            this.btnValidate = new Button();
            this.txtValidateResults = new RichTextBox();
            
            // Configure label
            this.lblValidateLicenseKey.Text = "License Key:";
            this.lblValidateLicenseKey.Location = new Point(30, 30);
            this.lblValidateLicenseKey.Size = new Size(80, 20);
            
            // Configure textbox
            this.txtValidateLicenseKey.Location = new Point(120, 30);
            this.txtValidateLicenseKey.Size = new Size(280, 20);
            
            // Configure button
            this.btnValidate.Text = "Validate";
            this.btnValidate.Location = new Point(410, 28);
            this.btnValidate.Size = new Size(80, 25);
            this.btnValidate.Click += new EventHandler(this.btnValidate_Click);
            
            // Configure results textbox
            this.txtValidateResults.Location = new Point(30, 70);
            this.txtValidateResults.Size = new Size(460, 220);
            this.txtValidateResults.ReadOnly = true;
            
            // Add controls to tab
            this.tabValidate.Controls.Add(this.lblValidateLicenseKey);
            this.tabValidate.Controls.Add(this.txtValidateLicenseKey);
            this.tabValidate.Controls.Add(this.btnValidate);
            this.tabValidate.Controls.Add(this.txtValidateResults);
        }
        
        private void btnLogin_Click(object sender, EventArgs e)
        {
            // In a real application, this would authenticate with your server
            string username = txtLoginUsername.Text.Trim();
            string password = txtLoginPassword.Text;
            
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                MessageBox.Show("Please enter both username and password.", "Login Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            
            // For demo purposes, just show a success message
            MessageBox.Show($"Login successful for user: {username}", "Success", 
                MessageBoxButtons.OK, MessageBoxIcon.Information);
            
            // In a real app, you would navigate to the main application form
            // MainForm mainForm = new MainForm(username);
            // mainForm.Show();
            // this.Hide();
        }
        
        private async void btnRegister_Click(object sender, EventArgs e)
        {
            string username = txtRegisterUsername.Text.Trim();
            string password = txtRegisterPassword.Text;
            string email = txtRegisterEmail.Text.Trim();
            string licenseKey = txtRegisterLicenseKey.Text.Trim();
            
            // Basic validation
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                MessageBox.Show("Username and password are required.", "Registration Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            
            if (string.IsNullOrEmpty(licenseKey))
            {
                MessageBox.Show("Please enter a license key.", "Registration Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }
            
            // Validate the license key
            btnRegister.Enabled = false;
            btnRegister.Text = "Validating...";
            
            try
            {
                var result = await _licenseValidator.ValidateLicenseAsync(licenseKey);
                
                if (!result.Success || !result.License.IsValid)
                {
                    string errorMsg = result.Success ? "License is not valid." : result.Error;
                    MessageBox.Show($"Invalid license: {errorMsg}", "Registration Error", 
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }
                
                // In a real application, you would register the user in your database
                MessageBox.Show($"Registration successful for {username}!\nYour license for {result.License.Game} has been activated.", 
                    "Registration Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                // Clear the form
                txtRegisterUsername.Clear();
                txtRegisterPassword.Clear();
                txtRegisterEmail.Clear();
                txtRegisterLicenseKey.Clear();
                
                // Switch to login tab
                tabControl.SelectedTab = tabLogin;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error validating license: {ex.Message}", "Error", 
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                btnRegister.Enabled = true;
                btnRegister.Text = "Register";
            }
        }
        
        private async void btnValidate_Click(object sender, EventArgs e)
        {
            try
            {
                // Get the license key from the text box
                string licenseKey = txtValidateLicenseKey.Text.Trim();
                
                if (string.IsNullOrEmpty(licenseKey))
                {
                    MessageBox.Show("Please enter a license key.", "Error", 
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }
                
                // Disable the button during validation
                btnValidate.Enabled = false;
                btnValidate.Text = "Validating...";
                txtValidateResults.Text = "Checking license...";
                
                // Validate the license asynchronously
                var result = await _licenseValidator.ValidateLicenseAsync(licenseKey);
                
                // Display the results
                DisplayResults(result);
            }
            catch (Exception ex)
            {
                txtValidateResults.Text = $"Error: {ex.Message}";
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
            txtValidateResults.Clear();
            
            if (!result.Success)
            {
                txtValidateResults.Text = $"Error: {result.Error}";
                return;
            }
            
            var license = result.License;
            
            // Build a formatted result text
            txtValidateResults.AppendText($"License Key: {license.Key}\n");
            txtValidateResults.AppendText($"Game: {license.Game}\n");
            txtValidateResults.AppendText($"Valid: {(license.IsValid ? "Yes" : "No")}\n");
            
            if (!license.IsValid)
            {
                if (license.IsExpired)
                {
                    txtValidateResults.AppendText("Status: Expired\n");
                }
                else if (!license.IsActive)
                {
                    txtValidateResults.AppendText("Status: Deactivated\n");
                }
            }
            else
            {
                txtValidateResults.AppendText("Status: Active\n");
            }
            
            if (license.IssueDate.HasValue)
            {
                txtValidateResults.AppendText($"Issued: {license.IssueDate.Value.ToLocalTime():yyyy-MM-dd HH:mm:ss}\n");
            }
            
            if (license.ExpirationDate.HasValue)
            {
                txtValidateResults.AppendText($"Expires: {license.ExpirationDate.Value.ToLocalTime():yyyy-MM-dd HH:mm:ss}\n");
            }
            else
            {
                txtValidateResults.AppendText("Expires: Never (Lifetime)\n");
            }
            
            if (!string.IsNullOrEmpty(license.UserName))
            {
                txtValidateResults.AppendText($"Assigned to: {license.UserName}\n");
            }
            
            if (!string.IsNullOrEmpty(license.Email))
            {
                txtValidateResults.AppendText($"Email: {license.Email}\n");
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
            Application.Run(new LoginForm());
        }
    }
} 