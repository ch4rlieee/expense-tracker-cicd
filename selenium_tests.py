import unittest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from datetime import date

class ExpenseTrackerTests(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """Set up Chrome driver with headless options"""
        chrome_options = Options()
        
        # Essential Chrome arguments for Docker/headless environment
        chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-software-rasterizer')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-setuid-sandbox')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--remote-debugging-port=9222')
        chrome_options.add_argument('--disable-dev-tools')
        chrome_options.add_argument('--disable-background-networking')
        chrome_options.add_argument('--disable-default-apps')
        chrome_options.add_argument('--disable-sync')
        chrome_options.add_argument('--metrics-recording-only')
        chrome_options.add_argument('--mute-audio')
        
        # Additional stability options
        chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Initialize the driver
        cls.driver = webdriver.Chrome(options=chrome_options)
        cls.driver.implicitly_wait(20)
        
        # Application URL - use Docker network alias
        cls.base_url = "http://webapp:8080"
    
    @classmethod
    def tearDownClass(cls):
        """Close the browser after all tests"""
        cls.driver.quit()
    
    def setUp(self):
        """Navigate to home page before each test"""
        self.driver.get(self.base_url)
        time.sleep(2)  # Wait for page to load
    
    def test_01_page_title_and_elements(self):
        """Test Case 1: Verify that the page loads correctly with all elements"""
        print("\n=== Running Test 1: Page Title and Elements ===")
        
        # Verify page title
        self.assertIn("Expense Tracker", self.driver.title)
        print("✓ Page title verified")
        
        # Verify main heading
        heading = self.driver.find_element(By.TAG_NAME, "h1")
        self.assertEqual(heading.text, "Expense Tracker")
        print("✓ Main heading found")
        
        # Verify input fields exist
        title_input = self.driver.find_element(By.ID, "title")
        self.assertIsNotNone(title_input)
        print("✓ Title input field found")
        
        amount_input = self.driver.find_element(By.ID, "amount")
        self.assertIsNotNone(amount_input)
        print("✓ Amount input field found")
        
        category_input = self.driver.find_element(By.ID, "category")
        self.assertIsNotNone(category_input)
        print("✓ Category input field found")
        
        date_input = self.driver.find_element(By.ID, "date")
        self.assertIsNotNone(date_input)
        print("✓ Date input field found")
        
        # Verify Add button exists
        add_button = self.driver.find_element(By.ID, "addBtn")
        self.assertIsNotNone(add_button)
        self.assertEqual(add_button.text, "Add")
        print("✓ Add button found")
        
        # Verify table exists
        table = self.driver.find_element(By.TAG_NAME, "table")
        self.assertIsNotNone(table)
        print("✓ Expenses table found")
        
        print("✓✓✓ Test 1 PASSED: All page elements verified successfully")
    
    def test_02_add_expense_functionality(self):
        """Test Case 2: Add a new expense and verify it appears in the list"""
        print("\n=== Running Test 2: Add Expense Functionality ===")
        
        # Fill in the form
        title_input = self.driver.find_element(By.ID, "title")
        title_input.clear()
        title_input.send_keys("Test Coffee")
        print("✓ Entered title: Test Coffee")
        
        amount_input = self.driver.find_element(By.ID, "amount")
        amount_input.clear()
        amount_input.send_keys("5.50")
        print("✓ Entered amount: 5.50")
        
        category_input = self.driver.find_element(By.ID, "category")
        category_input.clear()
        category_input.send_keys("Food")
        print("✓ Entered category: Food")
        
        date_input = self.driver.find_element(By.ID, "date")
        date_input.clear()
        today = date.today().strftime("%Y-%m-%d")
        date_input.send_keys(today)
        print(f"✓ Entered date: {today}")
        
        # Click Add button
        add_button = self.driver.find_element(By.ID, "addBtn")
        add_button.click()
        print("✓ Clicked Add button")
        
        # Wait for the expense to be added
        time.sleep(2)
        
        # Verify the expense appears in the table
        try:
            # Wait for table body to have rows
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "#tbody tr"))
            )
            
            tbody = self.driver.find_element(By.ID, "tbody")
            rows = tbody.find_elements(By.TAG_NAME, "tr")
            
            # Check if we have at least one row
            self.assertGreater(len(rows), 0, "No expenses found in table")
            print(f"✓ Found {len(rows)} expense(s) in table")
            
            # Verify the first row contains our test data
            first_row = rows[0]
            cells = first_row.find_elements(By.TAG_NAME, "td")
            
            # Check title
            self.assertIn("Test Coffee", cells[0].text)
            print(f"✓ Title verified: {cells[0].text}")
            
            # Check amount
            self.assertIn("5.50", cells[1].text)
            print(f"✓ Amount verified: {cells[1].text}")
            
            # Check category
            self.assertIn("Food", cells[2].text)
            print(f"✓ Category verified: {cells[2].text}")
            
            # Verify stats section updated
            stats = self.driver.find_element(By.ID, "stats")
            self.assertIsNotNone(stats)
            stats_text = stats.text
            self.assertIn("Total:", stats_text)
            print(f"✓ Stats section updated: {stats_text}")
            
            print("✓✓✓ Test 2 PASSED: Expense added and verified successfully")
            
        except Exception as e:
            print(f"✗ Test 2 FAILED: {str(e)}")
            # Take a screenshot for debugging
            self.driver.save_screenshot("/test-results/test_02_failure.png")
            raise

def suite():
    """Create test suite"""
    test_suite = unittest.TestSuite()
    # Use TestLoader instead of deprecated makeSuite
    test_suite.addTests(unittest.TestLoader().loadTestsFromTestCase(ExpenseTrackerTests))
    return test_suite

if __name__ == "__main__":
    # Run tests with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite())
    
    # Exit with appropriate code
    exit(0 if result.wasSuccessful() else 1)
