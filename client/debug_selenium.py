from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

def get_console_logs():
    options = Options()
    options.add_argument('--headless')
    options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        driver.get('http://localhost:5173')
        time.sleep(3)
        
        logs = driver.get_log('browser')
        for log in logs:
            if log['level'] == 'SEVERE':
                print(f"ERROR: {log['message']}")
            else:
                print(f"LOG: {log['message']}")
    except Exception as e:
        print(f"Failed: {e}")
    finally:
        driver.quit()

if __name__ == '__main__':
    get_console_logs()
