from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json


def extract_aadhar_fields(soup):
    card_body = soup.find("div", class_="card card-primary")
    if not card_body:
        return []

    elements_data = []

    for tag in card_body.find_all(["label", "input"], recursive=True):
        # Skip checkbox inputs
        if tag.name == "input" and tag.get("type", "").lower() == "checkbox":
            continue
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
    # IDs of the OTP input div and the Validate button div
    div_ids = [
        "ctl00_ContentPlaceHolder1_divaadhaarotp",
        None  # The second div has no ID, but it's the next sibling and has class 'form-group'
    ]

    elements_data = []

    # Get the main OTP input div
    otp_div = soup.find("div", id=div_ids[0])
    if otp_div:
        for tag in otp_div.find_all(["label", "input"], recursive=True):
            attributes = {k: v for k, v in tag.attrs.items() if v}
            element_info = {
                "tag": tag.name,
                "attributes": attributes
            }
            text = tag.get_text(strip=True)
            if text:
                element_info["text"] = text
            elements_data.append(element_info)

        # Find the next sibling 'form-group' div (contains Validate button)
        validate_div = otp_div.find_next_sibling("div", class_="form-group")
        if validate_div:
            for tag in validate_div.find_all(["input"], recursive=True):
                attributes = {k: v for k, v in tag.attrs.items() if v}
                element_info = {
                    "tag": tag.name,
                    "attributes": attributes
                }
                text = tag.get_text(strip=True)
                if text:
                    element_info["text"] = text
                elements_data.append(element_info)

    return elements_data


# def extract_pan_fields(soup):
#     card_body = soup.find("div", class_="card card-success")
#     if not card_body:
#         return []

#     elements_data = []

#     for tag in card_body.find_all(["label", "input","select", "option"], recursive=True):
        
#         # parent_div = tag.find_parent("div")
#         # if parent_div and parent_div.get('style') and 'display:none' in parent_div['style']:
#         #     continue  
        
#         # Get only non-empty attributes
#         attributes = {k: v for k, v in tag.attrs.items() if v}

#         element_info = {
#             "tag": tag.name,
#             "attributes": attributes
#         }

#         # Add text only if it's non-empty (labels only usually have text)
#         text = tag.get_text(strip=True)
#         if text:
#             element_info["text"] = text

#         elements_data.append(element_info)

#     return elements_data

def extract_pan_fields(soup):
    card_body = soup.find("div", class_="card card-success")
    if not card_body:
        return []

    elements_data = []

    for tag in card_body.find_all(["label", "input", "select", "option"], recursive=True):
        # Skip checkbox inputs
        if tag.name == "input" and tag.get("type", "").lower() == "checkbox":
            continue
        
        # Skip tag if any parent <div> has style="display:none"
        parent = tag
        hidden = False
        while parent:
            if parent.name == "div":
                style = parent.get("style", "")
                if "display:none" in style.replace(" ", "").lower():
                    hidden = True
                    break
            parent = parent.parent
        if hidden:
            continue

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

