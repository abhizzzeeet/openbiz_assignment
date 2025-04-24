from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json


# def extract_input_fields(soup):
#     fields = []
#     for input_tag in soup.find_all("input"):
#         if input_tag.get("type") == "hidden":
#             continue  # skip hidden inputs

#         # Get all attributes as a dictionary
#         field = dict(input_tag.attrs)
#         fields.append(field)
#     return fields

def extract_aadhar_fields(soup):
    card_body = soup.find("div", class_="card card-primary")
    if not card_body:
        return []

    elements_data = []

    for tag in card_body.find_all(["label", "input"], recursive=True):
        # Get only non-empty attributes
        attributes = {k: v for k, v in tag.attrs.items() if v}

        element_info = {
            "tag": tag.name,
            "attributes": attributes
        }

        # Add text only if it's non-empty (labels only usually have text)
        text = tag.get_text(strip=True)
        if text:
            element_info["text"] = text

        elements_data.append(element_info)

    return elements_data

def extract_otp_fields(soup):
    card_body = soup.find("div", id="ctl00_ContentPlaceHolder1_divaadhaarotp")
    if not card_body:
        return []

    elements_data = []

    for tag in card_body.find_all(["label", "input"], recursive=True):
        # Get only non-empty attributes
        attributes = {k: v for k, v in tag.attrs.items() if v}

        element_info = {
            "tag": tag.name,
            "attributes": attributes
        }

        # Add text only if it's non-empty (labels only usually have text)
        text = tag.get_text(strip=True)
        if text:
            element_info["text"] = text

        elements_data.append(element_info)

    return elements_data

def extract_pan_fields(soup):
    card_body = soup.find("div", class_="card card-success")
    if not card_body:
        return []

    elements_data = []

    for tag in card_body.find_all(["label", "input","select", "option"], recursive=True):
        
        # parent_div = tag.find_parent("div")
        # if parent_div and parent_div.get('style') and 'display:none' in parent_div['style']:
        #     continue  
        
        # Get only non-empty attributes
        attributes = {k: v for k, v in tag.attrs.items() if v}

        element_info = {
            "tag": tag.name,
            "attributes": attributes
        }

        # Add text only if it's non-empty (labels only usually have text)
        text = tag.get_text(strip=True)
        if text:
            element_info["text"] = text

        elements_data.append(element_info)

    return elements_data

# def extract_input_fields_and_labels(soup):
#     input_fields = []
#     labels = []

#     # Extract all visible input fields
#     for input_tag in soup.find_all("input"):
#         if input_tag.get("type") == "hidden":
#             continue  # Skip hidden inputs

#         field = dict(input_tag.attrs)
#         input_fields.append(field)

#     # Extract all labels, preserving their text and 'for' attribute (if any)
#     for label_tag in soup.find_all("label"):
#         label_info = {
#             "for": label_tag.get("for"),
#             "text": label_tag.get_text(strip=True)
#         }
#         labels.append(label_info)

#     return {
#         "inputs": input_fields,
#         "labels": labels
#     }


def scrape_aadhaar_and_pan():
    chrome_options = Options()
    driver = webdriver.Chrome(options=chrome_options)

    try:
        driver.get("https://udyamregistration.gov.in/UdyamRegistration.aspx")

        # Step 1: Aadhaar + Name input
        aadhaar = input("Enter Aadhaar number: ")
        name = input("Enter name (as per Aadhaar): ")
        
        # Extract Aadhaar form fields
        soup_aadhaar = BeautifulSoup(driver.page_source, "lxml")
        aadhaar_fields = extract_aadhar_fields(soup_aadhaar)

        driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtadharno").send_keys(aadhaar)
        driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtownername").send_keys(name)
        # driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_chkDecarationA").click()
        driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_btnValidateAadhaar").click()

        
        otp = input("Enter the OTP received: ")
        driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtOtp1").send_keys(otp)
        driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_btnValidate").click()
        
        # Extract OTP form fields
        soup_otp = BeautifulSoup(driver.page_source, "lxml")
        otp_fields = extract_otp_fields(soup_otp)        

        # Step 3: Wait for PAN section to load
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPlaceHolder1_divpanmain"))
        )

        # Final extraction
        soup_pan = BeautifulSoup(driver.page_source, "lxml")
        pan_fields = extract_pan_fields(soup_pan)

        result = {
            "aadhaar_step": {
                "fields": aadhaar_fields
            },
            "otp_step": {
                "fields": otp_fields
            },
            "pan_verification": {
                "fields": pan_fields
            }
        }

        return result

    finally:
        driver.quit()

# def scrape_aadhaar_and_pan():
#     chrome_options = Options()
#     driver = webdriver.Chrome(options=chrome_options)

#     try:
#         driver.get("https://udyamregistration.gov.in/UdyamRegistration.aspx")

#         # === Step 1: Aadhaar Entry ===
#         aadhaar = input("Enter Aadhaar number: ")
#         name = input("Enter name (as per Aadhaar): ")

#         driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtadharno").send_keys(aadhaar)
#         driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtownername").send_keys(name)
#         driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_chkDecarationA").click()
        
#         # Extract Aadhaar form fields
#         soup_aadhaar = BeautifulSoup(driver.page_source, "lxml")
#         aadhaar_fields = extract_input_fields(soup_aadhaar)

#         driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_btnValidateAadhaar").click()

#         # === Step 2: OTP ===
#         otp = input("Enter the OTP received: ")
#         driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_txtOtp1").send_keys(otp)
#         driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_btnValidate").click()

#         # Extract OTP form fields
#         soup_otp = BeautifulSoup(driver.page_source, "lxml")
#         otp_fields = extract_input_fields(soup_otp)

#         # === Step 3: Wait for PAN section ===
#         WebDriverWait(driver, 30).until(
#             EC.presence_of_element_located((By.ID, "ctl00_ContentPlaceHolder1_divpanmain"))
#         )

#         # Extract PAN section fields
#         soup_pan = BeautifulSoup(driver.page_source, "lxml")
#         pan_fields = extract_input_fields(soup_pan)

#         result = {
#             "aadhaar_step": {
#                 "fields": aadhaar_fields
#             },
#             "otp_step": {
#                 "fields": otp_fields
#             },
#             "pan_verification": {
#                 "fields": pan_fields
#             }
#         }

#         return result

#     finally:
#         driver.quit()
