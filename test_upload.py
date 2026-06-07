import requests
import os

URL = "http://localhost:8080/upload"
FILES_TO_TEST = ["sample_data.csv", "test.csv", "test.xlsx"]

def test_upload(file_path):
    print(f"Testing upload for {file_path}...")
    if not os.path.exists(file_path):
        print(f"File {file_path} not found. Skipping.")
        return
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        try:
            response = requests.post(URL, files=files)
            if response.status_code == 200:
                print(f"SUCCESS: {file_path} uploaded. Summary shape: {response.json().get('summary', {}).get('shape')}")
            else:
                print(f"FAILED: {file_path} returned {response.status_code}: {response.text}")
        except Exception as e:
            print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    for file in FILES_TO_TEST:
        test_upload(file)
